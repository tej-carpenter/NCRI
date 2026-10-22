import os
import json
import urllib.request
import urllib.error

RAW_DIR = os.path.join(os.path.dirname(__file__), "backend", "data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)

def download_file(url, target_path, label):
    print(f"Downloading {label} from {url}...")
    headers = {"User-Agent": "NCRI-Cyber-Research-Agent/1.0 (Academic Research; NIT Trichy)"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read()
            with open(target_path, "wb") as f:
                f.write(content)
            print(f"Successfully downloaded {label} ({len(content):,} bytes) -> {target_path}")
            return True
    except Exception as e:
        print(f"Failed to download {label}: {e}")
        return False

# 1. Download CISSM Cyber Events
cissm_path = os.path.join(RAW_DIR, "cissm_events.csv")
if not os.path.exists(cissm_path):
    download_file(
        "https://raw.githubusercontent.com/holisticinfosec/CISSM-EDA/main/CISSM-export-21APR2023.csv",
        cissm_path,
        "CISSM Cyber Events CSV"
    )
else:
    print(f"CISSM dataset already exists at {cissm_path}")

# 2. Download CISA KEV
cisa_path = os.path.join(RAW_DIR, "cisa_kev.json")
if not os.path.exists(cisa_path):
    download_file(
        "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
        cisa_path,
        "CISA Known Exploited Vulnerabilities (KEV)"
    )
else:
    print(f"CISA KEV dataset already exists at {cisa_path}")

# 3. Download Ransomware.live recent victims
rl_path = os.path.join(RAW_DIR, "ransomware_live_recent.json")
if not os.path.exists(rl_path):
    download_file(
        "https://api.ransomware.live/v2/recentvictims",
        rl_path,
        "Ransomware.live Recent Victims"
    )
else:
    print(f"Ransomware.live recent victims already exists at {rl_path}")

print("Dataset download check completed.")
