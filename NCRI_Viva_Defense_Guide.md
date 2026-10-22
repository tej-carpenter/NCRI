# National Cyber Incident Analytics Platform (NCRI)
## Project Review II — Comprehensive Slide-by-Slide Defense & Viva Guide
**Degree:** Master of Computer Applications (MCA) — Semester 5 (PWPI)  
**Institution:** National Institute of Technology, Tiruchirappalli (NITT)  
**Candidate:** Tej Prakash Carpenter (Roll No: 205124101)  
**Supervisor / Guide:** Dr. Sindhia Lingaswamy, Assistant Professor, Dept. of Computer Applications  
**Deck File:** `NCRI.pptx` | **PDF Document:** `NCRI.pdf`

---

## Slide 1: Title Slide
- **Slide Title:** National Cyber Incident Analytics Platform (NCRI) for Trend Analysis and Risk Assessment
- **Subtitle:** A Deterministic, Open-Source Framework for Cross-Sector Cyber Risk Intelligence and Empirical Incident Analytics
- **Metadata:** MCA Project Work Phase I (PWPI) — Review II | NIT Tiruchirappalli | Candidate: Tej Prakash Carpenter (205124101) | Guide: Dr. Sindhia Lingaswamy

### 1. Presentation Script & Talking Points
> *"Good morning, respected members of the evaluation committee and my guide, Dr. Sindhia Lingaswamy. I am Tej Prakash Carpenter, roll number 205124101, presenting Project Work Phase I Review II on the 'National Cyber Incident Analytics Platform (NCRI) for Trend Analysis and Risk Assessment'.*  
> *In today's threat landscape, cybersecurity decision-makers face fragmented, heterogeneous feeds that lack empirical standardization. In this project, we have designed and implemented a full-stack, deterministic data engineering and analytics platform that ingests raw, disparate global and national incident feeds, deduplicates and normalizes them into a canonical schema, and produces an explainable, auditable 0–100 National Cyber Risk Index across critical economic sectors."*

### 2. Deep Technical Breakdown
- **Core Motivation:** Bridging the chasm between raw threat telemetry and strategic macro-level risk intelligence.
- **Key Tenet:** Complete mathematical determinism. Unlike proprietary vendor models (e.g., BitSight, SecurityScorecard) that rely on opaque black-box heuristics or stochastic simulations, NCRI is designed on an open, auditable, and reproducible mathematical framework.
- **Academic Scope (MCA Review II):** Delivery of the end-to-end operational architecture: multi-source acquisition, automated pipeline engineering, relational data lake with audit logging, deterministic scoring formulation, high-throughput REST API, and interactive analytics dashboard.

### 3. Potential Viva / Panel Questions & High-Scoring Answers

#### Q1.1: What is the core academic and engineering contribution of this project compared to existing commercial platforms like Recorded Future or BitSight?
- **Answer:** *"Commercial platforms focus primarily on external posture scanning—such as open ports, DNS misconfigurations, or leaked credentials—and process them through proprietary, closed-source scoring algorithms. In contrast, NCRI's contribution is twofold:*
  1. *It focuses on **empirical incident ground-truth** (actual reported breach events, ransomware extortion disclosures, and weaponized CVEs) rather than passive vulnerability scans.*
  2. *It implements a **transparent, auditable, and deterministic formulation** for national and sectoral risk scoring. Every score can be mathematically audited back to its underlying incident frequency, normalized severity, critical infrastructure weight, and exploitation velocity, ensuring academic reproducibility and forensic verifiability."*

#### Q1.2: Why is the title focused on a 'National' platform rather than an enterprise risk tool?
- **Answer:** *"Enterprise risk tools analyze micro-level attack surfaces (e.g., endpoints, firewalls, CVEs inside a specific company). NCRI is designed as a macro-level cyber intelligence platform for sector-wide situational awareness, CERT bodies, national policymakers, and academic researchers. It aggregates trends across critical infrastructure sectors (Banking, Energy, Healthcare, Government) to evaluate relative macro risk, policy efficacy, and threat-actor targeting behaviors over multi-year longitudinal windows."*

---

## Slide 2: The Problem and the Platform's Purpose
- **Slide Title:** The Problem and the Platform's Purpose
- **Subtitle:** Addressing Cyber Incident Data Fragmentation, Asymmetry, and Subjective Risk Scoring
- **Three Pillars:**
  1. *Cross-Dimensional Comparison:* Eliminating silos across geography, time, sector, and attack vectors with unified schemas.
  2. *Actionable Situational Awareness:* Empowering analysts and policymakers with real-time and historical trend intelligence.
  3. *Provenanced & Repeatable Scoring:* Moving away from subjective black-box scoring to an auditable, empirical formulation.
- **Callout:** *"NCRI bridges the gap between raw, unstructured incident feeds and strategic national cyber situational awareness."*

### 1. Presentation Script & Talking Points
> *"Moving to Slide 2, we define the exact problem space. Currently, cyber incident intelligence suffers from three crippling bottlenecks:*  
> *First, **Data Fragmentation**: Threat intelligence is siloed. Dark web ransomware leak sites report victim names; national CERTs release aggregate annual PDFs; academic repositories maintain historical CSVs; and vulnerability databases like CISA maintain CVE catalogs. There is no unified canonical schema.*  
> *Second, **Data Asymmetry & Subjectivity**: Most threat reports use arbitrary qualifiers like 'High Risk' or 'Critical Alert' without mathematical justification.*  
> *Third, **Lack of Provenance**: When an organization is reported breached across three different feeds, traditional systems either duplicate the entry or artificially inflate threat metrics. NCRI solves this by providing a unified canonical data pipeline, cryptographic deduplication, and an explainable scoring formula."*

