from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger("ncri.adapters")

class BaseAdapter(ABC):
    source_slug: str
    source_name: str

    def __init__(self, source_slug: str, source_name: str):
        self.source_slug = source_slug
        self.source_name = source_name

    @abstractmethod
    def ingest(self, db: Session, max_records: Optional[int] = None) -> Dict[str, Any]:
        """
        Executes ingestion into the database.
        Returns metrics dictionary: {
            'total_processed': int,
            'records_ingested': int,
            'records_skipped': int,
            'records_updated': int,
            'errors': int
        }
        """
        pass
