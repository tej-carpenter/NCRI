from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from backend.app.database import get_db, active_db_url
from backend.app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {e}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": {
            "status": db_status,
            "type": "postgresql" if "postgresql" in active_db_url else "sqlite"
        },
        "timestamp": datetime.utcnow().isoformat()
    }
