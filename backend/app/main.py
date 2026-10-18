from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.db import init_db
from app.routers import address, auth, health, sites

app = FastAPI()
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(sites.router)
app.include_router(address.router)

init_db()

STATIC_DIR = Path("static")

if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"))

    @app.get("/{rest:path}")
    def serve_frontend(rest: str) -> FileResponse:
        if rest == "api" or rest.startswith("api/"):
            raise HTTPException(status_code=404)
        return FileResponse(STATIC_DIR / "index.html")