### 2. Deep Technical Breakdown
- **Siloed Ontologies:** For instance, CISSM categorizes attacks as "Exploitative / Disruptive", Ransomware.live logs threat actor names ("LockBit3", "BlackCat"), and CERT-In categorizes by incident count (e.g., "Phishing", "Website Defacement"). NCRI maps these into a unified hierarchical taxonomy (`attack_type` -> `attack_subtype`).
- **Auditability:** Every metric calculated in NCRI maintains a direct foreign-key link to `ingestion_runs` and `cyber_incidents`, preserving strict data lineage.

### 3. Potential Viva / Panel Questions & High-Scoring Answers

#### Q2.1: How do you define 'Data Asymmetry' in this context, and how does your architecture mitigate it?
- **Answer:** *"Data asymmetry occurs because regulated sectors (such as Banking and Healthcare) and western jurisdictions have strict statutory breach notification laws (e.g., GDPR, HIPAA, RBI cyber security framework), leading to higher public reporting. Conversely, unregulated sectors or jurisdictions with voluntary reporting appear artificially safe due to under-reporting. NCRI mitigates this by:*
  1. *Standardizing data across both mandatory disclosures and dark-web extortion tracker feeds.*
  2. *Incorporating sub-linear logarithmic damping in frequency scoring so volume spikes from reporting mandates do not skew the index linearly.*
  3. *Explicitly presenting reporting provenance and confidence flags on the dashboard rather than creating false equivalence."*

#### Q2.2: What do you mean by 'Provenanced Scoring'?
- **Answer:** *"In data science, provenance refers to the complete lineage and origin record of an artifact. By provenanced scoring, we mean that if the Banking sector receives an NCRI score of 72.4, an auditor can query the database to inspect the exact batch of deduplicated incidents, the exact raw source hashes, the date range of the sample, and the step-by-step intermediate normalized values ($F_{norm}, S_{norm}, C_{base}, V_{exploit}$) that produced that number. There are no black-box weights or hidden probabilistic parameters."*

---

## Slide 3: Data Sources and Collection Methods
- **Slide Title:** Data Sources and Collection Methods
- **Subtitle:** Multi-Source Heterogeneous Intelligence Aggregation Across Global, National & Threat-Actor Feeds
- **Four Primary Data Sources:**
  1. *UMD CISSM:* University of Maryland Center for International & Security Studies at Maryland. Global historical state and non-state incidents (CSV).
  2. *Ransomware.live:* Real-time dark-web extortion monitoring tracking active victim claims and data leak sites (REST API).
  3. *CERT-In / MeitY:* Indian national cybersecurity repository & parliamentary disclosures; Indian sectoral attack metrics (CSV/Official tabular disclosures).
  4. *CISA KEV:* Cybersecurity and Infrastructure Security Agency Known Exploited Vulnerabilities catalog; ground truth on weaponized CVEs (JSON feed).
- **Intake Flow:** Specialized Ingestion Engine -> Universal Source Adapters -> Schema Validation -> Canonical Record Store.

### 1. Presentation Script & Talking Points
> *"Slide 3 outlines our intelligence ingestion foundation. We purposefully select four diverse, complementary data streams:*  
> *UMD CISSM provides longitudinal, academically validated historical records from 2014 to the present.*  
> *Ransomware.live acts as our real-time telemetry, directly polling dark-web leak sites (Tor hidden services) via REST API to capture extortion attacks within hours of publication.*  
> *CERT-In and MeitY reports provide national ground truth for the Indian cyber landscape, reflecting official parliamentary disclosures and sectoral incident logs.*  
> *Finally, CISA KEV acts as our authoritative vulnerability catalog, allowing us to correlate incident disclosures with confirmed, weaponized zero-days and vulnerabilities actively exploited in the wild.*  
> *All feeds are ingested via modular `BaseAdapter` classes into our central pipeline."*

### 2. Deep Technical Breakdown
| Source | Ingestion Protocol | Data Format | Polling Cadence | Primary Value |
|---|---|---|---|---|
| **UMD CISSM** | Automated HTTP/CSV Fetcher | CSV / Tabular | Static Batch / Periodic | Verified geopolitical motives, state-sponsored attribution, historic baseline |
| **Ransomware.live** | Async REST API Client | JSON | Hourly / Daily Cron | Real-time dark web extortion tracking, threat actor identity, leak sites |
| **CERT-In / MeitY** | Normalized Ingestion Script | Structured CSV / Tabular | Periodic / Annual Release | Indian domestic threat landscape, parliamentary disclosures |
| **CISA KEV** | HTTP GET automated sync | JSON (Catalog Schema) | Daily Automated Sync | Definitive catalog of weaponized CVEs exploited in the wild |

### 3. Potential Viva / Panel Questions & High-Scoring Answers

#### Q3.1: How do you scrape or poll Ransomware.live without getting blocked or encountering CAPTCHAs?
- **Answer:** *"We do not perform brittle HTML web scraping against dark web Tor sites directly. Instead, we interface with the official Ransomware.live REST API (`/v2/recentvictims`, `/v2/groups`). Our adapter implements standard REST client best practices: custom User-Agent headers, configurable connection timeouts (10 seconds), automatic exponential backoff retry mechanisms for HTTP 429/503 responses, and client-side pagination caching."*

#### Q3.2: Why did you include CISA KEV if it is a vulnerability database rather than an incident database?
- **Answer:** *"This was a critical design choice. A vulnerability (CVE) is a potential weakness, whereas an incident is a realized security compromise. Most CVEs are never actively weaponized. By integrating CISA KEV, we cross-reference whether incidents recorded in our database exploited vulnerabilities that have confirmed in-the-wild weaponization. This directly feeds into our 'Exploitation Velocity' ($V_{exploit}$) metric in the NCRI index."*

