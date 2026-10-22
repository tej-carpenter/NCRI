import os
import sys

# Ensure root dir is in path
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.database import init_db, SessionLocal
from backend.app.services.ingestion_service import IngestionService
from backend.app.services.risk_engine import RiskEngine

def main():
    print("=================================================================")
    print("  NCRI PLATFORM: EXECUTING MULTI-SOURCE DATA INGESTION PIPELINE  ")
    print("=================================================================")
    
    # Initialize DB schema and data sources
    init_db()
    db = SessionLocal()

    try:
        # 1. Ingest CISA KEV (Vulnerability intelligence baseline)
        print("\n[1/4] Ingesting CISA Known Exploited Vulnerabilities Catalog...")
        kev_run = IngestionService.run_ingestion_for_source(db, slug="cisa_kev")
        print(f"      Status: {kev_run.status} | Ingested: {kev_run.records_ingested} | Updated: {kev_run.records_updated}")

        # 2. Ingest India National Cyber Incidents (CERT-In / National Infrastructure)
        print("\n[2/4] Ingesting India National Cyber Incidents...")
        in_run = IngestionService.run_ingestion_for_source(db, slug="india_national")
        print(f"      Status: {in_run.status} | Ingested: {in_run.records_ingested} | Updated: {in_run.records_updated}")

        # 3. Ingest CISSM Cyber Events Database
        print("\n[3/4] Ingesting UMD CISSM Global Cyber Events Database (first 2,500 records)...")
        cissm_run = IngestionService.run_ingestion_for_source(db, slug="cissm", max_records=2500)
        print(f"      Status: {cissm_run.status} | Ingested: {cissm_run.records_ingested} | Skipped: {cissm_run.records_skipped} | Updated: {cissm_run.records_updated}")

        # 4. Ingest Ransomware.live Threat Feed
        print("\n[4/4] Ingesting Ransomware.live Victims (first 1,500 records)...")
        rl_run = IngestionService.run_ingestion_for_source(db, slug="ransomware_live", max_records=1500)
        print(f"      Status: {rl_run.status} | Ingested: {rl_run.records_ingested} | Skipped: {rl_run.records_skipped} | Updated: {rl_run.records_updated}")

        # 5. Compute Initial Risk Assessment Matrices
        print("\n[5/5] Computing National Cyber Risk Index (NCRI v1.0.0)...")
        assessments_global = RiskEngine.calculate_all_sector_risks(db, period="All-Time", country="All")
        print(f"      Computed global sectoral NCRI across {len(assessments_global)} sectors.")
        assessments_india = RiskEngine.calculate_all_sector_risks(db, period="All-Time", country="India")
        print(f"      Computed India sectoral NCRI across {len(assessments_india)} sectors.")

        print("\n=================================================================")
        print("  INGESTION PIPELINE COMPLETED SUCCESSFULLY!                     ")
        print("=================================================================")

    except Exception as e:
        print(f"\nIngestion encountered error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
