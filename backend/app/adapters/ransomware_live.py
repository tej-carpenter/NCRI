import os
import json
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
    calculate_severity
)
from backend.app.services.deduplication import generate_dedup_key, compute_raw_hash
from backend.app.config import RAW_DATA_DIR

logger = logging.getLogger("ncri.adapters.ransomware_live")

class RansomwareLiveAdapter(BaseAdapter):
    def __init__(self):
        super().__init__("ransomware_live", "Ransomware.live Threat Feed")

    def ingest(self, db: Session, max_records: Optional[int] = None) -> Dict[str, Any]:
        source = db.query(DataSource).filter_by(slug=self.source_slug).first()
        if not source:
            raise ValueError(f"DataSource with slug '{self.source_slug}' not found.")

        primary_file = RAW_DATA_DIR / "ransomware_live_2026.json"
        secondary_file = RAW_DATA_DIR / "ransomware_live_recent.json"
        
        target_file = primary_file if os.path.exists(primary_file) else secondary_file
        if not os.path.exists(target_file):
            raise FileNotFoundError(f"Ransomware.live files not found in {RAW_DATA_DIR}")

        stats = {
            "total_processed": 0,
            "records_ingested": 0,
            "records_skipped": 0,
            "records_updated": 0,
            "errors": 0
        }

        with open(target_file, "r", encoding="utf-8") as f:
            records = json.load(f)

        if not isinstance(records, list):
            logger.warning(f"Unexpected JSON format in {target_file}")
            return stats

        attack_type = "Ransomware & Extortion"
        existing_keys = {
            r[0] for r in db.query(CyberIncident.deduplication_key).all()
        }

        for idx, item in enumerate(records):
            if max_records and stats["total_processed"] >= max_records:
                break

            stats["total_processed"] += 1
            try:
                victim = (item.get("victim") or "Unknown Organization").strip()
                group = (item.get("group") or "Unknown Ransomware Actor").strip()
                activity = item.get("activity")
                sector = normalize_sector(activity)
                
                raw_date = item.get("attackdate") or item.get("discovered") or ""
                norm_date, year, month = normalize_date(raw_date)
                
                country_name, country_code, region = normalize_country(item.get("country"))
                description = item.get("description") or f"Ransomware attack executed by {group} demanding extortion payload."
                domain = item.get("domain") or ""
                if domain:
                    description += f" Target domain: {domain}."
                    
                severity_label, sev_score, impact_level = calculate_severity(
                    "High", None, sector, attack_type
                )
                
                ref_id = item.get("url") or f"RL-{victim}-{norm_date}"
                
                dedup_key = generate_dedup_key(
                    source_slug=self.source_slug,
                    incident_ref="",
                    victim_name=victim,
                    incident_date=norm_date,
                    attack_type=attack_type
                )
                
                raw_str = f"{norm_date}|{victim}|{group}|{country_code}|{sector}"
                curr_raw_hash = compute_raw_hash(raw_str)
                
                if dedup_key in existing_keys:
                    existing = db.query(CyberIncident).filter_by(deduplication_key=dedup_key).first()
                    if existing and existing.raw_data_hash != curr_raw_hash:
                        existing.title = f"Ransomware extortion against {victim} by {group}"[:255]
                        existing.description = description
                        existing.incident_date = norm_date
                        existing.year = year
                        existing.month = month
                        existing.victim_name = victim
                        existing.sector = sector
                        existing.country = country_name
                        existing.country_code = country_code
                        existing.region = region
                        existing.threat_actor = group
                        existing.severity = severity_label
                        existing.severity_score = sev_score
                        existing.impact_level = impact_level
                        existing.raw_data_hash = curr_raw_hash
                        stats["records_updated"] += 1
                    else:
                        stats["records_skipped"] += 1
                    continue

                new_inc = CyberIncident(
                    incident_ref=ref_id[:100],
                    source_id=source.id,
                    title=f"Ransomware extortion against {victim} by {group}"[:255],
                    description=description,
                    incident_date=norm_date,
                    year=year,
                    month=month,
                    victim_name=victim,
                    sector=sector,
                    subsector=activity,
                    country=country_name,
                    country_code=country_code,
                    region=region,
                    attack_type=attack_type,
                    attack_subtype=f"Ransomware ({group})",
                    threat_actor=group,
                    actor_type="Criminal Syndicate",
                    motive="Financial Extortion",
                    severity=severity_label,
                    severity_score=sev_score,
                    impact_level=impact_level,
                    source_url=item.get("url"),
                    raw_data_hash=curr_raw_hash,
                    deduplication_key=dedup_key
                )
                db.add(new_inc)
                existing_keys.add(dedup_key)
                stats["records_ingested"] += 1

                if stats["total_processed"] % 500 == 0:
                    db.commit()

            except Exception as e:
                db.rollback()
                stats["errors"] += 1
                logger.debug(f"Error parsing Ransomware.live item {idx}: {e}")

        db.commit()
        return stats
