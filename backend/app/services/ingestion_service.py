from datetime import datetime
import json
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.source import DataSource
from backend.app.models.ingestion import IngestionRun
from backend.app.adapters.cissm import CISSMAdapter
from backend.app.adapters.ransomware_live import RansomwareLiveAdapter
from backend.app.adapters.cisa_kev import CisaKevAdapter
from backend.app.adapters.india_national import IndiaNationalAdapter
from backend.app.adapters.custom_csv import CustomUploadAdapter

logger = logging.getLogger("ncri.services.ingestion")

ADAPTER_REGISTRY = {
    "cissm": CISSMAdapter,
    "ransomware_live": RansomwareLiveAdapter,
    "cisa_kev": CisaKevAdapter,
    "india_national": IndiaNationalAdapter,
}

class IngestionService:
    @staticmethod
    def run_ingestion_for_source(
        db: Session,
        slug: str,
        max_records: Optional[int] = None,
        custom_file_path: Optional[str] = None
    ) -> IngestionRun:
        source = db.query(DataSource).filter_by(slug=slug).first()
        if not source:
            raise ValueError(f"DataSource with slug '{slug}' not found.")

        # Create IngestionRun record
        run = IngestionRun(
            source_id=source.id,
            status="running",
            started_at=datetime.utcnow()
        )
        db.add(run)
        db.commit()
        db.refresh(run)

        source.last_sync_status = "running"
        db.commit()

        try:
            adapter = None
            if slug == "custom_upload":
                if not custom_file_path:
                    raise ValueError("custom_file_path required for custom_upload")
                adapter = CustomUploadAdapter(file_path=custom_file_path)
            elif slug in ADAPTER_REGISTRY:
                adapter = ADAPTER_REGISTRY[slug]()
            else:
                raise ValueError(f"No adapter registered for source slug '{slug}'")

            logger.info(f"Starting ingestion run #{run.id} for source '{slug}'")
            stats = adapter.ingest(db=db, max_records=max_records)

            run.status = "completed"
            run.completed_at = datetime.utcnow()
            run.total_processed = stats.get("total_processed", 0)
            run.records_ingested = stats.get("records_ingested", 0)
            run.records_skipped = stats.get("records_skipped", 0)
            run.records_updated = stats.get("records_updated", 0)
            run.run_metadata = json.dumps(stats)

            source.last_sync_at = datetime.utcnow()
            source.last_sync_status = "success"
            db.commit()
            db.refresh(run)

            logger.info(
                f"Completed run #{run.id} for {slug}: "
                f"Ingested {run.records_ingested}, Skipped {run.records_skipped}, Updated {run.records_updated}."
            )

            # Auto-recalculate NCRI index when new data arrives
            try:
                from backend.app.services.risk_engine import RiskEngine
                RiskEngine.calculate_all_sector_risks(db=db)
            except Exception as re_err:
                logger.warning(f"Failed to auto-update risk assessments after ingestion: {re_err}")

            return run

        except Exception as e:
            db.rollback()
            run.status = "failed"
            run.completed_at = datetime.utcnow()
            run.error_message = str(e)
            source.last_sync_status = "failed"
            db.commit()
            db.refresh(run)
            logger.error(f"Ingestion run #{run.id} failed for source '{slug}': {e}", exc_info=True)
            return run

    @staticmethod
    def run_all_active_sources(db: Session, max_records_per_source: Optional[int] = None) -> list[IngestionRun]:
        runs = []
        sources = db.query(DataSource).filter_by(is_active=True).all()
        for src in sources:
            if src.slug == "custom_upload":
                continue  # Skip custom upload in bulk automatic run
            run = IngestionService.run_ingestion_for_source(
                db=db,
                slug=src.slug,
                max_records=max_records_per_source
            )
            runs.append(run)
        return runs