#### Q3.3: How do you handle network failures or downtime when fetching remote APIs?
- **Answer:** *"The ingestion engine runs through a transactional `BaseAdapter` wrapper. If a network socket timeout or HTTP 5xx error occurs, the pipeline catches the exception, logs the error into the `ingestion_runs` table with status `FAILED`, and rolls back the database transaction. Previous operational data is never corrupted, and the system can resume from the last successful checkpoint."*

---

## Slide 4: What Data Is Captured?
- **Slide Title:** What Data Is Captured?
- **Subtitle:** Standardized Taxonomy and Canonical Schema Definition for Comprehensive Incident Profiling
- **Core Ingestion Principles (Left):**
  - *Strict Normalization:* Dates ISO 8601 (`YYYY-MM-DD`), Countries ISO 3166-1 alpha-3, Sectors normalized to standard taxonomy.
  - *Decoupled CVE Storage:* Vulnerabilities tracked in dedicated entity; linked only when empirical evidence confirms exploitation.
  - *Audit Trail Integrity:* Every record tracks source, raw payload hash, ingestion timestamp, and confidence flag.
- **10 Canonical Fields (Right):**
  1. Incident Date | 2. Victim Organization | 3. Source Reference | 4. Public Reference | 5. Sector & Subsector | 6. Country & Region | 7. Attack Type & Subtype | 8. Threat Actor & Motive | 9. Severity / Impact | 10. CVE Metadata.

### 1. Presentation Script & Talking Points
> *"On Slide 4, we examine our canonical schema. When raw data arrives from diverse sources, it uses conflicting formats—dates are formatted as MM/DD/YYYY, DD-MM-YYYY, or epoch timestamps; country names appear as 'USA', 'United States', or 'US'; and victim names contain typos or legal suffixes.*  
> *We enforce a strict 10-field canonical schema. Key principles include: converting all dates to ISO 8601, mapping countries to ISO 3166-1 alpha-3 three-letter codes, and standardizing industry sectors into 12 core verticals. Crucially, we decouple CVE storage: vulnerabilities reside in a separate relational table and are only linked via an associative table when there is verified evidence of weaponization."*

### 2. Deep Technical Breakdown
- **Date Normalization:** Regex parser handles 6 different date permutations, defaulting to `YYYY-MM-01` if only month/year are reported, preserving partial temporal precision.
- **Taxonomy Resolution:** Multi-tier dictionary mapping sector aliases (e.g., "Financial Institutions", "Fintech", "Commercial Bank" $\rightarrow$ `Banking & Finance`).
- **Entity Decoupling:** Decoupling `cyber_incidents` and `vulnerabilities` through an M:N link table `incident_vulnerabilities` prevents denormalization anomalies and supports multi-CVE exploitation analysis.

### 3. Potential Viva / Panel Questions & High-Scoring Answers

#### Q4.1: Why did you decouple CVE storage instead of adding a simple `cve_id` VARCHAR column in the incidents table?
- **Answer:** *"In modern advanced persistent threat (APT) attacks and multi-stage ransomware campaigns, threat actors rarely exploit a single CVE. An attack may leverage CVE-2023-34362 (MOVEit Transfer) for initial access and CVE-2021-34527 (PrintNightmare) for lateral privilege escalation. A single VARCHAR column would violate 1st Normal Form (1NF) or limit us to 1 CVE per incident. By creating a normalized Many-to-Many relationship (`cyber_incidents` $\leftrightarrow$ `incident_vulnerabilities` $\leftrightarrow$ `vulnerabilities`), we can attach multiple CVEs with individual exploitation confidence scores and CVSS metadata."*

#### Q4.2: How do you handle ambiguous country names (e.g., 'Global', 'Multiple', 'Unknown')?
- **Answer:** *"In our normalization engine, if an incident affects multinational operations or an international supply chain, we map it to the ISO alpha-3 code `GLO` (Global) or preserve `NULL` with a confidence flag `MULTI_JURISDICTION`. We never fabricate a country guess, which would corrupt country-level risk heatmaps."*

---

## Slide 5: The Data Engineering Pipeline
- **Slide Title:** The Data Engineering Pipeline
- **Subtitle:** End-to-End Ingestion, Deduplication, and Auditing Architecture
- **Four Sequential Pipeline Stages:**
  1. *Source Adapters:* Specialized modular extractors ingest raw feeds (REST API, JSON, CSV). Handle rate limiting, backoff, and pagination.
  2. *Normalization Engine:* Cleans strings, resolves country names to ISO codes, maps sector aliases to unified taxonomy, parses diverse date formats.
  3. *Fingerprint De-Duplication:* SHA-256 composite fingerprint generated from: `clean(victim) + incident_date + attack_type`. Prevents cross-feed duplicate records.
  4. *Ingestion Audit:* Immutable run log records batch metrics: records processed, added, skipped, updated, and failed. Preserves data provenance.
- **Design Guarantee:** *"The pipeline ensures zero synthetic data fabrication. Missing fields (e.g., financial losses) are preserved as NULL rather than imputed."*

### 1. Presentation Script & Talking Points
> *"Slide 5 illustrates our data engineering pipeline—the backbone of our data lake. The pipeline operates in four deterministic stages:*  
> *Stage 1 utilizes source-specific adapters that ingest raw feeds with rate-limiting and pagination.*  
> *Stage 2 cleans the payload through our Normalization Engine, stripping legal entity suffixes like 'Inc', 'Ltd', 'LLC', and normalizing taxonomy.*  
> *Stage 3 executes cryptographic de-duplication: we generate a composite SHA-256 hash using the cleaned victim string, the ISO incident date, and the canonical attack type. If an incident from Ransomware.live was already ingested from CISSM, it is detected as a duplicate.*  
> *Stage 4 writes to an immutable Ingestion Audit table, logging processed, added, skipped, and failed records for every batch run. Notice our design guarantee: we preserve missing data as NULL rather than using synthetic imputation, ensuring forensic truth."*

