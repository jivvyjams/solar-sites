import sqlite3
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app import energy, pvgis
from app.auth import current_user, require_csrf
from app.db import get_db
from app.schemas import BatteryOut, ProductionOut, SiteIn, SiteOut

router = APIRouter(prefix="/api/sites")


def get_owned_site(
    site_id: uuid.UUID, user: sqlite3.Row, db: sqlite3.Connection
) -> sqlite3.Row:
    site = db.execute(
        "SELECT * FROM sites WHERE id = ? AND user_id = ?",
        (str(site_id), user["id"]),
    ).fetchone()
    if site is None:
        raise HTTPException(status_code=404, detail="Site not found")
    return site


@router.get("")
def list_sites(
    user: Annotated[sqlite3.Row, Depends(current_user)],
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> list[SiteOut]:
    rows = db.execute(
        "SELECT * FROM sites WHERE user_id = ? ORDER BY client_name",
        (user["id"],),
    ).fetchall()
    return [SiteOut.model_validate(dict(row)) for row in rows]


@router.post("", status_code=201)
def create_site(
    site: SiteIn,
    user: Annotated[sqlite3.Row, Depends(require_csrf)],
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> SiteOut:
    site_id = str(uuid.uuid4())
    db.execute(
        "INSERT INTO sites (id, user_id, client_name, address, "
        "latitude, longitude, roof_area_m2, peak_kwp) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            site_id,
            user["id"],
            site.client_name,
            site.address,
            site.latitude,
            site.longitude,
            site.roof_area_m2,
            site.peak_kwp,
        ),
    )
    db.commit()
    return SiteOut(id=site_id, **site.model_dump())


@router.get("/{site_id}")
def get_site(
    site_id: uuid.UUID,
    user: Annotated[sqlite3.Row, Depends(current_user)],
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> SiteOut:
    site = get_owned_site(site_id, user, db)
    return SiteOut.model_validate(dict(site))


@router.put("/{site_id}")
def update_site(
    site_id: uuid.UUID,
    site: SiteIn,
    user: Annotated[sqlite3.Row, Depends(require_csrf)],
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> SiteOut:
    get_owned_site(site_id, user, db)
    db.execute(
        "UPDATE sites SET client_name = ?, address = ?, latitude = ?, "
        "longitude = ?, roof_area_m2 = ?, peak_kwp = ? "
        "WHERE id = ? AND user_id = ?",
        (
            site.client_name,
            site.address,
            site.latitude,
            site.longitude,
            site.roof_area_m2,
            site.peak_kwp,
            str(site_id),
            user["id"],
        ),
    )
    db.commit()
    return SiteOut(id=str(site_id), **site.model_dump())


@router.delete("/{site_id}", status_code=204)
def delete_site(
    site_id: uuid.UUID,
    user: Annotated[sqlite3.Row, Depends(require_csrf)],
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> None:
    get_owned_site(site_id, user, db)
    db.execute(
        "DELETE FROM sites WHERE id = ? AND user_id = ?",
        (str(site_id), user["id"]),
    )
    db.commit()


@router.get("/{site_id}/production")
def get_production(
    site_id: uuid.UUID,
    user: Annotated[sqlite3.Row, Depends(current_user)],
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> ProductionOut:
    site = get_owned_site(site_id, user, db)
    data = pvgis.fetch_pvcalc(site["latitude"], site["longitude"], site["peak_kwp"])
    return ProductionOut.model_validate(pvgis.to_production(data))


@router.get("/{site_id}/battery")
def get_battery(
    site_id: uuid.UUID,
    capacity_kwh: Annotated[float, Query(alias="capacityKwh", ge=0, le=1000)],
    annual_use_kwh: Annotated[float, Query(alias="annualUseKwh", gt=0, le=1_000_000)],
    user: Annotated[sqlite3.Row, Depends(current_user)],
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> BatteryOut:
    site = get_owned_site(site_id, user, db)
    production = pvgis.fetch_seriescalc(
        site["latitude"], site["longitude"], site["peak_kwp"]
    )
    use = energy.hourly_use(annual_use_kwh, len(production))
    without_battery = energy.simulate(production, use, 0)
    with_battery = energy.simulate(production, use, capacity_kwh)
    gain = with_battery["self_used_kwh"] - without_battery["self_used_kwh"]
    return BatteryOut(
        production_kwh=round(sum(production), 1),
        consumption_kwh=annual_use_kwh,
        capacity_kwh=capacity_kwh,
        without_battery=without_battery,
        with_battery=with_battery,
        battery_gain_kwh=round(gain, 1),
    )
