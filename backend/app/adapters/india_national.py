import os
import csv
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.adapters.base import BaseAdapter
from backend.app.models.source import DataSource
from backend.app.models.incident import CyberIncident
from backend.app.models.vulnerability import Vulnerability
from backend.app.models.incident_vulnerability import IncidentVulnerability
from backend.app.services.normalizer import (
    normalize_date,
    normalize_sector,
    normalize_country,
    normalize_attack_type,
    calculate_severity
)
from backend.app.services.deduplication import generate_dedup_key, compute_raw_hash
from backend.app.config import RAW_DATA_DIR

logger = logging.getLogger("ncri.adapters.india_national")

class IndiaNationalAdapter(BaseAdapter):
    def __init__(self):
        super().__init__("india_national", "India National Cyber Incident Track (CERT-In / MeitY)")

    def ingest(self, db: Session, max_records: Optional[int] = None) -> Dict[str, Any]:
        source = db.query(DataSource).filter_by(slug=self.source_slug).first()
        if not source:
            raise ValueError(f"DataSource with slug '{self.source_slug}' not found.")

        csv_file = RAW_DATA_DIR / "india_national_incidents.csv"
        if not os.path.exists(csv_file):
            raise FileNotFoundError(f"National dataset not found at {csv_file}")

        stats = {
            "total_processed": 0,
            "records_ingested": 0,
            "records_skipped": 0,
            "records_updated": 0,
            "errors": 0,
            "links_created": 0
        }

        with open(csv_file, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            
            for idx, row in enumerate(reader):
                if max_records and stats["total_processed"] >= max_records:
                    break

                stats["total_processed"] += 1
                try:
                    ref_id = row.get("incident_id", f"IN-INC-{idx:03d}")
                    raw_date = row.get("date")
                    norm_date, year, month = normalize_date(raw_date)
                    victim = row.get("victim_name", "National Entity")
                    sector = normalize_sector(row.get("sector"))
                    state_prov = row.get("state_province")
                    
                    attack_type = normalize_attack_type(row.get("attack_type"), None, row.get("description"))
                    threat_actor = row.get("threat_actor")
                    
                    records_aff = None
                    if row.get("records_affected") and row.get("records_affected").strip():
                        try:
                            records_aff = int(float(row.get("records_affected").strip()))
                        except ValueError:
                            pass

                    sev_label, sev_score, impact_lvl = calculate_severity(
                        row.get("severity"),
                        records_aff,
                        sector,
                        attack_type
                    )

                    cve_refs = row.get("cve_references", "")
                    description = row.get("description", "")
                    if cve_refs:
                        description += f" [Referenced CVEs: {cve_refs}]"

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
                    inc_obj = None

                    if existing:
                        if existing.raw_data_hash == curr_hash:
                            stats["records_skipped"] += 1
                            inc_obj = existing
                        else:
                            existing.title = f"{attack_type} against {victim}"[:255]
                            existing.description = description
                            existing.incident_date = norm_date
                            existing.year = year
                            existing.month = month
                            existing.victim_name = victim
                            existing.sector = sector
                            existing.state_province = state_prov
                            existing.threat_actor = threat_actor
                            existing.severity = sev_label
                            existing.severity_score = sev_score
                            existing.impact_level = impact_lvl
                            existing.records_affected = records_aff
                            existing.raw_data_hash = curr_hash
                            stats["records_updated"] += 1
                            inc_obj = existing
                    else:
                        new_inc = CyberIncident(
                            incident_ref=ref_id,
                            source_id=source.id,
                            title=f"{attack_type} targeting {victim}"[:255],
                            description=description,
                            incident_date=norm_date,
                            year=year,
                            month=month,
                            victim_name=victim,
                            sector=sector,
                            subsector=row.get("sector"),
                            country="India",
                            country_code="IN",
                            region="Asia-Pacific",
                            state_province=state_prov,
                            attack_type=attack_type,
                            threat_actor=threat_actor,
                            severity=sev_label,
                            severity_score=sev_score,
                            impact_level=impact_lvl,
                            records_affected=records_aff,
                            source_url=row.get("source_url"),
                            raw_data_hash=curr_hash,
                            deduplication_key=dedup_key
                        )
                        db.add(new_inc)
                        db.flush()
                        stats["records_ingested"] += 1
                        inc_obj = new_inc

                    # Correlate CVE references if present
                    if cve_refs and inc_obj:
                        for cve_item in cve_refs.split(","):
                            cve_clean = cve_item.strip().upper()
                            if cve_clean.startswith("CVE-"):
                                vuln = db.query(Vulnerability).filter_by(cve_id=cve_clean).first()
                                if not vuln:
                                    # Create vulnerability record if missing
                                    vuln = Vulnerability(
                                        cve_id=cve_clean,
                                        vulnerability_name=f"Vulnerability linked to {victim} incident",
                                        cvss_score=8.5
                                    )
                                    db.add(vuln)
                                    db.flush()

                                link = db.query(IncidentVulnerability).filter_by(
                                    incident_id=inc_obj.id,
                                    vulnerability_id=vuln.id
                                ).first()
                                if not link:
                                    db.add(IncidentVulnerability(
                                        incident_id=inc_obj.id,
                                        vulnerability_id=vuln.id,
                                        relationship_type="exploited_cve",
                                        confidence=1.0
                                    ))
                                    stats["links_created"] += 1

                except Exception as e:
                    stats["errors"] += 1
                    logger.debug(f"Error parsing India national incident row {idx}: {e}")

        db.commit()
        return stats
