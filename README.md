# National Cyber Incident Analytics Platform for Trend Analysis and Risk Assessment (NCRI)

[![Python 3.11](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg)](https://nextjs.org/)
[![License: Open Access](https://img.shields.io/badge/License-Academic%20Open%20Access-green.svg)](#licensing)

The **National Cyber Incident Analytics Platform (NCRI)** is an end-to-end cybersecurity data engineering and analytics system. It ingests verified cyber incidents from credible public feeds (UMD CISSM, Ransomware.live, CERT-In India), correlates them with CISA Known Exploited Vulnerabilities (KEV), normalizes schemas, eliminates duplicates through SHA-256 fingerprinting, and calculates an explainable **National Cyber Risk Index (NCRI v1.0.0)**.

---

## Key Features

1. **Multi-Source Data Ingestion**:
   - **UMD CISSM Cyber Events Database**: ~10,000 global verified cyber incidents across critical infrastructure, education, government, and commercial sectors.
   - **Ransomware.live Threat Feed**: Live and historical verified ransomware victim telemetry.
   - **CISA Known Exploited Vulnerabilities (KEV)**: 1,740 weaponized CVE records, stored as threat intelligence and correlated with incidents.
   - **India National Cyber Incidents Track (CERT-In / MeitY)**: Verified national breaches (AIIMS 2022, Oil India, NPCIL Kudankulam, BSNL 2024, etc.).
   - **Ad-Hoc Dataset Importer**: Flexible CSV and JSON importer with automatic column detection.
2. **Data Pipeline & Normalization**:
   - Standardized ISO `YYYY-MM-DD` dates and timestamps.
   - Canonical 10-sector taxonomy (Healthcare, Energy, Government, Finance, IT/Telecom, Manufacturing, Education, Transportation, Commercial, Other).
   - Unified attack classification (Ransomware, Data Breach, DDoS, Exploitation, Supply Chain, Espionage).
   - Deterministic SHA-256 deduplication and in-memory batch collision handling.
3. **National Cyber Risk Index (NCRI v1.0.0)**:
   - An explainable, reproducible, multi-factor risk scoring model:
     $$\text{NCRI}_{s} = (0.35 \cdot F_s) + (0.30 \cdot S_s) + (0.20 \cdot C_s) + (0.15 \cdot E_s)$$
   - Transparent 0–100 score decomposed into Frequency, Severity, Sector Criticality, and Exploitation Velocity.
   - Interactive weight sensitivity simulator on the frontend.
4. **Professional Next.js Dashboard**:
   - Executive KPI cards.
   - Filterable Incident Explorer with deep inspection drawer and linked CVEs.
   - Temporal trend analysis with rolling moving averages and predictive forecasting.
   - Sectoral impact bar charts and attack vector distributions.
   - Geographic distribution with an India National Security profile.
   - CISA KEV catalog search.
   - Data Source Registry and Ingestion Run audit logs.
   - Direct CSV and analytical report export.

---

## System Architecture

```
[ CISSM CSV ] [ Ransomware.live API ] [ CISA KEV JSON ] [ CERT-In Disclosures ]
       │                │                    │                  │
       └────────────────┴───────────┬────────┴──────────────────┘
                                    ▼
                     [ Ingestion Adapters & Auditing ]
                                    │
                                    ▼
                   [ Normalization & Deduplication ]
                                    │
                                    ▼
       [ PostgreSQL (Primary) / Local SQLite (Automatic Fallback) ]
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
          [ Analytics Engine ]                 [ NCRI Engine v1.0.0 ]
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    ▼
                    [ FastAPI REST API (Port 8000) ]
                                    │
                                    ▼
             [ Next.js 14 Responsive UI Dashboard (Port 3000) ]
```

---

## Directory Structure

```
NCRI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app lifecycle and routers
│   │   ├── config.py            # Pydantic settings & DB fallback
│   │   ├── database.py          # SQLAlchemy engine, session, & init
│   │   ├── models/              # Incident, Source, Ingestion, Vulnerability, Risk
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── adapters/            # CISSM, Ransomware.live, CISA KEV, India National, Custom CSV
│   │   ├── services/            # Normalizer, Deduplication, Analytics, Risk Engine, Ingestion
│   │   └── api/                 # Health, Incidents, Analytics, Risk, Sources, KEV, Reports
│   ├── scripts/
│   │   ├── download_datasets.py # Source data download script
│   │   └── ingest_all.py        # Multi-source pipeline runner
│   ├── tests/                   # 21 unit & integration tests (100% passing)
│   ├── data/raw/                # Local verified datasets (CISSM, KEV, Ransomware, India)
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Backend entrypoint launcher
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/          # DashboardOverview, Explorer, Trends, Sectors, Geo, Risk, KEV, Sources
│   │   ├── lib/                 # Type-safe API client (api.ts)
│   │   └── types/               # TypeScript interfaces
│   ├── package.json             # Frontend dependencies (React, Lucide, Recharts, Tailwind)
│   └── next.config.mjs          # Proxy rewrite to FastAPI backend
├── docs/
│   ├── dataset-sources.md       # Comprehensive provenance specification
│   ├── architecture.md          # Architectural diagrams and data flow
│   └── database-design.md       # Database schema and relational constraints
├── .env.example                 # Environment variables template
└── README.md                    # Platform documentation
```

---

## Quickstart Guide

### 1. Prerequisites
- **Python**: Version 3.11+
- **Node.js**: Version 18+ (Node 22 supported)
- **Database**: PostgreSQL 14+ (optional; if not running, the platform seamlessly uses SQLite `backend/ncri.db` out of the box).

### 2. Backend Setup & Ingestion

From the project root:

```bash
# 1. Install Python dependencies
pip install -r backend/requirements.txt

# 2. Run the multi-source data ingestion pipeline
python backend/scripts/ingest_all.py

# 3. Launch the FastAPI backend server
python backend/run.py
```
*The FastAPI backend will start on `http://127.0.0.1:8000`. You can inspect the interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.*

### 3. Run Backend Test Suite

```bash
python -m pytest backend/tests -v
```
*Executes all 21 unit and integration tests covering normalizers, deduplication, risk formulas, and API endpoints.*

### 4. Frontend Setup & Execution

Open a new terminal window:

```bash
cd frontend

# 1. Install frontend packages
npm install

# 2. Start the development server
npm run dev
```
*The Next.js analytics platform will be live at `http://localhost:3000`.*

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System status, database dialect, and version |
| `GET` | `/api/incidents` | Paginated incident listing with search, filtering, and sorting |
| `GET` | `/api/incidents/{id}` | Detailed incident record with correlated CVEs |
| `GET` | `/api/analytics/kpis` | Summary KPI cards (total, sources, critical ratio, ransomware %) |
| `GET` | `/api/analytics/trends` | Time-series incident trends with linear forecast projection |
| `GET` | `/api/analytics/sectors` | Sector-wise incident volume and average severity |
| `GET` | `/api/analytics/attack-types` | Breakdown of attack vectors and classifications |
| `GET` | `/api/analytics/geography` | Country rankings and regional distributions |
| `GET` | `/api/risk/index` | Computed NCRI scores across all canonical sectors |
| `GET` | `/api/risk/methodology` | Mathematical formula, weights, and documentation |
| `POST`| `/api/risk/calculate` | Recalculate NCRI with custom weights or timeframe |
| `GET` | `/api/sources` | Data source registry with last sync status |
| `POST`| `/api/sources/{slug}/sync` | Trigger on-demand sync adapter for a source |
| `POST`| `/api/sources/upload` | Upload and ingest custom CSV or JSON dataset |
| `GET` | `/api/vulnerabilities` | CISA KEV catalog search with ransomware campaign filter |
| `GET` | `/api/reports/export-csv` | Stream filtered incident dataset as downloadable CSV |

---

## National Cyber Risk Index (NCRI v1.0.0)

The **National Cyber Risk Index (NCRI)** provides a common analytical measure for comparing observed cyber risk across industry sectors:

$$\text{NCRI}_{s, t} = (w_f \cdot F_{s, t}) + (w_s \cdot S_{s, t}) + (w_c \cdot C_s) + (w_e \cdot E_{s, t})$$

- **$F_{s, t}$ (Frequency Score)**: Log-scaled incident volume for sector $s$ relative to the peak sectoral volume ($0 \text{--} 100$).
- **$S_{s, t}$ (Severity Score)**: Empirical mean severity score of incidents targeting the sector ($0 \text{--} 100$).
- **$C_s$ (Criticality Score)**: Inherent systemic criticality based on national critical infrastructure designations ($0 \text{--} 100$).
- **$E_{s, t}$ (Exploitation Velocity)**: Proportion of weaponized attacks (Ransomware, Zero-day/CVE exploitation, Supply Chain) observed in sector ($0 \text{--} 100$).
- **Tiers**: Low ($<25$), Moderate ($25\text{--}49.9$), Elevated ($50\text{--}69.9$), High ($70\text{--}84.9$), Severe ($85\text{--}100$).

---

## Testing & Quality Assurance

The platform includes an automated pytest suite covering:
- **Normalizer Tests** (`test_normalizer.py`): Date normalization, sector mapping, country ISO codes, attack type taxonomy, severity calculation.
- **Deduplication Tests** (`test_deduplication.py`): Key stability, legal suffix stripping, composite fingerprint collisions, raw payload hashing.
- **Risk Engine Tests** (`test_risk_engine.py`): Tier classification, weight consistency, methodology integrity.
- **API Tests** (`test_api.py`): Health checks, incident pagination and filtering, analytics KPIs, risk index calculation, CSV export.

---

## Troubleshooting

- **PostgreSQL Connection Error**: If PostgreSQL is not installed or the local daemon is stopped, the application automatically uses SQLite (`backend/ncri.db`) without crashing. To use PostgreSQL, ensure PostgreSQL is running and update `DATABASE_URL` in `.env`.
- **Port Conflict (8000 / 3000)**: Backend runs on port 8000 and Next.js runs on port 3000. Ensure no other applications are using these ports or configure alternative ports in `backend/run.py` and `frontend/package.json`.
