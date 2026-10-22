from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    source_type = Column(String(50), nullable=False)  # rest_api, csv_research_repo, json_feed, etc.
    base_url = Column(String(255), nullable=True)
    update_frequency = Column(String(50), nullable=True)
    license = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    last_sync_at = Column(DateTime, nullable=True)
    last_sync_status = Column(String(50), default="never_run")  # success, failed, running, never_run
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    incidents = relationship("CyberIncident", back_populates="source", cascade="all, delete-orphan")
    ingestion_runs = relationship("IngestionRun", back_populates="source", cascade="all, delete-orphan")
