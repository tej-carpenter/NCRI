from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class SectorRiskItem(BaseModel):
    sector: str
    incident_count: int
    frequency_score: float
    severity_score: float
    criticality_score: float
    exploitation_score: float
    ncri_score: float
    risk_tier: str  # Low, Moderate, Elevated, High, Severe

class NCRIOverviewResponse(BaseModel):
    methodology_version: str
    assessment_period: str
    country_scope: str
    overall_national_ncri: float
    overall_risk_tier: str
    formula_description: str
    weightings: Dict[str, float]
    sector_scores: List[SectorRiskItem]
    generated_at: datetime

class RiskCalculationRequest(BaseModel):
    assessment_period: Optional[str] = "All-Time"
    country: Optional[str] = "All"
    weight_frequency: Optional[float] = 0.35
    weight_severity: Optional[float] = 0.30
    weight_criticality: Optional[float] = 0.20
    weight_exploitation: Optional[float] = 0.15
