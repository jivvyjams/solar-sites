from functools import lru_cache

import httpx
from fastapi import HTTPException

PVCALC_URL = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc"
SERIESCALC_URL = "https://re.jrc.ec.europa.eu/api/v5_3/seriescalc"


def fetch_json(url: str, params: dict) -> dict:
    try:
        response = httpx.get(url, params=params, timeout=30)
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="PVGIS is unavailable") from None
    if response.status_code == 400:
        raise HTTPException(
            status_code=422, detail="PVGIS has no data for this location"
        )
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="PVGIS is unavailable")
    return response.json()


@lru_cache(maxsize=128)
def fetch_pvcalc(lat: float, lon: float, kwp: float) -> dict:
    params = {
        "lat": lat,
        "lon": lon,
        "peakpower": kwp,
        "loss": 14,
        "optimalangles": 1,
        "outputformat": "json",
    }
    return fetch_json(PVCALC_URL, params)


@lru_cache(maxsize=128)
def fetch_seriescalc(lat: float, lon: float, kwp: float) -> list[float]:
    params = {
        "lat": lat,
        "lon": lon,
        "peakpower": kwp,
        "loss": 14,
        "optimalangles": 1,
        "pvcalculation": 1,
        "startyear": 2023,
        "endyear": 2023,
        "outputformat": "json",
    }
    return to_hourly_kwh(fetch_json(SERIESCALC_URL, params))


def to_production(data: dict) -> dict:
    return {
        "yearly_kwh": round(data["outputs"]["totals"]["fixed"]["E_y"], 1),
        "monthly_kwh": [
            {"month": row["month"], "kwh": round(row["E_m"], 1)}
            for row in data["outputs"]["monthly"]["fixed"]
        ],
    }


def to_hourly_kwh(data: dict) -> list[float]:
    return [row["P"] / 1000 for row in data["outputs"]["hourly"]]
