import math
import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.incident import CyberIncident
from backend.app.models.risk import RiskAssessment
from backend.app.services.normalizer import CANONICAL_SECTORS, SECTOR_CRITICALITY_MAP
from backend.app.config import settings

logger = logging.getLogger("ncri.services.risk")

METHODOLOGY_DOCS = {
    "version": "v1.0.0 (Provisional)",
    "description": (
        "The National Cyber Risk Index (NCRI) is an explainable, multi-factor risk assessment "
        "framework that translates empirical incident observations and infrastructure criticality "
        "into a standardized 0–100 comparative risk score across national and industrial sectors."
    ),
    "formula": "NCRI = (w_f * F_s) + (w_s * S_s) + (w_c * C_s) + (w_e * E_s)",
    "components": {
        "F_s (Frequency Score)": "Log-normalized incident frequency relative to the peak sectoral volume (0-100).",
        "S_s (Severity Score)": "Empirical mean severity score of incidents targeting the sector (scaled 0-100).",
        "C_s (Criticality Score)": "Sectoral systemic criticality factor based on national critical infrastructure designations (0-100).",
        "E_s (Exploitation Velocity)": "Ratio of high-consequence attacks (Ransomware, Zero-day/CVE exploitation, Supply Chain) observed in sector (0-100)."
    },
    "default_weights": {
        "weight_frequency": 0.35,
        "weight_severity": 0.30,
        "weight_criticality": 0.20,
        "weight_exploitation": 0.15
    },
    "risk_tiers": {
        "Low": [0.0, 24.9],
        "Moderate": [25.0, 49.9],
        "Elevated": [50.0, 69.9],
        "High": [70.0, 84.9],
        "Severe": [85.0, 100.0]
    },
    "limitations": [
        "Relies on publicly disclosed and reported cyber incidents; may underestimate sectors with low mandatory disclosure compliance.",
        "Provisional weights calibrated on empirical distribution; adjustable based on policymaker priorities.",
        "Represents comparative risk rather than an actuarial guarantee of breach probability."
    ]
}

def determine_risk_tier(score: float) -> str:
    if score >= 85.0:
        return "Severe"
    elif score >= 70.0:
        return "High"
    elif score >= 50.0:
        return "Elevated"
    elif score >= 25.0:
        return "Moderate"
    else:
        return "Low"

class RiskEngine:
    @staticmethod
    def calculate_all_sector_risks(
        db: Session,
        period: str = "All-Time",
        country: str = "All",
        w_f: Optional[float] = None,
        w_s: Optional[float] = None,
        w_c: Optional[float] = None,
        w_e: Optional[float] = None
    ) -> List[RiskAssessment]:
        wf = w_f if w_f is not None else settings.NCRI_WEIGHT_FREQUENCY
        ws = w_s if w_s is not None else settings.NCRI_WEIGHT_SEVERITY
        wc = w_c if w_c is not None else settings.NCRI_WEIGHT_CRITICALITY
        we = w_e if w_e is not None else settings.NCRI_WEIGHT_EXPLOITATION

        # Base incident query
        query = db.query(CyberIncident)
        if country != "All":
            query = query.filter((CyberIncident.country == country) | (CyberIncident.country_code == country))

        # Filter by year if period looks like a year
        if period.isdigit():
            query = query.filter(CyberIncident.year == int(period))

        all_incidents = query.all()
        if not all_incidents:
            return []

        # Aggregate raw metrics by sector
        sector_data: Dict[str, Dict[str, Any]] = {
            s: {
                "count": 0,
                "severity_sum": 0.0,
                "exploited_count": 0
            } for s in CANONICAL_SECTORS
        }

        for inc in all_incidents:
            s = inc.sector if inc.sector in sector_data else "Other / Unclassified"
            sector_data[s]["count"] += 1
            sector_data[s]["severity_sum"] += (inc.severity_score or 5.0)
            
            if inc.attack_type in ["Ransomware & Extortion", "Vulnerability Exploitation", "Supply Chain Attack"]:
                sector_data[s]["exploited_count"] += 1

        # Determine peak incident count across sectors for log normalization
        max_count = max(d["count"] for d in sector_data.values()) if sector_data else 1
        max_log = math.log1p(max_count) if max_count > 0 else 1.0

        assessments = []
        for sector, d in sector_data.items():
            count = d["count"]
            if count == 0:
                continue

            # 1. Frequency Score (0 - 100)
            f_score = round((math.log1p(count) / max_log) * 100.0, 1)

            # 2. Severity Score (0 - 100)
            avg_sev = d["severity_sum"] / count
            s_score = round(min(100.0, avg_sev * 10.0), 1)

            # 3. Criticality Score (0 - 100)
            crit_weight = SECTOR_CRITICALITY_MAP.get(sector, 0.40)
            c_score = round(crit_weight * 100.0, 1)

            # 4. Exploitation Velocity (0 - 100)
            e_ratio = d["exploited_count"] / count if count > 0 else 0.0
            e_score = round(e_ratio * 100.0, 1)

            # Final Composite NCRI Score
            ncri = round((wf * f_score) + (ws * s_score) + (wc * c_score) + (we * e_score), 1)
            ncri = max(0.0, min(100.0, ncri))
            tier = determine_risk_tier(ncri)

            param_payload = {
                "raw_incident_count": count,
                "raw_avg_severity": round(avg_sev, 2),
                "raw_exploited_count": d["exploited_count"],
                "weights": {"wf": wf, "ws": ws, "wc": wc, "we": we},
                "components": {
                    "frequency_score": f_score,
                    "severity_score": s_score,
                    "criticality_score": c_score,
                    "exploitation_score": e_score
                }
            }

            # Update or create database record
            existing_assessment = db.query(RiskAssessment).filter_by(
                assessment_period=period,
                sector=sector,
                country=country
            ).first()

            if existing_assessment:
                existing_assessment.incident_count = count
                existing_assessment.frequency_score = f_score
                existing_assessment.severity_score = s_score
                existing_assessment.criticality_score = c_score
                existing_assessment.exploitation_score = e_score
                existing_assessment.ncri_score = ncri
                existing_assessment.risk_tier = tier
                existing_assessment.parameters_json = json.dumps(param_payload)
                assessments.append(existing_assessment)
            else:
                new_assessment = RiskAssessment(
                    assessment_period=period,
                    sector=sector,
                    country=country,
                    incident_count=count,
                    frequency_score=f_score,
                    severity_score=s_score,
                    criticality_score=c_score,
                    exploitation_score=e_score,
                    ncri_score=ncri,
                    risk_tier=tier,
                    methodology_version=settings.NCRI_METHODOLOGY_VERSION,
                    parameters_json=json.dumps(param_payload)
                )
                db.add(new_assessment)
                assessments.append(new_assessment)

        db.commit()
        # Sort assessments by NCRI score descending
        assessments.sort(key=lambda x: x.ncri_score, reverse=True)
        return assessments
