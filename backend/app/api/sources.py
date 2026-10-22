import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.source import DataSource
from backend.app.models.ingestion import IngestionRun
from backend.app.models.incident import CyberIncident
from backend.app.services.ingestion_service import IngestionService
from backend.app.schemas.ingestion import (
    DataSourceResponse,
    IngestionRunResponse,
    SyncTriggerResponse
)
from backend.app.config import RAW_DATA_DIR

router = APIRouter(prefix="/sources", tags=["Data Sources & Ingestion"])

@router.get("", response_model=List[DataSourceResponse])
def list_sources(db: Session = Depends(get_db)):
    sources = db.query(DataSource).all()
    results = []
    for s in sources:
        inc_cnt = db.query(CyberIncident).filter_by(source_id=s.id).count()
        r = DataSourceResponse(
            id=s.id,
            slug=s.slug,
            name=s.name,
            description=s.description,
            source_type=s.source_type,
            base_url=s.base_url,
            update_frequency=s.update_frequency,
            license=s.license,
            is_active=s.is_active,
            last_sync_at=s.last_sync_at,
            last_sync_status=s.last_sync_status,
            incident_count=inc_cnt
        )
        results.append(r)
    return results

@router.post("/{slug}/sync", response_model=SyncTriggerResponse)
def trigger_sync(slug: str, max_records: Optional[int] = None, db: Session = Depends(get_db)):
    source = db.query(DataSource).filter_by(slug=slug).first()
    if not source:
        raise HTTPException(status_code=404, detail=f"Source with slug '{slug}' not found")

    run = IngestionService.run_ingestion_for_source(db=db, slug=slug, max_records=max_records)
    
    return SyncTriggerResponse(
        source_slug=slug,
        status=run.status,
        message=f"Sync completed. Ingested: {run.records_ingested}, Skipped: {run.records_skipped}, Updated: {run.records_updated}",
        run_id=run.id
    )

@router.get("/{slug}/runs", response_model=List[IngestionRunResponse])
def get_source_runs(slug: str, limit: int = 10, db: Session = Depends(get_db)):
    source = db.query(DataSource).filter_by(slug=slug).first()
    if not source:
        raise HTTPException(status_code=404, detail=f"Source with slug '{slug}' not found")

    runs = db.query(IngestionRun).filter_by(source_id=source.id).order_by(
        desc(IngestionRun.started_at)
    ).limit(limit).all()

    return [
        IngestionRunResponse(
            id=r.id,
            source_id=r.source_id,
            source_name=source.name,
            status=r.status,
            started_at=r.started_at,
            completed_at=r.completed_at,
            total_processed=r.total_processed,
            records_ingested=r.records_ingested,
            records_skipped=r.records_skipped,
            records_updated=r.records_updated,
            error_message=r.error_message
        ) for r in runs
    ]

@router.post("/upload", response_model=SyncTriggerResponse)
def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".csv", ".json")):
        raise HTTPException(status_code=400, detail="Only .csv and .json files are supported.")

    upload_path = RAW_DATA_DIR / f"upload_{file.filename}"
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    run = IngestionService.run_ingestion_for_source(
        db=db,
        slug="custom_upload",
        custom_file_path=str(upload_path)
    )

    return SyncTriggerResponse(
        source_slug="custom_upload",
        status=run.status,
        message=f"Upload ingestion {run.status}. Ingested: {run.records_ingested}, Skipped: {run.records_skipped}, Updated: {run.records_updated}",
        run_id=run.id
    )
