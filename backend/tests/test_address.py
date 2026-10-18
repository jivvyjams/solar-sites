import pytest
from fastapi.testclient import TestClient
from test_sites import log_in

from app import pdok

FOUND = {
    "response": {
        "numFound": 1,
        "docs": [
            {
                "weergavenaam": "Binnenhof 1, 2513AA 's-Gravenhage",
                "centroide_ll": "POINT(4.31215331 52.07913814)",
            }
        ],
    }
}
EMPTY = {"response": {"numFound": 0, "docs": []}}


def test_lookup_returns_address_and_coordinates(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    sent = {}

    def fake_fetch(params: dict) -> dict:
        sent.update(params)
        return FOUND

    monkeypatch.setattr(pdok, "fetch_json", fake_fetch)
    log_in(client, "ann@example.com")

    response = client.get(
        "/api/address-lookup", params={"postcode": "2513 aa", "houseNumber": 1}
    )

    assert response.status_code == 200
    assert response.json() == {
        "address": "Binnenhof 1, 2513AA 's-Gravenhage",
        "latitude": 52.07914,
        "longitude": 4.31215,
    }
    assert sent["q"] == "postcode:2513AA AND huisnummer:1"


def test_lookup_with_no_match_returns_422(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(pdok, "fetch_json", lambda params: EMPTY)
    log_in(client, "ann@example.com")

    response = client.get(
        "/api/address-lookup", params={"postcode": "2517AS", "houseNumber": 120}
    )

    assert response.status_code == 422
    assert response.json() == {
        "detail": "No address found for this postcode and house number"
    }


def test_lookup_rejects_malformed_postcode(client: TestClient) -> None:
    log_in(client, "ann@example.com")

    response = client.get(
        "/api/address-lookup", params={"postcode": "12345", "houseNumber": 1}
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["query", "postcode"]


def test_lookup_without_session_returns_401(client: TestClient) -> None:
    response = client.get(
        "/api/address-lookup", params={"postcode": "2513AA", "houseNumber": 1}
    )

    assert response.status_code == 401
