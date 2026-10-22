from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class IncidentVulnerabilityRef(BaseModel):
    cve_id: str
    vulnerability_name: Optional[str] = None
    relationship_type: str
    confidence: float

    class Config:
        from_attributes = True

class CyberIncidentBase(BaseModel):
    incident_ref: str
    title: Optional[str] = None
    description: Optional[str] = None
    incident_date: str
    victim_name: Optional[str] = None
    sector: str
    subsector: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    state_province: Optional[str] = None
    attack_type: str
    attack_subtype: Optional[str] = None
    threat_actor: Optional[str] = None
    actor_type: Optional[str] = None
    actor_country: Optional[str] = None
    motive: Optional[str] = None
    severity: str = "Medium"
    severity_score: float = 5.0
    impact_level: str = "Moderate"
    records_affected: Optional[int] = None
    estimated_loss_usd: Optional[float] = None
    source_url: Optional[str] = None

class CyberIncidentCreate(CyberIncidentBase):
    source_id: int

class CyberIncidentResponse(CyberIncidentBase):
    id: int
    source_id: int
    year: Optional[int] = None
    month: Optional[int] = None
    source_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CyberIncidentListResponse(BaseModel):
    items: List[CyberIncidentResponse]
    total: int
    page: int
    size: int
    pages: int
