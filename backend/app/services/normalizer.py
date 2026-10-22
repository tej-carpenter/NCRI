import re
from datetime import datetime
from typing import Tuple, Optional

# Canonical Sectors
CANONICAL_SECTORS = [
    "Healthcare & Pharmaceuticals",
    "Financial Services & Banking",
    "Energy & Critical Utilities",
    "Government & Defense",
    "Information Technology & Telecom",
    "Manufacturing & Industrial",
    "Education & Research",
    "Transportation & Logistics",
    "Commercial & Retail",
    "Other / Unclassified"
]

# Sector Criticality Weights for Risk Calculations (C_s: 0.0 to 1.0)
SECTOR_CRITICALITY_MAP = {
    "Healthcare & Pharmaceuticals": 1.00,
    "Energy & Critical Utilities": 1.00,
    "Government & Defense": 0.95,
    "Financial Services & Banking": 0.90,
    "Information Technology & Telecom": 0.85,
    "Transportation & Logistics": 0.80,
    "Manufacturing & Industrial": 0.70,
    "Education & Research": 0.60,
    "Commercial & Retail": 0.50,
    "Other / Unclassified": 0.40
}

# Country code mapping
COUNTRY_CODE_MAP = {
    "IN": "India",
    "US": "United States",
    "GB": "United Kingdom",
    "UK": "United Kingdom",
    "DE": "Germany",
    "FR": "France",
    "CA": "Canada",
    "AU": "Australia",
    "BR": "Brazil",
    "IT": "Italy",
    "ES": "Spain",
    "JP": "Japan",
    "RU": "Russian Federation",
    "CN": "China",
    "NL": "Netherlands",
    "IL": "Israel",
    "UA": "Ukraine",
    "SG": "Singapore",
    "CH": "Switzerland",
    "KR": "South Korea",
    "MX": "Mexico",
    "ZA": "South Africa"
}

# Invert for name-to-code
COUNTRY_NAME_TO_CODE = {v.lower(): k for k, v in COUNTRY_CODE_MAP.items()}
COUNTRY_NAME_TO_CODE.update({
    "united states of america": "US",
    "usa": "US",
    "india": "IN",
    "united kingdom": "GB",
    "britain": "GB",
    "russia": "RU",
    "deutschland": "DE"
})

def normalize_date(date_str: Optional[str]) -> Tuple[str, Optional[int], Optional[int]]:
    """
    Normalizes various date formats into standard YYYY-MM-DD,
    returning (normalized_date_str, year, month).
    """
    if not date_str or not str(date_str).strip():
        return "1970-01-01", 1970, 1
    
    date_clean = str(date_str).strip()
    
    # Try ISO timestamp like 2026-10-13T11:59:04+00:00
    if "T" in date_clean:
        date_clean = date_clean.split("T")[0]
        
    # Standard YYYY-MM-DD
    m = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})$", date_clean)
    if m:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return f"{y:04d}-{mo:02d}-{d:02d}", y, mo
        
    # YYYY-MM
    m = re.match(r"^(\d{4})-(\d{1,2})$", date_clean)
    if m:
        y, mo = int(m.group(1)), int(m.group(2))
        return f"{y:04d}-{mo:02d}-01", y, mo
        
    # DD/MM/YYYY or MM/DD/YYYY
    m = re.match(r"^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$", date_clean)
    if m:
        y = int(m.group(3))
        mo = int(m.group(2)) if int(m.group(1)) > 12 else int(m.group(1))
        d = int(m.group(1)) if int(m.group(1)) > 12 else int(m.group(2))
        return f"{y:04d}-{mo:02d}-{d:02d}", y, mo

    # Fallback YYYY
    m = re.search(r"\b(19\d\d|20\d\d)\b", date_clean)
    if m:
        y = int(m.group(1))
        return f"{y:04d}-01-01", y, 1
        
    return "1970-01-01", 1970, 1

def normalize_sector(raw_sector: Optional[str], raw_code: Optional[str] = None) -> str:
    """
    Maps raw industry names or NAICS industry codes into canonical sectors.
    """
    code_str = str(raw_code).strip() if raw_code else ""
    # NAICS mapping
    if code_str.startswith("62") or code_str == "62":
        return "Healthcare & Pharmaceuticals"
    if code_str.startswith("52") or code_str == "52":
        return "Financial Services & Banking"
    if code_str.startswith("22") or code_str == "22" or code_str.startswith("21"):
        return "Energy & Critical Utilities"
    if code_str.startswith("92") or code_str == "92":
        return "Government & Defense"
    if code_str.startswith("51") or code_str == "51":
        return "Information Technology & Telecom"
    if code_str.startswith("61") or code_str == "61":
        return "Education & Research"
    if code_str.startswith("48") or code_str.startswith("49"):
        return "Transportation & Logistics"
    if code_str.startswith("31") or code_str.startswith("32") or code_str.startswith("33"):
        return "Manufacturing & Industrial"
    if code_str.startswith("44") or code_str.startswith("45") or code_str.startswith("72"):
        return "Commercial & Retail"

    text = f"{raw_sector or ''}".lower()
    if any(k in text for k in ["health", "hospital", "pharma", "medical", "clinic", "biotech"]):
        return "Healthcare & Pharmaceuticals"
    if any(k in text for k in ["bank", "finance", "credit", "insurance", "investment", "fintech", "payment"]):
        return "Financial Services & Banking"
    if any(k in text for k in ["energy", "oil", "gas", "utility", "electric", "power", "nuclear", "grid", "water"]):
        return "Energy & Critical Utilities"
    if any(k in text for k in ["government", "defense", "military", "public admin", "ministry", "police", "judiciary"]):
        return "Government & Defense"
    if any(k in text for k in ["tech", "software", "telecom", "telecommunication", "information", "cloud", "saas", "cyber", "internet"]):
        return "Information Technology & Telecom"
    if any(k in text for k in ["manufactur", "industrial", "automotive", "aerospace", "chemical", "factory"]):
        return "Manufacturing & Industrial"
    if any(k in text for k in ["education", "university", "school", "college", "research", "academic"]):
        return "Education & Research"
    if any(k in text for k in ["transport", "airline", "aviation", "rail", "logistic", "shipping", "freight", "port"]):
        return "Transportation & Logistics"
    if any(k in text for k in ["retail", "commerce", "store", "ecommerce", "hotel", "restaurant", "consumer"]):
        return "Commercial & Retail"

    return "Other / Unclassified"

