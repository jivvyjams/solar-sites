import json
from pathlib import Path

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from test_sites import SITE, log_in

from app import pvgis

PV_FIXTURE = Path(__file__).parent / "fixtures" / "pvcalc.json"
SERIES_FIXTURE = Path(__file__).parent / "fixtures" / "seriescalc.json"


def test_production_maps_pvgis_output(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    data = json.loads(PV_FIXTURE.read_text())

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


def test_to_hourly_kwh_converts_watts_to_kwh() -> None:
    data = json.loads(SERIES_FIXTURE.read_text())

    hourly = pvgis.to_hourly_kwh(data)

    assert len(hourly) == 24
    assert hourly[0] == 0
    assert hourly[12] == pytest.approx(3.7724)


def test_battery_compares_without_and_with(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    hourly = pvgis.to_hourly_kwh(json.loads(SERIES_FIXTURE.read_text()))

    def fake_fetch(lat: float, lon: float, kwp: float) -> list[float]:
        return hourly

    monkeypatch.setattr(pvgis, "fetch_seriescalc", fake_fetch)
    log_in(client, "ann@example.com")
    site_id = client.post("/api/sites", json=SITE).json()["id"]

    response = client.get(
        f"/api/sites/{site_id}/battery",
        params={"capacityKwh": 5, "annualUseKwh": 3500},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["withoutBattery"]["selfUsedKwh"] == 4.0
    assert body["withBattery"]["selfUsedKwh"] == 8.1
    assert body["batteryGainKwh"] == 4.1


def test_battery_with_negative_capacity_returns_422(client: TestClient) -> None:
    log_in(client, "ann@example.com")
    site_id = client.post("/api/sites", json=SITE).json()["id"]

    response = client.get(
        f"/api/sites/{site_id}/battery",
        params={"capacityKwh": -1, "annualUseKwh": 3500},
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["query", "capacityKwh"]
