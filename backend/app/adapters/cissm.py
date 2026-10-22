import os
import csv
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.adapters.base import BaseAdapter
from backend.app.models.source import DataSource
from backend.app.models.incident import CyberIncident
from backend.app.services.normalizer import (
    normalize_date,
    normalize_sector,
    normalize_country,
    normalize_attack_type,
    calculate_severity
)
from backend.app.services.deduplication import generate_dedup_key, compute_raw_hash
from backend.app.config import RAW_DATA_DIR

logger = logging.getLogger("ncri.adapters.cissm")

class CISSMAdapter(BaseAdapter):
    def __init__(self):
        super().__init__("cissm", "UMD CISSM Cyber Events Database")

    def ingest(self, db: Session, max_records: Optional[int] = None) -> Dict[str, Any]:
        source = db.query(DataSource).filter_by(slug=self.source_slug).first()
        if not source:
            raise ValueError(f"DataSource with slug '{self.source_slug}' not found.")

        csv_file = RAW_DATA_DIR / "cissm_events.csv"
        if not os.path.exists(csv_file):
            raise FileNotFoundError(f"Source file not found at {csv_file}")

        stats = {
            "total_processed": 0,
            "records_ingested": 0,
            "records_skipped": 0,
            "records_updated": 0,
            "errors": 0
        }

        # Track keys already in database or current session
        existing_keys = {
            r[0] for r in db.query(CyberIncident.deduplication_key).all()
        }

        with open(csv_file, mode="r", encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f)
            
            for idx, row in enumerate(reader):
                if max_records and stats["total_processed"] >= max_records:
                    break

                stats["total_processed"] += 1
                try:
                    org = (row.get("organization") or "Unknown Organization").strip()
                    evt_date_raw = row.get("evtDate") or ""
                    norm_date, year, month = normalize_date(evt_date_raw)
                    
                    industry = row.get("industry")
                    industry_code = row.get("industry_code")
                    sector = normalize_sector(industry, industry_code)
                    
                    country_name, country_code, region = normalize_country(row.get("country"))
                    
                    event_type = row.get("event_type")
                    event_subtype = row.get("event_subtype")
                    description = row.get("description") or ""
                    attack_type = normalize_attack_type(event_type, event_subtype, description)
                    
                    actor = row.get("actor") or "Unknown"
                    if actor.lower() in ["undetermined", "unknown", "n/a", ""]:
                        actor = None
                        
                    severity_label, sev_score, impact_level = calculate_severity(
                        None, None, sector, attack_type
                    )
                    
                    source_url = row.get("source_url") or ""
                    ref_id = f"CISSM-{norm_date}-{idx:06d}"
                    
                    dedup_key = generate_dedup_key(
                        source_slug=self.source_slug,
                        incident_ref="",  # Use fingerprint
                        victim_name=org,
                        incident_date=norm_date,
                        attack_type=attack_type
                    )
                    
                    raw_str = f"{norm_date}|{org}|{sector}|{attack_type}|{description}"
                    curr_raw_hash = compute_raw_hash(raw_str)
                    
                    if dedup_key in existing_keys:
                        # Duplicate within current batch or database
                        existing = db.query(CyberIncident).filter_by(deduplication_key=dedup_key).first()
                        if existing and existing.raw_data_hash != curr_raw_hash:
                            existing.title = f"{attack_type} against {org}"[:255]
                            existing.description = description
                            existing.incident_date = norm_date
                            existing.year = year
                            existing.month = month
                            existing.victim_name = org
                            existing.sector = sector
                            existing.subsector = industry
                            existing.country = country_name
                            existing.country_code = country_code
                            existing.region = region
                            existing.attack_type = attack_type
                            existing.attack_subtype = event_subtype
                            existing.threat_actor = actor
                            existing.actor_type = row.get("actor_type")
                            existing.actor_country = row.get("actor_country")
                            existing.motive = row.get("motive")
                            existing.severity = severity_label
                            existing.severity_score = sev_score
                            existing.impact_level = impact_level
                            existing.source_url = source_url
                            existing.raw_data_hash = curr_raw_hash
                            stats["records_updated"] += 1
                        else:
                            stats["records_skipped"] += 1
                        continue

                    # If new record
                    new_inc = CyberIncident(
                        incident_ref=ref_id,
                        source_id=source.id,
                        title=f"{attack_type} targeting {org}"[:255],
                        description=description,
                        incident_date=norm_date,
                        year=year,
                        month=month,
                        victim_name=org,
                        sector=sector,
                        subsector=industry,
                        country=country_name,
                        country_code=country_code,
                        region=region,
                        attack_type=attack_type,
                        attack_subtype=event_subtype,
                        threat_actor=actor,
                        actor_type=row.get("actor_type"),
                        actor_country=row.get("actor_country"),
                        motive=row.get("motive"),
                        severity=severity_label,
                        severity_score=sev_score,
                        impact_level=impact_level,
                        source_url=source_url,
                        raw_data_hash=curr_raw_hash,
                        deduplication_key=dedup_key
                    )
                    db.add(new_inc)
                    existing_keys.add(dedup_key)
                    stats["records_ingested"] += 1
                        
                    if stats["total_processed"] % 500 == 0:
                        db.commit()
                        logger.info(f"CISSM ingestion progress: {stats['total_processed']} processed...")

                except Exception as row_err:
                    db.rollback()
                    stats["errors"] += 1
                    logger.debug(f"Error parsing CISSM row {idx}: {row_err}")

        db.commit()
        return stats