### 2. Deep Technical Breakdown
- **Composite Hash Formulation:**
  $$\text{Payload} = \text{lower}(\text{regex\_replace}(\text{victim}, \text{"(ltd|inc|corp|llc|\.)"}, \text{""})) \parallel \text{date} \parallel \text{attack\_type}$$
  $$\text{Fingerprint} = \text{SHA-256}(\text{Payload})$$
- **Database Indexing:** The `fingerprint` column is indexed with a `UNIQUE` constraint in PostgreSQL, turning collision detection into an $O(1)$ B-Tree lookup.
- **Auditing Schema:**
  - `ingestion_runs(id, source_id, started_at, completed_at, status, records_processed, records_added, records_skipped, records_failed, error_log)`

### 3. Potential Viva / Panel Questions & High-Scoring Answers

#### Q5.1: Why use SHA-256 for deduplication rather than fuzzy string matching like Levenshtein Distance or Jaro-Winkler?
- **Answer:** *"Fuzzy string matching across tens of thousands of records requires an $O(N^2)$ pairwise comparison, which degrades pipeline performance as the database scales into hundreds of thousands of rows. SHA-256 hashing allows us to pre-clean the strings using deterministic regex normalization (removing spaces, punctuation, company suffixes like 'Pvt Ltd' or 'GmbH') and execute an $O(1)$ indexed lookup. In our roadmap for Phase II, we are adding an asynchronous secondary fuzzy clustering worker for edge cases, but for high-throughput batch ingestion, deterministic hash fingerprinting is superior in both speed and reproducibility."*

#### Q5.2: What happens if the exact date is slightly different between two sources for the same attack (e.g., disclosure date vs. breach date)?
- **Answer:** *"That is a known nuance in cyber incident reporting. Our adapter prioritizes `breach_date` over `disclosure_date`. If two sources report dates differing by several weeks, our primary hash will treat them as two separate events to avoid accidental data loss. However, during aggregation, our analytics layer groups incidents within a sliding temporal window ($\pm 14$ days) for identical victim entities, tagging them as potential multi-source corroborations."*

#### Q5.3: Why do you advocate preserving NULLs instead of using statistical imputation (like mean/median imputation or KNN)?
- **Answer:** *"In financial or demographic machine learning, mean imputation is common. However, in cybersecurity analytics, imputing an unverified financial loss (e.g., claiming a school suffered \$2 million in ransomware damages because the average is \$2M) constitutes data fabrication. It distorts risk scoring and creates legal and forensic inaccuracies. Preserving NULLs ensures that calculations on financial impact or severity only compute over verified empirical observations."*

---

## Slide 6: System Architecture
- **Slide Title:** System Architecture
- **Subtitle:** Modular, Decoupled Three-Tier Engineering Architecture for High Reliability and Scalability
- **The 3 Stages & 6 Architecture Layers:**
  1. *Stage 1: Acquisition & Ingestion*
     - **Acquisition Layer:** External Feeds (`Ransomware.live`, `UMD CISSM`, `CISA KEV`, `CERT-In / MeitY`).
     - **Ingestion Layer:** `BaseAdapter` Interface, Normalization Engine, SHA-256 Deduplication, Ingestion Run Logger.
  2. *Stage 2: Storage & Analytics*
     - **Persistence Layer:** PostgreSQL 15+ Relational Database (`ingestion_runs`, `data_sources`, `cyber_incidents`, `vulnerabilities`, `incident_vulnerabilities`, `risk_assessments`).
     - **Analytics Layer:** `AnalyticsService`, NCRI Risk Engine, Predictive Time-Series Forecaster, Aggregation Workers.
  3. *Stage 3: Application & Presentation*
     - **API Layer:** FastAPI REST Framework, Pydantic v2 Schema Validation, SQLAlchemy 2.0 ORM, Modular Routers.
     - **Presentation Layer:** Next.js 14 App Router, React 18 & TypeScript, Tailwind CSS & Recharts, Interactive Analytics UI (Port 3000).

### 1. Presentation Script & Talking Points
> *"Slide 6 presents our complete System Architecture, structured into three decoupled stages spanning six distinct engineering layers:*  
> *Stage 1 is the Data Acquisition and Ingestion tier, where abstract `BaseAdapter` implementations ingest external feeds and normalize them via SHA-256 fingerprinting.*  
> *Stage 2 is Storage and Core Processing. Our Persistence layer is built on PostgreSQL 15+, structured across six 3NF relational tables. The Analytics layer houses our `AnalyticsService` and deterministic NCRI calculation engine.*  
> *Stage 3 is Application and Presentation. We expose clean, high-performance REST endpoints via FastAPI with Pydantic v2 validation and SQLAlchemy 2.0 ORM. The frontend is built on Next.js 14 and React 18 with TypeScript, offering interactive visualization via Recharts.*  
> *This decoupled design allows the ingestion engine, database, analytics worker, and web client to scale and fail independently without impacting overall system uptime."*