def normalize_country(raw_country: Optional[str]) -> Tuple[str, str, str]:
    """
    Normalizes country name, returns (country_name, country_code, region).
    """
    if not raw_country or not str(raw_country).strip():
        return "Unknown", "XX", "Undetermined"
        
    c_clean = str(raw_country).strip()
    c_upper = c_clean.upper()
    
    # 2-letter code check
    if len(c_clean) == 2 and c_upper in COUNTRY_CODE_MAP:
        name = COUNTRY_CODE_MAP[c_upper]
        code = c_upper
    else:
        name = c_clean
        code = COUNTRY_NAME_TO_CODE.get(c_clean.lower(), "XX")
        if code in COUNTRY_CODE_MAP:
            name = COUNTRY_CODE_MAP[code]

    # Region assignment
    region = "Global"
    if code in ["US", "CA", "MX"]:
        region = "North America"
    elif code in ["IN", "JP", "CN", "SG", "KR", "AU"]:
        region = "Asia-Pacific"
    elif code in ["GB", "DE", "FR", "IT", "ES", "NL", "CH", "UA", "RU"]:
        region = "Europe"
    elif code in ["BR", "AR", "CO", "CL"]:
        region = "Latin America"
    elif code in ["IL", "ZA", "AE", "SA"]:
        region = "Middle East & Africa"

    return name, code, region

def normalize_attack_type(raw_type: Optional[str], raw_subtype: Optional[str] = None, description: Optional[str] = None) -> str:
    """
    Normalizes attack classifications into canonical incident attack types.
    """
    combined = f"{raw_type or ''} {raw_subtype or ''} {description or ''}".lower()
    
    if any(k in combined for k in ["ransom", "extortion", "encrypt", "locker", "double extortion"]):
        return "Ransomware & Extortion"
    if any(k in combined for k in ["ddos", "denial of service", "amplification", "flooding"]):
        return "Distributed Denial of Service (DDoS)"
    if any(k in combined for k in ["exploit", "cve-", "vulnerability", "zero-day", "0-day", "rce", "remote code execution"]):
        return "Vulnerability Exploitation"
    if any(k in combined for k in ["supply chain", "third-party", "subcontractor", "solarwinds", "dependency"]):
        return "Supply Chain Attack"
    if any(k in combined for k in ["phish", "spearphishing", "credential harvesting", "social engineering"]):
        return "Phishing & Social Engineering"
    if any(k in combined for k in ["spyware", "trojan", "apt", "espionage", "implant", "backdoor", "c2", "command and control"]):
        return "Malware & Espionage"
    if any(k in combined for k in ["breach", "leak", "exfiltrat", "data attack", "stolen records", "pii exposure"]):
        return "Data Breach & Exfiltration"
    if any(k in combined for k in ["unauthorized access", "intrusion", "defacement", "unauthenticated"]):
        return "Unauthorized Access / Intrusion"
        
    return "Other / Mixed"

def calculate_severity(
    raw_severity: Optional[str],
    records_affected: Optional[int],
    sector: str,
    attack_type: str
) -> Tuple[str, float, str]:
    """
    Calculates standardized severity label, continuous score (0.0 - 10.0), and impact level.
    """
    if raw_severity:
        s_upper = str(raw_severity).strip().capitalize()
        if s_upper in ["Critical", "High", "Medium", "Low"]:
            severity_label = s_upper
            score_defaults = {"Critical": 9.2, "High": 7.5, "Medium": 5.0, "Low": 2.5}
            score = score_defaults[s_upper]
            impact_map = {"Critical": "Critical", "High": "High", "Medium": "Moderate", "Low": "Low"}
            return severity_label, score, impact_map[s_upper]

    # Calculate baseline score from factors
    base_score = 4.0
    
    # Attack type severity factor
    if attack_type == "Ransomware & Extortion":
        base_score += 2.5
    elif attack_type in ["Vulnerability Exploitation", "Supply Chain Attack"]:
        base_score += 2.0
    elif attack_type == "Data Breach & Exfiltration":
        base_score += 1.5
    elif attack_type == "Distributed Denial of Service (DDoS)":
        base_score += 1.0

    # Sector Criticality factor
    crit_weight = SECTOR_CRITICALITY_MAP.get(sector, 0.5)
    base_score += (crit_weight * 2.0)

    # Records affected scale
    if records_affected:
        if records_affected >= 10_000_000:
            base_score += 2.5
        elif records_affected >= 1_000_000:
            base_score += 1.8
        elif records_affected >= 100_000:
            base_score += 1.0
        elif records_affected >= 10_000:
            base_score += 0.5

    # Clamp to [1.0, 10.0]
    final_score = round(max(1.0, min(10.0, base_score)), 1)
    
    if final_score >= 8.5:
        return "Critical", final_score, "Critical"
    elif final_score >= 6.5:
        return "High", final_score, "High"
    elif final_score >= 4.0:
        return "Medium", final_score, "Moderate"
    else:
        return "Low", final_score, "Low"
