import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.config import settings
from backend.app.database import init_db
from backend.app.api.health import router as health_router
from backend.app.api.incidents import router as incidents_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.risk import router as risk_router
from backend.app.api.sources import router as sources_router
from backend.app.api.vulnerabilities import router as vulnerabilities_router
from backend.app.api.reports import router as reports_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ncri.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing National Cyber Incident Analytics Platform...")
    init_db()
    logger.info("Database and core registry initialized successfully.")
    yield
    logger.info("Shutting down NCRI platform.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="National Cyber Incident Analytics Platform for Trend Analysis and Risk Assessment",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(incidents_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(risk_router, prefix=settings.API_PREFIX)
app.include_router(sources_router, prefix=settings.API_PREFIX)
app.include_router(vulnerabilities_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "message": "Welcome to the National Cyber Incident Analytics Platform (NCRI)",
        "docs_url": "/docs",
        "health_check": f"{settings.API_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
