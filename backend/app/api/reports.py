import io
import csv
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.incident import CyberIncident
from backend.app.models.risk import RiskAssessment
from backend.app.services.risk_engine import RiskEngine

router = APIRouter(prefix="/reports", tags=["Reports & Export"])

@router.get("/export-csv")
def export_incidents_csv(
    db: Session = Depends(get_db),
    sector: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    attack_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    year: Optional[int] = Query(None)
):
    query = db.query(CyberIncident)

    if sector and sector != "All":
        query = query.filter(CyberIncident.sector == sector)
    if country and country != "All":
        query = query.filter((CyberIncident.country == country) | (CyberIncident.country_code == country))
    if attack_type and attack_type != "All":
        query = query.filter(CyberIncident.attack_type == attack_type)
    if severity and severity != "All":
        query = query.filter(CyberIncident.severity == severity)
    if year:
        query = query.filter(CyberIncident.year == year)

    incidents = query.order_by(desc(CyberIncident.incident_date)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Incident ID",
        "Reference ID",
        "Date",
        "Victim Name",
        "Sector",
        "Country",
        "Attack Type",
        "Threat Actor",
        "Severity",
        "Severity Score",
        "Impact Level",
        "Records Affected",
        "Description",
        "Source URL"
    ])

    for inc in incidents:
        writer.writerow([
            inc.id,
            inc.incident_ref,
            inc.incident_date,
            inc.victim_name,
            inc.sector,
            inc.country,
            inc.attack_type,
            inc.threat_actor,
            inc.severity,
            inc.severity_score,
            inc.impact_level,
            inc.records_affected or "",
            (inc.description or "").replace("\n", " "),
            inc.source_url or ""
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ncri_cyber_incidents_export.csv"}
    )

@router.get("/risk-summary")
def get_risk_summary_report(
    period: str = Query("All-Time"),
    country: str = Query("All"),
    db: Session = Depends(get_db)
):
    assessments = RiskEngine.calculate_all_sector_risks(
        db=db,
        period=period,
        country=country
    )

    return {
        "title": f"National Cyber Risk Assessment Report - {country} ({period})",
        "methodology": "National Cyber Risk Index (NCRI v1.0.0)",
        "sectors_analyzed": len(assessments),
        "rankings": [
            {
                "rank": i + 1,
                "sector": a.sector,
                "ncri_score": a.ncri_score,
                "risk_tier": a.risk_tier,
                "incident_count": a.incident_count,
                "criticality_score": a.criticality_score,
                "exploitation_score": a.exploitation_score
            } for i, a in enumerate(assessments)
        ]
    }
