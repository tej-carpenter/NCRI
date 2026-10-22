from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("data_sources.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False, default="running")  # running, completed, failed
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    total_processed = Column(Integer, default=0)
    records_ingested = Column(Integer, default=0)
    records_skipped = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    raw_file_path = Column(String(255), nullable=True)
    run_metadata = Column(Text, nullable=True)  # JSON string of run metadata

    # Relationship
    source = relationship("DataSource", back_populates="ingestion_runs")
