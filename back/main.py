from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import donations, items, modes, categories, promocodes, orders, auth, statistics, settings, server_status, admins, banlist, game_modes, banners, robokassa, leaderboards
from app.database import engine, Base, SessionLocal
from app.models import Admin
import os
import logging


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Plasmix Donation API",
    description="API для управления донатами сервера Plasmix",
    version="1.0.0",
    docs_url="/api/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/api/redoc" if os.getenv("ENVIRONMENT") == "development" else None,
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admins.router, prefix="/api/admins", tags=["Admins"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(statistics.router, prefix="/api/statistics", tags=["Statistics"])
app.include_router(server_status.router, prefix="/api/server-status", tags=["Server Status"])
app.include_router(banlist.router, prefix="/api/banlist", tags=["Banlist"])
app.include_router(game_modes.router, prefix="/api/game-modes", tags=["Game Modes"])
app.include_router(banners.router, prefix="/api/banners", tags=["Banners"])
app.include_router(robokassa.router, prefix="/api/robokassa", tags=["Robokassa"])
app.include_router(leaderboards.router, tags=["Leaderboards"])
app.include_router(donations.router, prefix="/api/donations", tags=["Donations"])
app.include_router(items.router, prefix="/api/items", tags=["Items"])
app.include_router(modes.router, prefix="/api/modes", tags=["Modes"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(promocodes.router, prefix="/api/promocodes", tags=["Promocodes"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])

@app.get("/")
async def root():
    return {
        "message": "Plasmix Donation API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

