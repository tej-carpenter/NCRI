from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class SummaryKPIs(BaseModel):
    total_incidents: int
    total_sources: int
    total_vulnerabilities: int
    total_countries: int
    top_sector: Optional[str] = None
    top_attack_type: Optional[str] = None
    critical_severity_percentage: float = 0.0
    ransomware_percentage: float = 0.0
    latest_incident_date: Optional[str] = None
    records_with_known_actors_percentage: float = 0.0

class TrendPoint(BaseModel):
    period: str  # e.g., '2023-01' or '2023'
    count: int
    moving_avg: Optional[float] = None
    predicted: Optional[bool] = False

class SectorStat(BaseModel):
    sector: str
    count: int
    percentage: float
    avg_severity: float
    critical_count: int

class AttackTypeStat(BaseModel):
    attack_type: str
    count: int
    percentage: float
    avg_severity: float

class GeoStat(BaseModel):
    country: str
    country_code: Optional[str] = None
    count: int
    percentage: float
    top_sector: Optional[str] = None

class SeverityStat(BaseModel):
    severity: str
    count: int
    percentage: float

class SectorAttackMatrixCell(BaseModel):
    sector: str
    attack_type: str
    count: int

class AnalyticsDashboardData(BaseModel):
    kpis: SummaryKPIs
    trends: List[TrendPoint]
    sectors: List[SectorStat]
    attack_types: List[AttackTypeStat]
    geography: List[GeoStat]
    severity_distribution: List[SeverityStat]
