# Database Design Specification

The platform utilizes a relational database schema designed for analytical query performance, provenance auditing, and threat intelligence separation.

---

## 1. Relational Entity-Relationship Diagram

```
+--------------------+               +-----------------------+
|    data_sources    | 1           * |    cyber_incidents    |
+--------------------+---------------+-----------------------+
| id (PK)            |               | id (PK)               |
| slug (UK)          |               | incident_ref          |
| name               |               | source_id (FK)        |
| source_type        |               | title                 |
| base_url           |               | incident_date         |
| update_frequency   |               | year, month           |
| last_sync_at       |               | victim_name           |
| last_sync_status   |               | sector, subsector     |
+---------+----------+               | country, country_code |
          |                          | region, state_province|
          | 1                        | attack_type, subtype  |
          |                          | threat_actor, motive  |
          | *                        | severity, sev_score   |
+---------+----------+               | impact_level          |
|   ingestion_runs   |               | deduplication_key (UK)|
+--------------------+               | raw_data_hash         |
| id (PK)            |               +-----------+-----------+
| source_id (FK)     |                           | 1
| status             |                           |
| started_at         |                           | *
| completed_at       |               +-----------+-----------+               +--------------------+
| total_processed    |               | incident_vulns (link) | *           1 |  vulnerabilities   |
| records_ingested   |               +-----------------------+---------------+--------------------+
| records_skipped    |               | id (PK)               |               | id (PK)            |
| records_updated    |               | incident_id (FK)      |               | cve_id (UK)        |
| error_message      |               | vulnerability_id (FK) |               | vendor_project     |
+--------------------+               | relationship_type     |               | product            |
                                     | confidence            |               | vulnerability_name |
                                     +-----------------------+               | date_added         |
                                                                             | short_description  |
                                                                             | required_action    |
                                                                             | ransomware_use     |
                                                                             +--------------------+
+-----------------------+
|   risk_assessments    |
+-----------------------+
| id (PK)               |
| assessment_period     |
| sector                |
| country               |
| incident_count        |
| frequency_score       |
| severity_score        |
| criticality_score     |
| exploitation_score    |
| ncri_score            |
| risk_tier             |
| methodology_version   |
| parameters_json       |
+-----------------------+
```

---

## 2. Table Schemas & Constraints

### 2.1 `cyber_incidents`
Stores normalized, confirmed cyber incident events.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Unique auto-incrementing incident identifier |
| `incident_ref` | VARCHAR(100) | INDEX, NOT NULL | Original record identifier from source feed |
| `source_id` | INTEGER | FOREIGN KEY (`data_sources.id`) | Foreign key linking to provenance feed |
| `title` | VARCHAR(255) | NULLABLE | Concise event title |
| `description` | TEXT | NULLABLE | Detailed incident narrative |
| `incident_date` | VARCHAR(20) | INDEX, NOT NULL | Normalized ISO date (`YYYY-MM-DD`) |
| `year` | INTEGER | INDEX | Extracted calendar year for fast grouping |
| `month` | INTEGER | NULLABLE | Calendar month (1–12) |
| `victim_name` | VARCHAR(255) | INDEX | Target entity or organization |
| `sector` | VARCHAR(100) | INDEX, NOT NULL | Canonical normalized sector |
| `subsector` | VARCHAR(150) | NULLABLE | Granular industry classification |
| `country` | VARCHAR(100) | INDEX | Sovereign state where victim is located |
| `country_code` | VARCHAR(10) | INDEX | ISO 2-letter country code |
| `region` | VARCHAR(50) | INDEX | Continental geopolitical region |
| `state_province` | VARCHAR(100) | NULLABLE | Regional state/province (e.g. Delhi, Maharashtra) |
| `attack_type` | VARCHAR(100) | INDEX, NOT NULL | Canonical attack classification |
| `attack_subtype` | VARCHAR(150) | NULLABLE | Granular vector or technique |
| `threat_actor` | VARCHAR(150) | INDEX | Attributed threat actor or syndicate |
| `actor_type` | VARCHAR(100) | NULLABLE | Criminal, State-sponsored, Hacktivist |
| `motive` | VARCHAR(100) | NULLABLE | Financial, Espionage, Protest |
| `severity` | VARCHAR(20) | INDEX | Categorical severity: Low, Medium, High, Critical |
| `severity_score` | FLOAT | DEFAULT 5.0 | Continuous score: 0.0 to 10.0 |
| `impact_level` | VARCHAR(20) | DEFAULT 'Moderate' | Operational disruption level |
| `records_affected` | BIGINT | NULLABLE | Verified records compromised (PII/accounts) |
| `source_url` | TEXT | NULLABLE | External public bulletin or advisory URL |
| `raw_data_hash` | VARCHAR(64) | NULLABLE | SHA-256 hash of raw input data to detect updates |
| `deduplication_key`| VARCHAR(64) | UNIQUE, INDEX, NOT NULL | SHA-256 fingerprint for deduplication |

