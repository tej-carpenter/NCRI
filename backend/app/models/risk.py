from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Index
from backend.app.database import Base

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    assessment_period = Column(String(50), index=True, nullable=False)  # e.g. '2026-YTD', '2025-Annual', 'All-Time'
    sector = Column(String(100), index=True, nullable=False)
    country = Column(String(100), index=True, default="All")
    
    incident_count = Column(Integer, default=0)
    frequency_score = Column(Float, default=0.0)      # F_s normalized (0-100)
    severity_score = Column(Float, default=0.0)       # S_s normalized (0-100)
    criticality_score = Column(Float, default=0.0)    # C_s sector criticality (0-100)
    exploitation_score = Column(Float, default=0.0)   # E_s exploit/ransomware velocity (0-100)
    
    ncri_score = Column(Float, nullable=False)         # Final NCRI score (0.0 - 100.0)
    risk_tier = Column(String(20), nullable=False)     # Low, Moderate, Elevated, High, Severe
    
    methodology_version = Column(String(20), default="v1.0.0")
    parameters_json = Column(Text, nullable=True)     # Weights, formula factors, audit details
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_risk_period_sector", "assessment_period", "sector"),
    )
