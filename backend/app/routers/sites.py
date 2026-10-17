import sqlite3
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app import pvgis
from app.auth import current_user, require_csrf
from app.db import get_db
from app.schemas import ProductionOut, SiteIn, SiteOut

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
def get_prodcution(
    site_id: uuid.UUID,
    user: Annotated[sqlite3.Row, Depends(current_user)],
    db: Annotated[sqlite3.Connection, Depends(get_db)],
) -> ProductionOut:
    site = get_owned_site(site_id, user, db)
    data = pvgis.fetch_pvcalc(site["latitude"], site["longitude"], site["peak_kwp"])
    return ProductionOut.model_validate(pvgis.to_production(data))