**Composite Indexes**:
- `idx_incident_year_sector` (`year`, `sector`)
- `idx_incident_country_year` (`country`, `year`)
- `idx_incident_attack_sector` (`attack_type`, `sector`)

---

### 2.2 `vulnerabilities` (CISA KEV Catalog)
Maintains threat intelligence records separate from confirmed incidents.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Auto-increment ID |
| `cve_id` | VARCHAR(50) | UNIQUE, INDEX, NOT NULL | Standard CVE identifier (e.g. CVE-2022-41082) |
| `vendor_project` | VARCHAR(150) | INDEX | Software vendor |
| `product` | VARCHAR(150) | NULLABLE | Impacted software package |
| `vulnerability_name` | VARCHAR(255) | NULLABLE | Official vulnerability name |
| `date_added` | VARCHAR(50) | NULLABLE | Date added to KEV catalog |
| `short_description`| TEXT | NULLABLE | Technical summary of exploit mechanism |
| `required_action` | TEXT | NULLABLE | Mandated remediation action |
| `known_ransomware_campaign_use` | VARCHAR(50) | NULLABLE | 'Known' or 'Unknown' |
| `cvss_score` | FLOAT | NULLABLE | Base CVSS severity rating |

---

### 2.3 `incident_vulnerabilities`
Many-to-many relationship linking confirmed incidents to weaponized CVEs.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Auto-increment ID |
| `incident_id` | INTEGER | FOREIGN KEY (`cyber_incidents.id`) | Linked incident |
| `vulnerability_id` | INTEGER | FOREIGN KEY (`vulnerabilities.id`) | Linked CVE record |
| `relationship_type` | VARCHAR(50) | DEFAULT 'exploited_cve' | 'exploited_cve', 'suspected_vector' |
| `confidence` | FLOAT | DEFAULT 1.0 | Correlation confidence rating (0.0 to 1.0) |

---

### 2.4 `data_sources` & `ingestion_runs`
Maintains data provenance, execution logs, and audit trails.

- `data_sources`: Registry storing source metadata, licenses, sync cadences, and last sync timestamps.
- `ingestion_runs`: Execution audit trail logging total records processed, ingested, skipped (deduplicated), and errors.

---

### 2.5 `risk_assessments`
Persists computed National Cyber Risk Index (NCRI) assessments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Auto-increment ID |
| `assessment_period`| VARCHAR(50) | INDEX, NOT NULL | 'All-Time', '2026', '2025' |
| `sector` | VARCHAR(100) | INDEX, NOT NULL | Canonical target sector |
| `country` | VARCHAR(100) | INDEX, DEFAULT 'All' | Sovereign country scope |
| `incident_count` | INTEGER | DEFAULT 0 | Count of incidents analyzed |
| `frequency_score` | FLOAT | DEFAULT 0.0 | Normalized frequency score $F_s$ (0–100) |
| `severity_score` | FLOAT | DEFAULT 0.0 | Normalized severity score $S_s$ (0–100) |
| `criticality_score`| FLOAT | DEFAULT 0.0 | Systemic criticality weight $C_s$ (0–100) |
| `exploitation_score`| FLOAT | DEFAULT 0.0 | Exploitation velocity $E_s$ (0–100) |
| `ncri_score` | FLOAT | NOT NULL | Composite NCRI score (0.0 to 100.0) |
| `risk_tier` | VARCHAR(20) | NOT NULL | Low, Moderate, Elevated, High, Severe |
| `methodology_version`| VARCHAR(20) | DEFAULT 'v1.0.0'| Locked methodology version string |
| `parameters_json` | TEXT | NULLABLE | JSON parameters and weights for audit |
