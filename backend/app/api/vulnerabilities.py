import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from backend.app.database import get_db
from backend.app.models.vulnerability import Vulnerability
from backend.app.models.incident_vulnerability import IncidentVulnerability
from backend.app.models.incident import CyberIncident

router = APIRouter(prefix="/vulnerabilities", tags=["Vulnerability Intelligence"])

@router.get("")
def list_vulnerabilities(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None),
    ransomware_only: bool = Query(False)
):
    query = db.query(Vulnerability)

    if search:
        s_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Vulnerability.cve_id.ilike(s_term),
                Vulnerability.vendor_project.ilike(s_term),
                Vulnerability.product.ilike(s_term),
                Vulnerability.vulnerability_name.ilike(s_term),
                Vulnerability.short_description.ilike(s_term)
            )
        )

    if ransomware_only:
        query = query.filter(Vulnerability.known_ransomware_campaign_use == "Known")

    total = query.count()
    pages = math.ceil(total / size) if total > 0 else 1
    offset = (page - 1) * size

    items = query.order_by(desc(Vulnerability.date_added)).offset(offset).limit(size).all()

    return {
        "items": [
            {
                "id": v.id,
                "cve_id": v.cve_id,
                "vendor_project": v.vendor_project,
                "product": v.product,
                "vulnerability_name": v.vulnerability_name,
                "date_added": v.date_added,
                "short_description": v.short_description,
                "required_action": v.required_action,
                "known_ransomware_campaign_use": v.known_ransomware_campaign_use,
                "cvss_score": v.cvss_score
            } for v in items
        ],
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@router.get("/{cve_id}")
def get_vulnerability_detail(cve_id: str, db: Session = Depends(get_db)):
    norm_cve = cve_id.strip().upper()
    v = db.query(Vulnerability).filter_by(cve_id=norm_cve).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    linked_incidents = []
    for link in v.incident_links:
        inc = link.incident
        linked_incidents.append({
            "incident_id": inc.id,
            "incident_ref": inc.incident_ref,
            "title": inc.title,
            "victim_name": inc.victim_name,
            "sector": inc.sector,
            "incident_date": inc.incident_date,
            "attack_type": inc.attack_type,
            "relationship_type": link.relationship_type,
            "confidence": link.confidence
        })

    return {
        "cve_id": v.cve_id,
        "vendor_project": v.vendor_project,
        "product": v.product,
        "vulnerability_name": v.vulnerability_name,
        "date_added": v.date_added,
        "short_description": v.short_description,
        "required_action": v.required_action,
        "known_ransomware_campaign_use": v.known_ransomware_campaign_use,
        "notes": v.notes,
        "cvss_score": v.cvss_score,
        "linked_incidents": linked_incidents
    }
