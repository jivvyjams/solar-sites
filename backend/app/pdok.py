import httpx
from fastapi import HTTPException

PDOK_URL = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free"


def fetch_json(params: dict) -> dict:
    try:
        response = httpx.get(PDOK_URL, params=params, timeout=10)
    except httpx.HTTPError:
        raise HTTPException(
            status_code=502, detail="Address lookup is unavailable"
        ) from None
    if response.status_code != 200:
        raise HTTPException(status_code=502, detail="Address lookup is unavailable")
    return response.json()


def to_address(doc: dict) -> dict:
    point = doc["centroide_ll"].removeprefix("POINT(").removesuffix(")")
    longitude, latitude = point.split()
    return {
        "address": doc["weergavenaam"],
        "latitude": round(float(latitude), 5),
        "longitude": round(float(longitude), 5),
    }


def lookup_address(postcode: str, house_number: int) -> dict:
    postcode = postcode.replace(" ", "").upper()
    params = {
        "q": f"postcode:{postcode} AND huisnummer:{house_number}",
        "fq": "type:adres",
        "rows": 1,
        "fl": "weergavenaam,centroide_ll",
    }
    data = fetch_json(params)
    if data["response"]["numFound"] == 0:
        raise HTTPException(
            status_code=422,
            detail="No address found for this postcode and house number",
        )
    return to_address(data["response"]["docs"][0])
