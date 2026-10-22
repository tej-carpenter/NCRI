import re
import hashlib
from typing import Optional

def clean_victim_name(victim: Optional[str]) -> str:
    """Removes common legal suffixes and whitespace for deduplication matching."""
    if not victim:
        return ""
    v = victim.lower().strip()
    # Strip common entity suffixes
    v = re.sub(r"\b(inc|llc|corp|corporation|ltd|limited|co|company|pvt|gmbh|sa|bv|pld)\b", "", v)
    # Strip non-alphanumeric
    v = re.sub(r"[^\w\s]", "", v)
    return " ".join(v.split())

def generate_dedup_key(
    source_slug: str,
    incident_ref: str,
    victim_name: Optional[str] = None,
    incident_date: Optional[str] = None,
    attack_type: Optional[str] = None
) -> str:
    """
    Creates a stable SHA-256 deduplication key.
    If source_ref is unique per source, combines source_slug and incident_ref.
    For cross-source fallback, creates fingerprint based on normalized victim, date, and attack type.
    """
    clean_ref = str(incident_ref).strip()
    if clean_ref and clean_ref != "unknown" and clean_ref != "-":
        seed = f"{source_slug}:{clean_ref}"
    else:
        # Fallback to composite fingerprint
        cv = clean_victim_name(victim_name)
        cd = str(incident_date).strip() if incident_date else "1970-01-01"
        ca = str(attack_type).strip() if attack_type else "unknown"
        seed = f"fingerprint:{cv}:{cd}:{ca}"
        
    return hashlib.sha256(seed.encode("utf-8")).hexdigest()

def compute_raw_hash(data_str: str) -> str:
    """Computes SHA-256 of raw data string to detect updates to an existing record."""
    return hashlib.sha256(data_str.encode("utf-8")).hexdigest()
