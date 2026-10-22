from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class DataSourceResponse(BaseModel):
    id: int
    slug: str
    name: str
    description: Optional[str] = None
    source_type: str
    base_url: Optional[str] = None
    update_frequency: Optional[str] = None
    license: Optional[str] = None
    is_active: bool
    last_sync_at: Optional[datetime] = None
    last_sync_status: str
    incident_count: Optional[int] = 0

    class Config:
        from_attributes = True

class IngestionRunResponse(BaseModel):
    id: int
    source_id: int
    source_name: Optional[str] = None
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    total_processed: int
    records_ingested: int
    records_skipped: int
    records_updated: int
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class SyncTriggerResponse(BaseModel):
    source_slug: str
    status: str
    message: str
    run_id: Optional[int] = None
