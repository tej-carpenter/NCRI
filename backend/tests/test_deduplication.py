import pytest
from backend.app.services.deduplication import clean_victim_name, generate_dedup_key, compute_raw_hash

def test_clean_victim_name():
    assert clean_victim_name("Microsoft Corporation, Inc.") == "microsoft"
    assert clean_victim_name("Oil India Limited") == "oil india"
    assert clean_victim_name("Apollo Hospitals Pvt Ltd") == "apollo hospitals"

def test_generate_dedup_key_stability():
    key1 = generate_dedup_key("cissm", "REF-001")
    key2 = generate_dedup_key("cissm", "REF-001")
    assert key1 == key2

    # Different source slug produces different hash
    key3 = generate_dedup_key("other_source", "REF-001")
    assert key1 != key3

def test_generate_dedup_key_fingerprint():
    # Fingerprint matching for unknown ref
    key1 = generate_dedup_key("cissm", "", victim_name="Acme Health Inc.", incident_date="2023-01-01", attack_type="Ransomware")
    key2 = generate_dedup_key("cissm", "", victim_name="Acme Health LLC", incident_date="2023-01-01", attack_type="Ransomware")
    assert key1 == key2

def test_compute_raw_hash():
    h1 = compute_raw_hash("data1|data2")
    h2 = compute_raw_hash("data1|data2")
    h3 = compute_raw_hash("data1|data3")
    assert h1 == h2
    assert h1 != h3
