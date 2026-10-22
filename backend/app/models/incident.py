from datetime import datetime
from sqlalchemy import Column, Integer, BigInteger, String, Text, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.database import Base

class CyberIncident(Base):
    __tablename__ = "cyber_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_ref = Column(String(100), index=True, nullable=False)  # Original source ID
    source_id = Column(Integer, ForeignKey("data_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    incident_date = Column(String(20), index=True, nullable=False)  # Normalized YYYY-MM-DD
    year = Column(Integer, index=True, nullable=True)
    month = Column(Integer, nullable=True)
    
    victim_name = Column(String(255), index=True, nullable=True)
    sector = Column(String(100), index=True, nullable=False)  # Normalized canonical sector
    subsector = Column(String(150), nullable=True)
    
    country = Column(String(100), index=True, nullable=True)
    country_code = Column(String(10), index=True, nullable=True)
    region = Column(String(50), index=True, nullable=True)
    state_province = Column(String(100), nullable=True)
    
    attack_type = Column(String(100), index=True, nullable=False)  # Normalized attack category
    attack_subtype = Column(String(150), nullable=True)
    
    threat_actor = Column(String(150), index=True, nullable=True)
    actor_type = Column(String(100), nullable=True)  # Criminal, State-sponsored, Hacktivist, etc.
    actor_country = Column(String(100), nullable=True)
    motive = Column(String(100), nullable=True)  # Financial, Espionage, Protest, etc.
    
    severity = Column(String(20), index=True, default="Medium")  # Low, Medium, High, Critical
    severity_score = Column(Float, default=5.0)  # Standardized 0.0 to 10.0 scale
    impact_level = Column(String(20), default="Moderate")  # Low, Moderate, High, Critical
    
    records_affected = Column(BigInteger, nullable=True)
    estimated_loss_usd = Column(Float, nullable=True)
    source_url = Column(Text, nullable=True)
    
    raw_data_hash = Column(String(64), nullable=True)
    deduplication_key = Column(String(64), unique=True, index=True, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    source = relationship("DataSource", back_populates="incidents")
    vulnerability_links = relationship("IncidentVulnerability", back_populates="incident", cascade="all, delete-orphan")

    # Composite indexes for fast analytics queries
    __table_args__ = (
        Index("idx_incident_year_sector", "year", "sector"),
        Index("idx_incident_country_year", "country", "year"),
        Index("idx_incident_attack_sector", "attack_type", "sector"),
    )
