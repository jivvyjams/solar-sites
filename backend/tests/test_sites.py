from fastapi.testclient import TestClient

from app.main import app

SITE = {
    "clientName": "Acme BV",
    "address": "Main St 1",
    "latitude": 52.08,
    "longitude": 4.31,
    "peakKwp": 5,
}


def log_in(client: TestClient, email: str) -> TestClient:
    response = client.post(
        "/api/register", json={"email": email, "password": "Secret123!"}
    )
    client.headers["X-CSRF-Token"] = response.json()["csrfToken"]
    return client


def test_create_returns_201_and_roof_area_is_optional(client: TestClient) -> None:
    log_in(client, "ann@example.com")
    response = client.post("/api/sites", json=SITE)
    assert response.status_code == 201
    assert response.json()["clientName"] == "Acme BV"
    assert response.json()["roofAreaM2"] is None
    assert "id" in response.json()


def test_list_shows_only_own_sites(client: TestClient) -> None:
    ann = log_in(client, "ann@example.com")
    bob = log_in(TestClient(app), "bob@example.com")
    ann.post("/api/sites", json=SITE)
    assert len(ann.get("/api/sites").json()) == 1
    assert bob.get("/api/sites").json() == []


def test_other_users_site_returns_404(client: TestClient) -> None:
    ann = log_in(client, "ann@example.com")
    bob = log_in(TestClient(app), "bob@example.com")
    site_id = ann.post("/api/sites", json=SITE).json()["id"]
    assert bob.get(f"/api/sites/{site_id}").status_code == 404
    assert bob.put(f"/api/sites/{site_id}", json=SITE).status_code == 404
    assert bob.delete(f"/api/sites/{site_id}").status_code == 404
    assert ann.get(f"/api/sites/{site_id}").status_code == 200


def test_invalid_site_returns_422_per_field(client: TestClient) -> None:
    log_in(client, "ann@example.com")
    bad = {**SITE, "clientName": "", "latitude": 95, "peakKwp": 0}
    response = client.post("/api/sites", json=bad)
    assert response.status_code == 422
    fields = {error["loc"][-1] for error in response.json()["detail"]}
    assert fields == {"clientName", "latitude", "peakKwp"}


def test_create_without_csrf_header_returns_403(client: TestClient) -> None:
    log_in(client, "ann@example.com")
    del client.headers["X-CSRF-Token"]
    assert client.post("/api/sites", json=SITE).status_code == 403


def test_update_then_delete(client: TestClient) -> None:
    log_in(client, "ann@example.com")
    site_id = client.post("/api/sites", json=SITE).json()["id"]
    response = client.put(f"/api/sites/{site_id}", json={**SITE, "peakKwp": 8})
    assert response.status_code == 200
    assert response.json()["peakKwp"] == 8
    assert client.delete(f"/api/sites/{site_id}").status_code == 204
    assert client.get(f"/api/sites/{site_id}").status_code == 404