### 2. Deep Technical Breakdown
```
+----------------------------------------------------------------------------------------------------+
|                                      ACQUISITION & INGESTION                                       |
|  [Ransomware.live API]   [UMD CISSM CSV]   [CISA KEV JSON]   [CERT-In Disclosures]                 |
|                                         |                                                          |
|  [BaseAdapter Interface] -> [Normalization Engine] -> [SHA-256 Deduplication] -> [Audit Logger]   |
+----------------------------------------------------------------------------------------------------+
                                          |
                                          v
+----------------------------------------------------------------------------------------------------+
|                                    STORAGE & CORE PROCESSING                                       |
|  PostgreSQL 15+ Relational Database:                                                               |
|    - data_sources               - cyber_incidents            - incident_vulnerabilities            |
|    - ingestion_runs             - vulnerabilities            - risk_assessments                    |
|                                         |                                                          |
|  Analytics Layer:                                                                                  |
|    - AnalyticsService           - NCRI Risk Engine           - Time-Series Aggregators             |
+----------------------------------------------------------------------------------------------------+
                                          |
                                          v
+----------------------------------------------------------------------------------------------------+
|                                   APPLICATION & PRESENTATION                                       |
|  FastAPI Backend (Port 8000):                                                                      |
|    - Pydantic v2 Schemas        - SQLAlchemy 2.0 ORM         - Modular Routers (/incidents, /ncri) |
|                                         |                                                          |
|  Next.js 14 Frontend (Port 3000):                                                                  |
|    - React 18 / TypeScript      - Tailwind CSS               - Recharts Interactive Dashboards     |
+----------------------------------------------------------------------------------------------------+
```

### 3. Potential Viva / Panel Questions & High-Scoring Answers

#### Q6.1: Why did you choose a Relational Database (PostgreSQL) instead of a NoSQL Document Store (like MongoDB)?
- **Answer:** *"While raw incident feeds arrive as semi-structured JSON, our analytics and risk calculations require strict relational integrity, foreign-key constraints, ACID compliance, and complex multi-table analytical joins. For example:*
  1. *Tracking Many-to-Many associations between incidents and CVEs requires relational foreign keys.*
  2. *Auditing ingestion runs against created incidents demands transactional atomicity (`ROLLBACK` on failure).*
  3. *Aggregation queries (GROUP BY sector, temporal bucketing, window functions) are highly optimized in PostgreSQL using B-Tree and BRIN indexes.*
  4. *PostgreSQL 15+ also provides native JSONB support, giving us the flexibility of NoSQL for raw payloads while maintaining the relational rigor of SQL."*

#### Q6.2: Why choose FastAPI over Django or Flask?
- **Answer:** *"FastAPI was selected for three technical reasons:*
  1. *Performance: It is built on Starlette and Uvicorn (ASGI), achieving asynchronous I/O performance on par with NodeJS and Go.*
  2. *Data Validation: Native integration with Pydantic v2 enforces compile-time and runtime type checking, preventing malformed API inputs.*
  3. *Auto-Documentation: FastAPI natively generates interactive OpenAPI (Swagger) specifications (`/docs`), streamlining testing and integration."*

#### Q6.3: How does the Next.js frontend communicate with the FastAPI backend?
- **Answer:** *"The Next.js 14 App Router utilizes server-side fetch calls and client-side SWR/React hooks to query the FastAPI REST endpoints over HTTP/JSON. The backend serves parameterized endpoints such as `/api/v1/incidents/trends`, `/api/v1/ncri/sector-summary`, and `/api/v1/vulns/kev`. All responses are strongly typed in TypeScript via auto-generated interfaces matching Pydantic response models."*

---

## Slide 7: How Data Becomes Insight
- **Slide Title:** How Data Becomes Insight
- **Subtitle:** The Multi-Stage Analytics Transformation Pipeline from Raw Feeds to Strategic Intelligence
- **Data Maturation Lifecycle (3 Stages):**
  1. *Standardized Records:* Clean, normalized, deduplicated incidents with verified source provenance and timestamps.
  2. *Aggregated & Normalized Data:* Cross-dimensional rollups by sector, country, attack vector, and temporal windows.
  3. *NCRI Analytics Engine:* Algorithmic risk computation combining frequency, severity, criticality, and exploit velocity.
- **Five Core Deliverables:**
  - *KPI Dashboards:* Macro incident counters, active threat actor velocity, KEV exposure rates, critical sector alerts.
  - *Temporal Trends:* Multi-year longitudinal incident trends, seasonal attack spikes, weekly frequency shifts.
  - *Sector & Attack Insights:* Threat distribution across critical infrastructure, financial services, healthcare, and public sector.
  - *Geographic Summaries:* Global and national incident distribution heatmaps with country-level vulnerability indexes.
  - *KEV Catalog & Export:* Real-time search of actively exploited CVEs, weaponization timelines, CSV/JSON export.

### 1. Presentation Script & Talking Points
> *"Slide 7 explains how raw data matures into actionable insight. This transformation occurs in three stages:*  
> *First, raw events become **Standardized Records** with clean taxonomies and verified provenance.*  
> *Second, these records are aggregated across dimensions—temporal windows (months, quarters, years), economic sectors, and geographic regions.*  
> *Third, the aggregated data enters the **NCRI Analytics Engine**, which computes our composite risk score.*  
> *This produces five primary analytical deliverables on our dashboard: high-level KPI cards for executives, longitudinal temporal trend lines, sector attack breakdowns, geographic distribution heatmaps, and a searchable CISA KEV catalog with one-click CSV and JSON data export for researchers."*

### 2. Deep Technical Breakdown
- **Aggregation Engine:** Implemented using optimized SQL CTEs (Common Table Expressions) and window functions (`COUNT(*) OVER()`, `DATE_TRUNC('month', incident_date)`), ensuring sub-second response times on datasets exceeding 50,000 records.
- **Caching Layer:** Frequently requested macro metrics (e.g., total incident counts, sector distributions) are calculated through materialized database queries to minimize API latency.

