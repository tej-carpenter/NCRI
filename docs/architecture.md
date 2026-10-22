# System Architecture Specification

The **National Cyber Incident Analytics Platform for Trend Analysis and Risk Assessment (NCRI)** is architected as an enterprise-grade, decoupled full-stack analytics platform.

---

## 1. High-Level Architectural Diagram

```
+---------------------------------------------------------------------------------------+
|                                DATA ACQUISITION LAYER                                 |
|                                                                                       |
|  +--------------------+   +-------------------+   +---------------+   +------------+  |
|  | UMD CISSM Database |   |  Ransomware.live  |   |   CISA KEV    |   |  CERT-In   |  |
|  |   (CSV Export)     |   |    (REST API)     |   |  (JSON Feed)  |   | (National) |  |
|  +---------+----------+   +---------+---------+   +-------+-------+   +-----+------+  |
+------------|------------------------|---------------------|-----------------|---------+
             |                        |                     |                 |
             v                        v                     v                 v
+---------------------------------------------------------------------------------------+
|                              INGESTION & PIPELINE LAYER                               |
|                                                                                       |
|  +---------------------------------------------------------------------------------+  |
|  | BaseAdapter Interface -> [CISSMAdapter, RansomwareLiveAdapter, CisaKevAdapter]  |  |
|  +---------------------------------------------------------------------------------+  |
|  | Normalization Engine (Dates, NAICS/Sectors, ISO Countries, Threat Classifiers)  |  |
|  +---------------------------------------------------------------------------------+  |
|  | Deduplication & Fingerprinting (SHA-256 Composite Keys, In-Memory Collision Set)|  |
|  +---------------------------------------------------------------------------------+  |
|  | Ingestion Run Auditor (Metrics: Processed, Ingested, Skipped, Updated, Errors)  |  |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                               PERSISTENCE & STORAGE LAYER                             |
|                                                                                       |
|  PostgreSQL 15+ (Production Dialect) with SQLite Seamless Auto-Fallback               |
|                                                                                       |
|  +-------------------+  +------------------+  +------------------------------------+  |
|  |  cyber_incidents  |  |  data_sources    |  |  vulnerabilities (CISA KEV)        |  |
|  +---------+---------+  +--------+---------+  +-----------------+------------------+  |
|            |                     |                              |                     |
|            |            +--------+---------+          +---------+----------+          |
|            |            |  ingestion_runs  |          | incident_vulns link|          |
|            |            +------------------+          +--------------------+          |
|            v                                                                          |
|  +--------------------+                                                               |
|  |  risk_assessments  |                                                               |
|  +--------------------+                                                               |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                           ANALYTICS & RISK ENGINE LAYER                               |
|                                                                                       |
|  * AnalyticsService: SQL aggregates for KPIs, moving averages, distributions          |
|  * Predictive Component: Linear trend trajectory forecasting                          |
|  * NCRI Engine: NCRI = (wf*Fs) + (ws*Ss) + (wc*Cs) + (we*Es)                          |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                              REST API APPLICATION LAYER                               |
|                                                                                       |
|  FastAPI + Pydantic v2 + SQLAlchemy 2.0 (Port 8000)                                   |
|  /api/health       /api/incidents        /api/analytics/kpis      /api/analytics/trends|
|  /api/risk/index   /api/risk/calculate   /api/sources/sync        /api/reports/csv    |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                               PRESENTATION & FRONTEND                                 |
|                                                                                       |
|  Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Recharts (Port 3000)      |
|  * Executive KPI Dashboard       * Incident Explorer with Inspection Drawer           |
|  * Temporal Trend Analysis       * Sector Impact & Taxonomy Decomposition             |
|  * Geographic Breakdown (India)  * Interactive NCRI Weight Simulation Engine          |
|  * CISA KEV Intelligence         * Ingestion Pipeline Audit & Ad-Hoc CSV Upload       |
+---------------------------------------------------------------------------------------+
```

---

## 2. Ingestion Pipeline & Normalization Workflow

1. **Extraction**:
   - Adapters inherit from `BaseAdapter`.
   - Data can be retrieved via HTTP GET requests or ingested from structured local files in `backend/data/raw/`.
2. **Schema Normalization**:
   - **Dates**: Cleaned to ISO `YYYY-MM-DD`, with `year` and `month` extracted.
   - **Sectors**: Standardized into 10 canonical sectors (Healthcare, Energy, Government, Finance, IT/Telecom, Manufacturing, Education, Transportation, Commercial, Other) using NAICS two-digit code parsing and keyword taxonomy.
   - **Geographies**: Normalized to standard country names, ISO 2-letter codes, and regional zones (Asia-Pacific, North America, Europe, etc.).
   - **Attack Types**: Unified into canonical classes: Ransomware & Extortion, Data Breach, DDoS, Vulnerability Exploitation, Malware/Espionage, Supply Chain, and Unauthorized Access.
   - **Severity Scoring**: Empirical continuous score calculated on a 0.0 to 10.0 scale and mapped to categorical tiers (Low, Medium, High, Critical).
3. **Deduplication Engine**:
   - Computes deterministic SHA-256 fingerprint:
     `SHA256(cleaned_victim + incident_date + attack_type)`.
   - Maintains in-memory collision sets for fast batch lookup.
   - If an existing record is encountered, the raw data hash is compared. If unchanged, the record is flagged as `records_skipped`. If modified, it is safely updated (`records_updated`).

---

## 3. National Cyber Risk Index (NCRI v1.0.0)

The NCRI calculation formula is:

$$\text{NCRI}_{s, t} = (w_f \cdot F_{s, t}) + (w_s \cdot S_{s, t}) + (w_c \cdot C_s) + (w_e \cdot E_{s, t})$$

Where:
- $F_{s, t}$ (**Incident Frequency Score**): Log-scaled incident volume for sector $s$ relative to peak volume:
  $$F_{s, t} = 100 \times \frac{\ln(1 + N_{s, t})}{\ln(1 + \max_k N_{k, t})}$$
- $S_{s, t}$ (**Attack Severity Score**): Empirical average severity of incidents targeting sector $s$ (scaled to 0–100):
  $$S_{s, t} = 10 \times \bar{\text{severity}}_s$$
- $C_s$ (**Sector Criticality Score**): Inherent systemic criticality based on national infrastructure designations (Healthcare: 100, Energy: 100, Government/Defense: 95, Finance: 90, IT: 85, Transportation: 80, Manufacturing: 70, Education: 60, Commercial: 50, Other: 40).
- $E_{s, t}$ (**Exploitation Velocity Score**): Proportion of high-impact attacks (Ransomware, Zero-day/CVE exploitation, Supply Chain) observed in sector $s$ (0–100):
  $$E_{s, t} = 100 \times \frac{N_{\text{exploited}, s}}{N_s}$$
- **Default Weights**:
  - $w_f = 0.35$ (Exposure / Volume)
  - $w_s = 0.30$ (Impact / Severity)
  - $w_c = 0.20$ (Criticality)
  - $w_e = 0.15$ (Weaponization Velocity)
- **Risk Tiers**:
  - 85.0 – 100.0: **Severe Risk**
  - 70.0 – 84.9: **High Risk**
  - 50.0 – 69.9: **Elevated Risk**
  - 25.0 – 49.9: **Moderate Risk**
  - 0.0 – 24.9: **Low Risk**
