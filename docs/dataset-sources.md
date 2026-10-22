# Dataset Sources & Provenance Specification

This document details the public, legally accessible data sources integrated into the **National Cyber Incident Analytics Platform for Trend Analysis and Risk Assessment (NCRI)**.

---

## 1. University of Maryland (UMD) CISSM Cyber Events Database

- **Source Authority**: Center for International and Security Studies at Maryland (CISSM), School of Public Policy, University of Maryland.
- **Reference**: Harry, C., Entrikin, D., & Lucyshyn, W. (2026). *The University of Maryland’s Cyber Events Database 2.0: A Systematic Framework for Analyzing Global Cyber Threats.*
- **Public URL**: [https://cissm.umd.edu/cyber-events-database](https://cissm.umd.edu/cyber-events-database)
- **Data Repository**: Open academic research export (`CISSM-export-21APR2023.csv`).
- **Access Method**: Direct open CSV download.
- **Licensing**: Academic Research Open Access / Creative Commons Attribution.
- **Collection Date**: October 2026 (incorporating historical records 2014–2024).
- **Format**: Comma-Separated Values (CSV), UTF-8.
- **Key Attributes Captured**:
  - `evtDate`: Incident event date.
  - `organization`: Victim entity.
  - `industry`, `industry_code`: Target sector and NAICS 2-digit industry code.
  - `country`, `actor_country`: Geographic victim and attacker locations.
  - `event_type`, `event_subtype`: Attack methodology (Data Attack, Disruptive, Exploitive, Mixed).
  - `actor`, `actor_type`: Threat actor and affiliation (Criminal, State-sponsored, Hacktivist, Undetermined).
  - `motive`: Motive classification (Financial, Protest, Espionage).
- **Update Mechanism**: Periodic quarterly/annual batch exports.
- **Data Limitations & Cleaning**:
  - Contains duplicate entries where the same event is listed with identical details. Handled via the platform's SHA-256 deduplication fingerprinting.
  - Exact financial loss figures are frequently unstated in public bulletins; preserved as `null` rather than simulated.

---

## 2. Ransomware.live Threat Intelligence Feed

- **Source Authority**: Ransomware.live Public Threat Intelligence Tracker.
- **Public URL**: [https://www.ransomware.live/](https://www.ransomware.live/)
- **API Endpoint**: `https://api.ransomware.live/v2/` (`/recentvictims`, `/victims/{year}`)
- **Access Method**: Official public REST API (GET, JSON).
- **Licensing**: Open Cybersecurity Threat Intelligence Feed.
- **Collection Date**: October 2026.
- **Format**: Machine-readable JSON.
- **Key Attributes Captured**:
  - `victim`: Compromised entity name.
  - `group`: Ransomware syndicate / threat actor (e.g., LockBit 3.0, BlackCat, Akira, Play, Vexy).
  - `attackdate`, `discovered`: Timestamp of publication/extortion claim.
  - `activity`: Sectoral classification.
  - `country`: ISO 2-letter victim country code.
  - `domain`: Target company internet domain.
  - `url`: Direct cryptographic claim identifier.
- **Update Mechanism**: Automated continuous polling (daily or on-demand).
- **Data Limitations & Cleaning**:
  - Relies on threat group extortion leak posts; represents extortion victim claims rather than internal incident response audits.
  - High coverage of modern 2023–2026 attacks.

---

## 3. CISA Known Exploited Vulnerabilities (KEV) Catalog

- **Source Authority**: Cybersecurity and Infrastructure Security Agency (CISA), US Department of Homeland Security.
- **Public URL**: [https://www.cisa.gov/known-exploited-vulnerabilities-catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
- **Access Method**: Official automated JSON feed (`https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`).
- **Licensing**: US Government Public Domain / Official Advisory.
- **Collection Date**: October 2026.
- **Format**: Machine-readable JSON.
- **Key Attributes Captured**:
  - `cveID`: Standardized CVE identifier (e.g. CVE-2022-41082, CVE-2021-34527).
  - `vendorProject`: Impacted vendor/software maintainer.
  - `product`: Affected product software/hardware.
  - `vulnerabilityName`: Descriptive vulnerability title.
  - `dateAdded`: Date weaponization confirmed by CISA.
  - `shortDescription`: Technical vulnerability overview.
  - `requiredAction`: Mandated mitigation for federal/critical systems.
  - `knownRansomwareCampaignUse`: Indicator whether actively weaponized in ransomware campaigns ("Known" / "Unknown").
- **Update Mechanism**: Automated continuous feed.
- **Crucial Separation**:
  - As per system requirements, CVEs are stored in a dedicated `vulnerabilities` intelligence table and are never counted as confirmed cyber incidents unless an explicit incident breach record exists and is linked.

---

## 4. India National Cyber Incident Track (CERT-In / Parliamentary Records)

- **Source Authority**: Indian Computer Emergency Response Team (CERT-In), Ministry of Electronics and Information Technology (MeitY), Government of India.
- **Public URL**: [https://www.cert-in.org.in](https://www.cert-in.org.in)
- **Access Method**: Curated compilation of verified official disclosures, Lok Sabha parliamentary responses, and state police FIR registrations.
- **Licensing**: Government Open Data / Official Disclosures.
- **Format**: Structured CSV (`backend/data/raw/india_national_incidents.csv`).
- **Coverage**: Major confirmed incidents across critical national infrastructure:
  - All India Institute of Medical Sciences (AIIMS) 2022 Ransomware Attack
  - Oil India Limited (Duliajan HQ) 2022 Extortion Attack
  - Nuclear Power Corporation of India (NPCIL Kudankulam) 2019 Dtrack Malware
  - Maharashtra State Electricity Transmission Co. (MSETCL) Grid Intrusion
  - Air India (SITA Passenger Service System) Data Breach
  - Bharat Sanchar Nigam Limited (BSNL) 2024 Telecom Record Breach
  - Dr. Reddy's Laboratories Pharmaceutical Ransomware Shut-down
  - Cosmos Bank 2018 ATM Switch Attack
  - Indian Council of Medical Research (ICMR) 2022 Portal Exfiltration
- **Update Mechanism**: Quarterly and ad-hoc upon official ministry disclosures.

---

## 5. Ad-Hoc / User-Uploaded Incident Feeds (`custom_upload`)

- **Format**: CSV or JSON format uploaded via `/api/sources/upload` or Web UI.
- **Normalizer**: Automatically detects columns (`victim`, `date`, `sector`, `country`, `severity`, `records_affected`) and computes deduplication hashes before inserting into database.