### 3. Potential Viva / Panel Questions & High-Scoring Answers

#### Q7.1: What is the computational complexity of your aggregation pipeline?
- **Answer:** *"With appropriate composite B-tree indexes on `(sector, incident_date)` and `(country_code, incident_date)`, the temporal and sector rollups execute in $O(\log N + K)$ time, where $N$ is the total record count and $K$ is the number of records within the queried filter window. Rather than performing full table scans ($O(N)$), PostgreSQL performs index range scans, ensuring query execution times remain under 40 milliseconds."*

#### Q7.2: Can researchers download the raw and processed data from your platform?
- **Answer:** *"Yes. Slide 7 explicitly highlights our 'KEV Catalog & Export' deliverable. The platform provides streaming CSV and JSON export endpoints (`/api/v1/export/csv`, `/api/v1/export/json`). This fulfills our commitment to open-source, reproducible academic research."*

---

## Slide 8: National Cyber Risk Index (NCRI)
- **Slide Title:** National Cyber Risk Index (NCRI)
- **Subtitle:** A Transparent, Deterministic 0–100 Formulation for Comparative Cross-Sector Risk Evaluation
- **Mathematical Formulation:**
  $$NCRI = 100 \times [ w_F \cdot F_{norm} + w_S \cdot S_{norm} + w_C \cdot C_{base} + w_V \cdot V_{exploit} ]$$
- **Weights & Components:**
  - $w_F = 0.35$ **Incident Frequency ($F_{norm}$):**
    $$F_{norm} = \frac{\log_{10}(V + 1)}{\log_{10}(V_{max} + 1)}$$
    *(Sub-linear logarithmic damping prevents outlier sectors from overwhelming the metric)*
  - $w_S = 0.30$ **Impact Severity ($S_{norm}$):**
    $$S_{norm} = \frac{\bar{S} - S_{min}}{S_{max} - S_{min}}$$
    *(Normalized mean severity based on verified compromise impact)*
  - $w_C = 0.20$ **Sector Criticality ($C_{base}$):**
    *(Fixed domain weights: Energy & Finance = $1.0$; Healthcare = $0.9$; IT = $0.8$; Retail = $0.5$)*
  - $w_V = 0.15$ **Exploitation Velocity ($V_{exploit}$):**
    $$V_{exploit} = \frac{N_{KEV}}{N_{total}}$$
    *(Proportion of sector incidents involving confirmed weaponized CISA KEV vulnerabilities)*
- **Risk Tiers:** Low ($0–24.9$), Moderate ($25–49.9$), Elevated ($50–69.9$), High ($70–84.9$), Severe ($85–100$).
- **Footer:** *"Key Advantage: 100% deterministic, auditable, and reproducible — zero black-box stochastic variance."*

### 1. Presentation Script & Talking Points
> *"Slide 8 is the mathematical core of our project: the National Cyber Risk Index. Existing industry indices are proprietary black boxes. We propose a deterministic, bounded 0–100 composite index governed by four transparent weights that sum to 1.0:*  
> *Frequency receives a 35% weight ($w_F=0.35$). We apply a base-10 logarithmic transformation to the raw incident volume $V$. This is vital: cyber incident counts follow a heavy-tailed power-law distribution. Without log-scaling, a massive phishing surge in one sector would flatten all other sectors to zero.*  
> *Severity receives a 30% weight ($w_S=0.30$), measuring the normalized empirical impact score.*  
> *Sector Criticality receives a 20% weight ($w_C=0.20$), embedding national security priorities—a ransomware attack on an electrical grid or banking core carries far higher systemic risk than an attack on a local retailer.*  
> *Exploitation Velocity receives a 15% weight ($w_V=0.15$), calculating the exact fraction of incidents tied to known exploited vulnerabilities in the CISA KEV catalog.*  
> *The resulting score falls into five intuitive risk tiers, from Low to Severe."*

### 2. Deep Technical Breakdown
- **Linear Convex Combination:** Because $\sum w_i = 0.35 + 0.30 + 0.20 + 0.15 = 1.0$ and each component is strictly bounded:
  $$F_{norm} \in [0, 1], \quad S_{norm} \in [0, 1], \quad C_{base} \in [0, 1], \quad V_{exploit} \in [0, 1]$$
  the inner bracket strictly belongs to $[0, 1]$, and multiplying by 100 guarantees that $NCRI \in [0, 100]$.
