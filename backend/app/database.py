import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

logger = logging.getLogger("ncri.database")

# Try configured DATABASE_URL (e.g. Postgres), fallback cleanly to SQLite
engine = None
active_db_url = settings.DATABASE_URL

try:
    if "postgresql" in settings.DATABASE_URL:
        # Test connection with a short timeout
        test_engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3}
        )
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        logger.info(f"Connected to PostgreSQL database: {settings.DATABASE_URL.split('@')[-1]}")
    else:
        engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
        active_db_url = settings.DATABASE_URL
except Exception as e:
    logger.warning(f"Failed to connect to primary DB ({settings.DATABASE_URL}): {e}. Using SQLite fallback.")
    active_db_url = settings.FALLBACK_SQLITE_URL
    engine = create_engine(
        active_db_url,
        connect_args={"check_same_thread": False}
    )
    logger.info(f"Active database initialized with fallback SQLite: {active_db_url}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables and seeds default DataSource records."""
    from backend.app.models import source, ingestion, incident, vulnerability, incident_vulnerability, risk
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
    
    # Seed default data sources if not present
    from backend.app.models.source import DataSource
    db = SessionLocal()
    try:
        default_sources = [
            {
                "slug": "cissm",
                "name": "UMD CISSM Cyber Events Database",
                "description": "University of Maryland Center for International and Security Studies at Maryland - Cyber Events Database 2.0 covering global cyber attacks, actors, and critical sectors.",
                "source_type": "csv_research_repo",
                "base_url": "https://cissm.umd.edu/cyber-events-database",
                "update_frequency": "Monthly",
                "license": "Creative Commons / Academic Research Open Access"
            },
            {
                "slug": "ransomware_live",
                "name": "Ransomware.live Threat Feed",
                "description": "Real-time ransomware victim monitoring platform tracking extortion group claims, compromised enterprise entities, and sectors.",
                "source_type": "rest_api",
                "base_url": "https://api.ransomware.live/v2/",
                "update_frequency": "Daily",
                "license": "Open Cybersecurity Threat Intelligence Feed"
            },
            {
                "slug": "cisa_kev",
                "name": "CISA Known Exploited Vulnerabilities Catalog",
                "description": "Official US Cybersecurity and Infrastructure Security Agency (CISA) authoritative catalog of actively weaponized and exploited CVEs.",
                "source_type": "json_feed",
                "base_url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
                "update_frequency": "Continuous / Automated",
                "license": "US Public Domain / Official CISA Advisory"
            },
            {
                "slug": "india_national",
                "name": "India National Cyber Incident Track (CERT-In / MeitY)",
                "description": "Curated national repository of verified major cybersecurity incidents across Indian critical infrastructure, public sector, and healthcare.",
                "source_type": "national_advisories",
                "base_url": "https://www.cert-in.org.in",
                "update_frequency": "Quarterly / Verified Disclosures",
                "license": "Government Open Data / Public Disclosures"
            },
            {
                "slug": "custom_upload",
                "name": "User Uploaded Incident Dataset",
                "description": "Locally uploaded CSV or JSON file containing institutional or operational cyber incident reports.",
                "source_type": "file_upload",
                "base_url": "local://upload",
                "update_frequency": "On Demand",
                "license": "User Defined"
            }
        ]
        
        for s_data in default_sources:
            existing = db.query(DataSource).filter_by(slug=s_data["slug"]).first()
            if not existing:
                src = DataSource(**s_data)
                db.add(src)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding default sources: {e}")
    finally:
        db.close()
