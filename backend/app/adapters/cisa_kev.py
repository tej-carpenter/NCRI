import os
import json
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.adapters.base import BaseAdapter
from backend.app.models.source import DataSource
from backend.app.models.vulnerability import Vulnerability
from backend.app.models.incident import CyberIncident
from backend.app.models.incident_vulnerability import IncidentVulnerability
from backend.app.config import RAW_DATA_DIR

logger = logging.getLogger("ncri.adapters.cisa_kev")

class CisaKevAdapter(BaseAdapter):
    def __init__(self):
        super().__init__("cisa_kev", "CISA Known Exploited Vulnerabilities Catalog")

    def ingest(self, db: Session, max_records: Optional[int] = None) -> Dict[str, Any]:
        source = db.query(DataSource).filter_by(slug=self.source_slug).first()
        if not source:
            raise ValueError(f"DataSource with slug '{self.source_slug}' not found.")

        kev_file = RAW_DATA_DIR / "cisa_kev.json"
        if not os.path.exists(kev_file):
            raise FileNotFoundError(f"CISA KEV file not found at {kev_file}")

        stats = {
            "total_processed": 0,
            "records_ingested": 0,
            "records_skipped": 0,
            "records_updated": 0,
            "errors": 0,
            "links_created": 0
        }

        with open(kev_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        vulnerabilities = data.get("vulnerabilities", [])
        cve_map = {}

        for idx, item in enumerate(vulnerabilities):
            if max_records and stats["total_processed"] >= max_records:
                break

            stats["total_processed"] += 1
            try:
                cve_id = item.get("cveID", "").strip().upper()
                if not cve_id:
                    continue

                existing = db.query(Vulnerability).filter_by(cve_id=cve_id).first()
                if existing:
                    existing.vendor_project = item.get("vendorProject")
                    existing.product = item.get("product")
                    existing.vulnerability_name = item.get("vulnerabilityName")
                    existing.date_added = item.get("dateAdded")
                    existing.short_description = item.get("shortDescription")
                    existing.required_action = item.get("requiredAction")
                    existing.known_ransomware_campaign_use = item.get("knownRansomwareCampaignUse")
                    existing.notes = item.get("notes")
                    stats["records_updated"] += 1
                    cve_map[cve_id] = existing.id
                else:
                    new_vuln = Vulnerability(
                        cve_id=cve_id,
                        vendor_project=item.get("vendorProject"),
                        product=item.get("product"),
                        vulnerability_name=item.get("vulnerabilityName"),
                        date_added=item.get("dateAdded"),
                        short_description=item.get("shortDescription"),
                        required_action=item.get("requiredAction"),
                        known_ransomware_campaign_use=item.get("knownRansomwareCampaignUse"),
                        notes=item.get("notes"),
                        cvss_score=8.5 if item.get("knownRansomwareCampaignUse") == "Known" else 7.5
                    )
                    db.add(new_vuln)
                    db.flush()
                    cve_map[cve_id] = new_vuln.id
                    stats["records_ingested"] += 1

                if stats["total_processed"] % 500 == 0:
                    db.commit()

            except Exception as e:
                stats["errors"] += 1
                logger.debug(f"Error ingesting CISA CVE {idx}: {e}")

        db.commit()

        # Link justified relationships: scan incidents mentioning CVEs
        try:
            incidents_with_cves = db.query(CyberIncident).filter(
                CyberIncident.description.like("%CVE-%")
            ).all()

            for inc in incidents_with_cves:
                # Find all CVE IDs in text
                import re
                cves_found = re.findall(r"CVE-\d{4}-\d{4,7}", inc.description, re.IGNORECASE)
                for found_cve in set(cves_found):
                    norm_cve = found_cve.upper()
                    vuln_rec = db.query(Vulnerability).filter_by(cve_id=norm_cve).first()
                    if vuln_rec:
                        existing_link = db.query(IncidentVulnerability).filter_by(
                            incident_id=inc.id,
                            vulnerability_id=vuln_rec.id
                        ).first()
                        if not existing_link:
                            link = IncidentVulnerability(
                                incident_id=inc.id,
                                vulnerability_id=vuln_rec.id,
                                relationship_type="exploited_cve",
                                confidence=0.95
                            )
                            db.add(link)
                            stats["links_created"] += 1
            db.commit()
        except Exception as link_err:
            logger.warning(f"Error correlating incident CVE links: {link_err}")

        return stats