- **Why $\log_{10}(V + 1)$?** When $V=0$, $\log_{10}(0 + 1) = 0$, ensuring zero volume translates cleanly to 0 risk contribution without mathematical undefined errors ($\log 0 = -\infty$).
- **Sector Criticality Basis:** Derived from international Critical Information Infrastructure Protection (CIIP) guidelines (such as India's NCIIPC and US CISA 16 critical infrastructure sectors).

### 3. Potential Viva / Panel Questions & High-Scoring Answers

#### Q8.1: How did you determine the component weights (0.35, 0.30, 0.20, 0.15)? Are they arbitrary?
- **Answer:** *"The weights were established through a combination of Analytical Hierarchy Process (AHP) principles and empirical cyber defense priorities:*
  1. *Frequency ($0.35$) and Severity ($0.30$) represent the classical definition of Risk in information security ($\text{Risk} = \text{Likelihood} \times \text{Impact}$), together forming 65% of the index.*
  2. *Sector Criticality ($0.20$) introduces national infrastructural dependency, ensuring the index reflects macro societal harm rather than just commercial counts.*
  3. *Exploitation Velocity ($0.15$) reflects weaponization immediacy—whether attackers are using active zero-days versus commoditized vectors.*
  *In our Phase II roadmap, we are building a sensitivity analysis module to allow policymakers to tune these weights or run Monte Carlo validation across historical datasets."*

#### Q8.2: Why do you need logarithmic scaling for Incident Frequency ($F_{norm}$)? Why not simple min-max normalization?
- **Answer:** *"Cyber incident distributions exhibit extreme right-skewness (Pareto / Power-law distribution). For instance, the IT or Banking sector might record 1,200 incidents in a quarter due to automated credential stuffing, whereas the Water or Energy sector might record only 12. If we applied linear min-max normalization:
  $$\frac{12 - 0}{1200 - 0} = 0.01$$
  The Energy sector's frequency contribution would be virtually zero ($0.01 \times 0.35 = 0.0035$), masking serious targeted activity. By applying sub-linear logarithmic damping:
  $$\log_{10}(12+1) / \log_{10}(1200+1) = \frac{1.11}{3.08} \approx 0.36$$
  The platform preserves sensitivity across low-volume, high-consequence critical infrastructure sectors while dampening high-volume commodity noise."*

#### Q8.3: What if a sector records zero incidents in an evaluation window ($V=0$)?
- **Answer:** *"If $V=0$, $F_{norm} = \log_{10}(0+1)/\log_{10}(V_{max}+1) = 0$. Since there are no incidents, $V_{exploit} = 0$ and $S_{norm} = 0$. The resulting NCRI score would be:
  $$NCRI = 100 \times [0.20 \times C_{base}]$$
  For Energy ($C_{base}=1.0$), the baseline score would be 20.0, which correctly classifies it in the 'Low Risk' tier ($< 25$). This intuitively captures that an essential sector always maintains an inherent baseline criticality even during dormant attack periods."*

---

## Slide 9: Data Quality, Limitations & Responsible Interpretation
- **Slide Title:** Data Quality, Limitations & Responsible Interpretation
- **Subtitle:** Methodological Rigor, Transparency, and Analytical Caveats
- **Four Methodological Realities:**
  1. *Reporting Asymmetry & Incompleteness:* Public feeds disproportionately capture regulated sectors (healthcare, banking) and western jurisdictions. NCRI provides comparative visibility, not an exhaustive census of all covert intrusions.
  2. *Extortion Claims vs. Confirmed Breaches:* Dark web leak sites reflect threat-actor extortion claims, some of which may be exaggerated or duplicative. Records are flagged with source confidence levels to maintain analytical transparency.
  3. *Preserving Nulls vs. Synthetic Imputation:* When incident loss amounts or threat actors are unverified, fields remain NULL. We strictly avoid synthetic imputation to preserve academic and forensic data integrity.
  4. *Comparative Relative Benchmark:* NCRI is designed as a relative macro-level risk indicator across sectors and time periods — not a micro-level deterministic breach predictor for individual organizations.

### 1. Presentation Script & Talking Points
> *"Slide 9 demonstrates our commitment to academic rigor and scientific honesty. Every data science project must acknowledge the boundaries of its dataset:*  
> *First, we acknowledge **Reporting Asymmetry**: Public incident data does not represent an exhaustive census of all intrusions worldwide. Highly regulated sectors report more breaches because the law requires it.*  
> *Second, we distinguish between **Extortion Claims and Confirmed Breaches**: Ransomware leak sites often post extortion claims that might be bluffing or re-posted older breaches. We flag these with source confidence levels.*  
> *Third, we **Preserve NULLs**: We strictly avoid synthetic imputation of financial or victim metrics to maintain forensic integrity.*  
> *Fourth, we clearly define our scope: NCRI is a **Macro Comparative Risk Benchmark** across sectors and time windows, not a crystal-ball breach predictor for individual firms."*

### 2. Deep Technical Breakdown
- **Confidence Flagging:** The schema contains a `confidence_level` ENUM (`VERIFIED_OFFICIAL`, `PUBLIC_MEDIA`, `UNVERIFIED_CLAIM`). Dark web leak site scrapers automatically assign `UNVERIFIED_CLAIM` until corroborated by CERT or news advisories.
- **Academic Grounding:** Cites well-documented statistical phenomena in cyber threat research: *survivorship bias* and *mandatory disclosure skew*.

### 3. Potential Viva / Panel Questions & High-Scoring Answers

#### Q9.1: If dark web claims might be fake or exaggerated, isn't your platform ingesting unverified noise?
- **Answer:** *"Excluding dark-web telemetry would blind the platform to real-time ransomware extortion, which is the most active cyber threat today. Instead of discarding this intelligence, our architecture implements **provenance separation**. Every record is tagged with its source type. In the database and UI, users can toggle filters to view 'Verified Breaches Only' versus 'All Extortion Claims'. In calculating NCRI, extortion claims that lack independent corroboration are weighted with lower severity confidence scores."*

#### Q9.2: How does your platform handle reporting delays (e.g., an incident occurred in March 2024 but was only disclosed in October 2024)?
- **Answer:** *"Our canonical schema captures two distinct timestamps: `incident_date` (the estimated date of compromise) and `created_at` (the date of public disclosure/ingestion). Our trend analysis allows analysts to slice data by both axes: 'Incident Occurrence Timeline' (reflecting adversary operational tempo) versus 'Disclosure Timeline' (reflecting reporting lags and regulatory compliance cycles)."*

---

## Slide 10: Outputs and Next Steps
- **Slide Title:** Outputs and Next Steps
- **Subtitle:** Current Implementation Deliverables and Phase II Development Roadmap
- **What You Get (Delivered in Phase I):**
  - *Unified Incident Data Lake:* Standardized multi-source database with over tens of thousands of normalized records across 4 global feeds.
  - *Interactive Web Analytics UI:* Next.js 14 dashboard with dynamic sector filtering, KPI cards, and responsive trend visualizations.
  - *Deterministic NCRI Scoring:* Automated risk calculation engine producing repeatable 0–100 risk metrics across all major sectors.
  - *Ingestion Audit & Provenance:* Complete database logging of every ingestion run with source attribution, timestamps, and deduplication stats.
  - *Full-Fledged REST API:* FastAPI backend serving paginated incident queries, aggregate rollups, and live KEV vulnerability feeds.
- **What's Next (Phase II Roadmap):**
  - *Source Freshness Heartbeat:* Automated scheduled scrapers with health monitoring and webhook failure alerting.
  - *Automated CVE Corroboration:* NLP-assisted extraction to cross-reference incident disclosures with NVD and KEV catalogs.
  - *Coverage & Under-Reporting Model:* Statistical weighting to compensate for jurisdictional reporting biases and sector asymmetries.
  - *Predictive Trend Forecasting:* Integration of ARIMA / Prophet models to project seasonal attack surges and sector risk shifts.
  - *Role-Based Policy Portal:* Fine-grained access control for institutional researchers, sectoral CERTs, and academic evaluators.
- **Bottom Status:** *"Project Status: Phase I core ingestion, persistence, risk formulation, and presentation layers are fully implemented, tested, and operational."*

### 1. Presentation Script & Talking Points
> *"Finally, on Slide 10, we summarize our accomplishments in Phase I and outline our Phase II roadmap.*  
> *In Phase I, we have delivered a fully operational platform:*  
> *A unified PostgreSQL incident data lake with tens of thousands of normalized records;*  
> *A high-throughput FastAPI backend;*  
> *An interactive Next.js 14 executive dashboard;*  
> *Our deterministic NCRI scoring engine;*  
> *And a comprehensive ingestion audit trail with cryptographic deduplication.*  
> *For Phase II, we will enhance the platform with automated source freshness heartbeats, NLP-driven automated CVE corroboration from unstructured incident text, statistical weighting to adjust for under-reporting bias, and predictive time-series forecasting using ARIMA/Prophet models.*  
> *Thank you, respected committee members. I am now open to your questions and feedback."*

### 2. Deep Technical Breakdown
- **Phase I Current State:** Operational end-to-end full-stack prototype running locally on ports 8000 (FastAPI) and 3000 (Next.js).
- **Phase II Machine Learning Architecture:** Integrating FB Prophet / AutoARIMA over monthly aggregated incident volume to generate 95% confidence interval forecast cones for upcoming quarters.
- **NLP Corroboration:** Using fine-tuned spaCy / regular-expression entity recognizers to automatically extract CVE patterns (`CVE-\d{4}-\d{4,7}`) and victim names from free-text incident descriptions.

### 3. Potential Viva / Panel Questions & High-Scoring Answers

#### Q10.1: What is the main difference between your Phase I work and what is planned for Phase II?
- **Answer:** *"Phase I focused on foundational software and data engineering: architecting the data lake, standardizing heterogeneous feeds, cryptographic deduplication, relational schema normalization, implementing the deterministic NCRI algorithm, and building the interactive UI and REST API.*  
*Phase II shifts into advanced analytics and automation: adding automated scrapers with dead-man heartbeat monitoring, integrating predictive time-series forecasting (ARIMA/Prophet) to project next-quarter sector risk surges, and implementing NLP algorithms to automatically link unannotated incident reports to NVD/CVE records."*

#### Q10.2: Why do you suggest ARIMA or Prophet for cyber incident forecasting instead of complex Deep Learning models like LSTM?
- **Answer:** *"Cyber incident data aggregated at weekly or monthly intervals yields relatively small time-series samples (e.g., 60 to 120 monthly points over 5 to 10 years). Deep Learning architectures like LSTMs or Transformers require tens of thousands of continuous time steps to avoid severe overfitting. Classical statistical models like SARIMA or Bayesian additive models like Prophet handle small-sample temporal seasonality, holiday effects, and trend changepoints with complete mathematical explainability and explicit uncertainty bounds ($95\%$ confidence intervals), which is essential for national risk assessments."*

#### Q10.3: If the review panel asks: 'Can you show me a live demo right now?', how do you respond?
- **Answer:** *"Yes, absolutely. The FastAPI backend is running via Uvicorn on port 8000 with interactive Swagger API docs at `/docs`, and the Next.js 14 frontend is running on port 3000. I can demonstrate live endpoint queries, filter incidents across sectors like Banking and Healthcare, inspect our audit run tables in PostgreSQL, and show real-time NCRI scores computed dynamically across the dataset."*

---

## 🎯 Master Summary Checklist for Viva Defense

| Topic Area | Key Terminology / Concept to State Confidently |
|---|---|
| **Data Ingestion** | Modular `BaseAdapter`, Exponential Backoff, Rate-Limiting, Schema Validation |
| **Deduplication** | Composite SHA-256 Hash (`clean(victim) + date + attack_type`), $O(1)$ B-Tree Index lookup |
| **Data Integrity** | Zero synthetic imputation, Preserving `NULL`s, Provenance tracking in `ingestion_runs` |
| **Database** | PostgreSQL 15+, 3NF Relational Schema, M:N decoupled CVE linkage table |
| **NCRI Formula** | 4-Component Convex Combination ($\sum w_i = 1.0$), Log-scaled Frequency $\log_{10}(V+1)$ |
| **Backend & Frontend** | FastAPI (ASGI, Pydantic v2, SQLAlchemy 2.0) + Next.js 14 (React 18, TypeScript, Recharts) |
| **Limitations** | Mandatory reporting asymmetry, Extortion claim vs. confirmed breach, Relative benchmark |
