from fastapi.testclient import TestClient
from httpx import Response

EMAIL = "ann@example.com"
PASSWORD = "secret123"


def register(client: TestClient, email: str = EMAIL) -> Response:
    return client.post("/api/register", json={"email": email, "password": PASSWORD})


def test_register_returns_201_and_sets_cookie(client: TestClient) -> None:
    response = register(client)
    assert response.status_code == 201
    assert response.json()["email"] == EMAIL
    assert "csrfToken" in response.json()
    assert "httponly" in response.headers["set-cookie"].lower()


def test_register_duplicate_email_returns_409(client: TestClient) -> None:
    register(client)
    response = register(client, email="ANN@example.com")
    assert response.status_code == 409


def test_login_then_me_returns_email(client: TestClient) -> None:
    register(client)
    client.cookies.clear()
    response = client.post("/api/login", json={"email": EMAIL, "password": PASSWORD})
    assert response.status_code == 200
    assert client.get("/api/me").json()["email"] == EMAIL


def test_login_wrong_password_returns_401(client: TestClient) -> None:
    register(client)
    response = client.post("/api/login", json={"email": EMAIL, "password": "wrongpass"})
    assert response.status_code == 401


def test_me_without_cookie_returns_401(client: TestClient) -> None:
    assert client.get("/api/me").status_code == 401


def test_logout_without_csrf_header_returns_403(client: TestClient) -> None:
    register(client)
    assert client.post("/api/logout").status_code == 403


def test_logout_deletes_the_session(client: TestClient) -> None:
    csrf_token = register(client).json()["csrfToken"]
    old_cookie = client.cookies["session"]
    response = client.post("/api/logout", headers={"X-CSRF-Token": csrf_token})
    assert response.status_code == 204
    client.cookies.set("session", old_cookie)
    assert client.get("/api/me").status_code == 401
