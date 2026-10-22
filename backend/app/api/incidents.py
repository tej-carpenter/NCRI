import math
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_

from backend.app.database import get_db
from backend.app.models.incident import CyberIncident
from backend.app.models.source import DataSource
from backend.app.schemas.incident import (
    CyberIncidentResponse,
    CyberIncidentListResponse,
    CyberIncidentCreate
)

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=CyberIncidentListResponse)
def list_incidents(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(25, ge=1, le=200, description="Page size"),
    search: Optional[str] = Query(None, description="Search victim, actor, or description"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    country: Optional[str] = Query(None, description="Filter by country or code"),
    attack_type: Optional[str] = Query(None, description="Filter by attack type"),
    severity: Optional[str] = Query(None, description="Filter by severity label"),
    year: Optional[int] = Query(None, description="Filter by year"),
    source_slug: Optional[str] = Query(None, description="Filter by source slug"),
    sort_by: str = Query("incident_date", description="Field to sort by (incident_date, severity_score, victim_name)"),
    sort_dir: str = Query("desc", description="Sort direction (asc, desc)")
):
    query = db.query(CyberIncident)

    if source_slug and source_slug != "All":
        src = db.query(DataSource).filter_by(slug=source_slug).first()
        if src:
            query = query.filter(CyberIncident.source_id == src.id)

    if search:
        s_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                CyberIncident.victim_name.ilike(s_term),
                CyberIncident.threat_actor.ilike(s_term),
                CyberIncident.description.ilike(s_term),
                CyberIncident.title.ilike(s_term)
            )
        )

    if sector and sector != "All":
        query = query.filter(CyberIncident.sector == sector)

    if country and country != "All":
        query = query.filter(
            or_(
                CyberIncident.country == country,
                CyberIncident.country_code == country
            )
        )

    if attack_type and attack_type != "All":
        query = query.filter(CyberIncident.attack_type == attack_type)

    if severity and severity != "All":
        query = query.filter(CyberIncident.severity == severity)

    if year:
        query = query.filter(CyberIncident.year == year)

    # Sorting
    sort_column = CyberIncident.incident_date
    if sort_by == "severity_score":
        sort_column = CyberIncident.severity_score
    elif sort_by == "victim_name":
        sort_column = CyberIncident.victim_name
    elif sort_by == "year":
        sort_column = CyberIncident.year

    if sort_dir.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    total = query.count()
    pages = math.ceil(total / size) if total > 0 else 1
    offset = (page - 1) * size

    items = query.offset(offset).limit(size).all()

    # Enrich with source_name
    resp_items = []
    source_cache = {}
    for inc in items:
        if inc.source_id not in source_cache:
            s_obj = db.query(DataSource).filter_by(id=inc.source_id).first()
            source_cache[inc.source_id] = s_obj.name if s_obj else "Unknown"
        
        r_dict = {c.name: getattr(inc, c.name) for c in inc.__table__.columns}
        r_dict["source_name"] = source_cache[inc.source_id]
        resp_items.append(CyberIncidentResponse(**r_dict))

    return CyberIncidentListResponse(
        items=resp_items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@router.get("/{incident_id}")
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(CyberIncident).filter_by(id=incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    src = db.query(DataSource).filter_by(id=inc.source_id).first()

    # Fetch linked vulnerabilities
    vuln_links = []
    for link in inc.vulnerability_links:
        v = link.vulnerability
        vuln_links.append({
            "cve_id": v.cve_id,
            "vulnerability_name": v.vulnerability_name,
            "relationship_type": link.relationship_type,
            "confidence": link.confidence
        })

    r_dict = {c.name: getattr(inc, c.name) for c in inc.__table__.columns}
    r_dict["source_name"] = src.name if src else "Unknown"
    r_dict["linked_vulnerabilities"] = vuln_links
    return r_dict
