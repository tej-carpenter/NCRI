from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.risk_engine import RiskEngine, METHODOLOGY_DOCS, determine_risk_tier
from backend.app.schemas.risk import (
    SectorRiskItem,
    NCRIOverviewResponse,
    RiskCalculationRequest
)
from backend.app.config import settings

router = APIRouter(prefix="/risk", tags=["Risk Assessment"])

@router.get("/methodology")
def get_methodology():
    return METHODOLOGY_DOCS

@router.get("/index", response_model=NCRIOverviewResponse)
def get_ncri_index(
    period: str = Query("All-Time", description="Assessment period e.g. All-Time, 2026, 2025"),
    country: str = Query("All", description="Country scope e.g. All, India, US"),
    db: Session = Depends(get_db)
):
    assessments = RiskEngine.calculate_all_sector_risks(
        db=db,
        period=period,
        country=country
    )

    sector_items = [
        SectorRiskItem(
            sector=a.sector,
            incident_count=a.incident_count,
            frequency_score=a.frequency_score,
            severity_score=a.severity_score,
            criticality_score=a.criticality_score,
            exploitation_score=a.exploitation_score,
            ncri_score=a.ncri_score,
            risk_tier=a.risk_tier
        ) for a in assessments
    ]

    overall_score = round(
        sum(item.ncri_score for item in sector_items) / len(sector_items), 1
    ) if sector_items else 0.0

    return NCRIOverviewResponse(
        methodology_version=settings.NCRI_METHODOLOGY_VERSION,
        assessment_period=period,
        country_scope=country,
        overall_national_ncri=overall_score,
        overall_risk_tier=determine_risk_tier(overall_score),
        formula_description=METHODOLOGY_DOCS["formula"],
        weightings=METHODOLOGY_DOCS["default_weights"],
        sector_scores=sector_items,
        generated_at=datetime.utcnow()
    )

@router.post("/calculate", response_model=NCRIOverviewResponse)
def calculate_custom_ncri(
    req: RiskCalculationRequest,
    db: Session = Depends(get_db)
):
    assessments = RiskEngine.calculate_all_sector_risks(
        db=db,
        period=req.assessment_period or "All-Time",
        country=req.country or "All",
        w_f=req.weight_frequency,
        w_s=req.weight_severity,
        w_c=req.weight_criticality,
        w_e=req.weight_exploitation
    )

    sector_items = [
        SectorRiskItem(
            sector=a.sector,
            incident_count=a.incident_count,
            frequency_score=a.frequency_score,
            severity_score=a.severity_score,
            criticality_score=a.criticality_score,
            exploitation_score=a.exploitation_score,
            ncri_score=a.ncri_score,
            risk_tier=a.risk_tier
        ) for a in assessments
    ]

    overall_score = round(
        sum(item.ncri_score for item in sector_items) / len(sector_items), 1
    ) if sector_items else 0.0

    custom_weights = {
        "weight_frequency": req.weight_frequency or 0.35,
        "weight_severity": req.weight_severity or 0.30,
        "weight_criticality": req.weight_criticality or 0.20,
        "weight_exploitation": req.weight_exploitation or 0.15
    }

    return NCRIOverviewResponse(
        methodology_version=settings.NCRI_METHODOLOGY_VERSION,
        assessment_period=req.assessment_period or "All-Time",
        country_scope=req.country or "All",
        overall_national_ncri=overall_score,
        overall_risk_tier=determine_risk_tier(overall_score),
        formula_description=METHODOLOGY_DOCS["formula"],
        weightings=custom_weights,
        sector_scores=sector_items,
        generated_at=datetime.utcnow()
    )
