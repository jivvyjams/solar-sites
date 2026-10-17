import json
from pathlib import Path

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from test_sites import SITE, log_in

from app import pvgis

FIXTURE = Path(__file__).parent / "fixtures" / "pvcalc.json"


def test_production_maps_pvgis_output(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    data = json.loads(FIXTURE.read_text())

    def fake_fetch(lat: float, lon: float, kwp: float) -> dict:
        return data

    monkeypatch.setattr(pvgis, "fetch_pvcalc", fake_fetch)
    log_in(client, "ann@example.com")
    site_id = client.post("/api/sites", json=SITE).json()["id"]

    response = client.get(f"/api/sites/{site_id}/production")

    assert response.status_code == 200
    body = response.json()
    assert body["yearlyKwh"] == 5341.0
    assert len(body["monthlyKwh"]) == 12
    assert body["monthlyKwh"][0] == {"month": 1, "kwh": 191.6}


def test_production_with_no_pvgis_data_returns_422(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def no_data(lat: float, lon: float, kwp: float) -> dict:
        raise HTTPException(
            status_code=422, detail="PVGIS has no data for this location"
        )

    monkeypatch.setattr(pvgis, "fetch_pvcalc", no_data)
    log_in(client, "ann@example.com")
    site_id = client.post("/api/sites", json=SITE).json()["id"]

    response = client.get(f"/api/sites/{site_id}/production")

    assert response.status_code == 422
    assert response.json() == {"detail": "PVGIS has no data for this location"}
