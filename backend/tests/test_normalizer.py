import pytest
from backend.app.services.normalizer import (
    normalize_date,
    normalize_sector,
    normalize_country,
    normalize_attack_type,
    calculate_severity,
    CANONICAL_SECTORS
)

def test_normalize_date():
    # ISO timestamp
    d, y, m = normalize_date("2026-10-13T11:59:04+00:00")
    assert d == "2026-10-13"
    assert y == 2026
    assert m == 10

    # Standard YYYY-MM-DD
    d, y, m = normalize_date("2023-04-20")
    assert d == "2023-04-20"
    assert y == 2023
    assert m == 4

    # YYYY-MM
    d, y, m = normalize_date("2022-08")
    assert d == "2022-08-01"
    assert y == 2022
    assert m == 8

    # Missing or empty
    d, y, m = normalize_date(None)
    assert d == "1970-01-01"

def test_normalize_sector():
    # NAICS codes
    assert normalize_sector(None, "62") == "Healthcare & Pharmaceuticals"
    assert normalize_sector(None, "52") == "Financial Services & Banking"
    assert normalize_sector(None, "22") == "Energy & Critical Utilities"
    assert normalize_sector(None, "61") == "Education & Research"
    
    # Text matching
    assert normalize_sector("Regional Hospital Center") == "Healthcare & Pharmaceuticals"
    assert normalize_sector("Commercial Bank of India") == "Financial Services & Banking"
    assert normalize_sector("Electric Power Grid") == "Energy & Critical Utilities"
    assert normalize_sector("Cloud Software SaaS") == "Information Technology & Telecom"
    assert normalize_sector("Unknown Entity") == "Other / Unclassified"

def test_normalize_country():
    # ISO code
    name, code, region = normalize_country("IN")
    assert name == "India"
    assert code == "IN"
    assert region == "Asia-Pacific"

    # Country name
    name, code, region = normalize_country("United States of America")
    assert code == "US"
    assert region == "North America"

def test_normalize_attack_type():
    assert normalize_attack_type("Ransomware", None, None) == "Ransomware & Extortion"
    assert normalize_attack_type("Data Attack", "Exfiltration", "Breach of customer data") == "Data Breach & Exfiltration"
    assert normalize_attack_type("Exploitive", "Exploitation of Application Server", "CVE-2021-34527") == "Vulnerability Exploitation"
    assert normalize_attack_type("Disruptive", "DDoS", None) == "Distributed Denial of Service (DDoS)"

def test_calculate_severity():
    # Critical incident on healthcare with 10M records
    label, score, impact = calculate_severity(None, 10_000_000, "Healthcare & Pharmaceuticals", "Ransomware & Extortion")
    assert label == "Critical"
    assert score >= 8.5
    assert impact == "Critical"

    # Explicit Low severity
    label, score, impact = calculate_severity("Low", None, "Commercial & Retail", "Other / Mixed")
    assert label == "Low"
    assert score <= 3.0
