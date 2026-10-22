import os
import csv
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
    normalize_attack_type,
    calculate_severity
)
from backend.app.services.deduplication import generate_dedup_key, compute_raw_hash

logger = logging.getLogger("ncri.adapters.custom_csv")

class CustomUploadAdapter(BaseAdapter):
    def __init__(self, file_path: str):
        super().__init__("custom_upload", "User Uploaded Incident Dataset")
        self.file_path = file_path

    def ingest(self, db: Session, max_records: Optional[int] = None) -> Dict[str, Any]:
        source = db.query(DataSource).filter_by(slug=self.source_slug).first()
        if not source:
            source = DataSource(
                slug=self.source_slug,
                name=self.source_name,
                source_type="file_upload",
                is_active=True
            )
            db.add(source)
            db.commit()
            db.refresh(source)

        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"Uploaded file not found at {self.file_path}")

        stats = {
            "total_processed": 0,
            "records_ingested": 0,
            "records_skipped": 0,
            "records_updated": 0,
            "errors": 0
        }

        # Check file extension
        is_json = self.file_path.endswith(".json")

        records_to_process = []
        if is_json:
            with open(self.file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                records_to_process = data if isinstance(data, list) else data.get("incidents", [])
        else:
            with open(self.file_path, mode="r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                records_to_process = list(reader)

        for idx, row in enumerate(records_to_process):
            if max_records and stats["total_processed"] >= max_records:
                break

            stats["total_processed"] += 1
            try:
                # Flexible column detection
                victim = (
                    row.get("victim_name") or row.get("victim") or row.get("organization") or
                    row.get("target") or row.get("company") or "Target Entity"
                ).strip()

                raw_date = row.get("date") or row.get("incident_date") or row.get("evtDate") or row.get("attackdate") or ""
                norm_date, year, month = normalize_date(raw_date)

                raw_sec = row.get("sector") or row.get("industry") or row.get("activity") or ""
                sector = normalize_sector(raw_sec)

                raw_country = row.get("country") or row.get("location") or "Unknown"
                country_name, country_code, region = normalize_country(raw_country)

                raw_type = row.get("attack_type") or row.get("type") or row.get("event_type") or ""
                desc = row.get("description") or row.get("details") or f"Incident involving {victim}"
                attack_type = normalize_attack_type(raw_type, None, desc)

                ref_id = row.get("id") or row.get("incident_id") or f"UPLOAD-{idx:04d}"

                records_aff = None
                for k in ["records_affected", "records", "affected_records"]:
                    if row.get(k):
                        try:
                            records_aff = int(float(str(row.get(k)).strip()))
                            break
                        except ValueError:
                            pass

                sev_label, sev_score, impact_lvl = calculate_severity(
                    row.get("severity"),
                    records_aff,
                    sector,
                    attack_type
                )

                dedup_key = generate_dedup_key(
                    source_slug=self.source_slug,
                    incident_ref=ref_id,
                    victim_name=victim,
                    incident_date=norm_date,
                    attack_type=attack_type
                )

                raw_str = f"{ref_id}|{norm_date}|{victim}|{sector}|{attack_type}"
                curr_hash = compute_raw_hash(raw_str)

                existing = db.query(CyberIncident).filter_by(deduplication_key=dedup_key).first()
                if existing:
                    if existing.raw_data_hash == curr_hash:
                        stats["records_skipped"] += 1
                        continue
                    else:
                        existing.title = f"{attack_type} against {victim}"[:255]
                        existing.description = desc
                        existing.incident_date = norm_date
                        existing.year = year
                        existing.month = month
                        existing.victim_name = victim
                        existing.sector = sector
                        existing.country = country_name
                        existing.country_code = country_code
                        existing.region = region
                        existing.severity = sev_label
                        existing.severity_score = sev_score
                        existing.impact_level = impact_lvl
                        existing.records_affected = records_aff
                        existing.raw_data_hash = curr_hash
                        stats["records_updated"] += 1
                else:
                    new_inc = CyberIncident(
                        incident_ref=ref_id[:100],
                        source_id=source.id,
                        title=f"{attack_type} targeting {victim}"[:255],
                        description=desc,
                        incident_date=norm_date,
                        year=year,
                        month=month,
                        victim_name=victim,
                        sector=sector,
                        country=country_name,
                        country_code=country_code,
                        region=region,
                        attack_type=attack_type,
                        threat_actor=row.get("threat_actor") or row.get("actor") or row.get("group"),
                        severity=sev_label,
                        severity_score=sev_score,
                        impact_level=impact_lvl,
                        records_affected=records_aff,
                        source_url=row.get("source_url") or row.get("url"),
                        raw_data_hash=curr_hash,
                        deduplication_key=dedup_key
                    )
                    db.add(new_inc)
                    stats["records_ingested"] += 1

            except Exception as e:
                stats["errors"] += 1
                logger.debug(f"Error parsing uploaded row {idx}: {e}")

        db.commit()
        return stats
