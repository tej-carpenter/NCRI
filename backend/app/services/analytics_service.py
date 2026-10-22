import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case

from backend.app.models.incident import CyberIncident
from backend.app.models.source import DataSource
from backend.app.models.vulnerability import Vulnerability
from backend.app.schemas.stats import (
    SummaryKPIs,
    TrendPoint,
    SectorStat,
    AttackTypeStat,
    GeoStat,
    SeverityStat,
    SectorAttackMatrixCell,
    AnalyticsDashboardData
)

logger = logging.getLogger("ncri.services.analytics")

class AnalyticsService:
    @staticmethod
    def _apply_country_filter(query, country: Optional[str]):
        if not country or country in ("All", "Global", "Global Landscape", ""):
            return query
        clean = country.strip()
        if clean in ("United Kingdom", "UK", "GB"):
            return query.filter(
                (CyberIncident.country.ilike("%United Kingdom%")) |
                (CyberIncident.country_code.in_(["GB", "UK"]))
            )
        elif clean in ("United States", "USA", "US"):
            return query.filter(
                (CyberIncident.country.ilike("%United States%")) |
                (CyberIncident.country_code == "US")
            )
        else:
            return query.filter(
                (CyberIncident.country == clean) |
                (CyberIncident.country_code == clean) |
                (CyberIncident.country.ilike(f"%{clean}%"))
            )

    @staticmethod
    def get_summary_kpis(db: Session, country: Optional[str] = None, sector: Optional[str] = None) -> SummaryKPIs:
        query = db.query(CyberIncident)
        query = AnalyticsService._apply_country_filter(query, country)
        if sector and sector != "All":
            query = query.filter(CyberIncident.sector == sector)

        total_incidents = query.count()
        if total_incidents == 0:
            return SummaryKPIs(
                total_incidents=0,
                total_sources=db.query(DataSource).count(),
                total_vulnerabilities=db.query(Vulnerability).count(),
                total_countries=0
            )

        total_sources = db.query(DataSource).count()
        total_vulnerabilities = db.query(Vulnerability).count()
        
        # Countries count
        total_countries = query.with_entities(CyberIncident.country).distinct().count()

        # Top sector
        top_sec_row = query.with_entities(
            CyberIncident.sector, func.count(CyberIncident.id).label("cnt")
        ).group_by(CyberIncident.sector).order_by(desc("cnt")).first()
        top_sector = top_sec_row[0] if top_sec_row else None

        # Top attack type
        top_atk_row = query.with_entities(
            CyberIncident.attack_type, func.count(CyberIncident.id).label("cnt")
        ).group_by(CyberIncident.attack_type).order_by(desc("cnt")).first()
        top_attack_type = top_atk_row[0] if top_atk_row else None

        # Critical severity percentage
        crit_count = query.filter(CyberIncident.severity == "Critical").count()
        crit_pct = round((crit_count / total_incidents) * 100.0, 1)

        # Ransomware percentage
        rw_count = query.filter(CyberIncident.attack_type.like("%Ransomware%")).count()
        rw_pct = round((rw_count / total_incidents) * 100.0, 1)

        # Latest incident date
        latest_date_row = query.order_by(desc(CyberIncident.incident_date)).first()
        latest_date = latest_date_row.incident_date if latest_date_row else None

        # Records with attributed actor
        actor_count = query.filter(
            CyberIncident.threat_actor.isnot(None),
            CyberIncident.threat_actor != "Unknown"
        ).count()
        actor_pct = round((actor_count / total_incidents) * 100.0, 1)

        return SummaryKPIs(
            total_incidents=total_incidents,
            total_sources=total_sources,
            total_vulnerabilities=total_vulnerabilities,
            total_countries=total_countries,
            top_sector=top_sector,
            top_attack_type=top_attack_type,
            critical_severity_percentage=crit_pct,
            ransomware_percentage=rw_pct,
            latest_incident_date=latest_date,
            records_with_known_actors_percentage=actor_pct
        )

    @staticmethod
    def get_trends(
        db: Session,
        country: Optional[str] = None,
        sector: Optional[str] = None,
        granularity: str = "yearly"
    ) -> List[TrendPoint]:
        query = db.query(CyberIncident)
        query = AnalyticsService._apply_country_filter(query, country)
        if sector and sector != "All":
            query = query.filter(CyberIncident.sector == sector)

        # Discard invalid/placeholder years
        query = query.filter(CyberIncident.year >= 2000, CyberIncident.year <= 2030)

        if granularity == "monthly":
            rows = query.with_entities(
                CyberIncident.year,
                CyberIncident.month,
                func.count(CyberIncident.id).label("cnt")
            ).group_by(CyberIncident.year, CyberIncident.month).order_by(CyberIncident.year, CyberIncident.month).all()
            
            points = []
            for y, m, c in rows:
                if y and m:
                    points.append(TrendPoint(period=f"{y:04d}-{m:02d}", count=c))
        else:
            rows = query.with_entities(
                CyberIncident.year,
                func.count(CyberIncident.id).label("cnt")
            ).group_by(CyberIncident.year).order_by(CyberIncident.year).all()
            
            points = [TrendPoint(period=str(y), count=c) for y, c in rows if y]

        # Calculate 3-period moving average
        for i in range(len(points)):
            window = [p.count for p in points[max(0, i - 2):i + 1]]
            points[i].moving_avg = round(sum(window) / len(window), 1)

        # Predictive extension (Phase 6 requirement): linear forecast for next period
        if len(points) >= 3 and granularity == "yearly":
            x_vals = list(range(len(points)))
            y_vals = [p.count for p in points]
            # Simple slope
            n = len(x_vals)
            x_mean = sum(x_vals) / n
            y_mean = sum(y_vals) / n
            num = sum((x_vals[i] - x_mean) * (y_vals[i] - y_mean) for i in range(n))
            den = sum((x_vals[i] - x_mean) ** 2 for i in range(n)) or 1.0
            slope = num / den
            intercept = y_mean - (slope * x_mean)
            
            last_yr = int(points[-1].period)
            next_yr = str(last_yr + 1)
            pred_count = max(0, int(round(slope * n + intercept)))
            points.append(TrendPoint(
                period=f"{next_yr} (Forecast)",
                count=pred_count,
                moving_avg=round(float(pred_count), 1),
                predicted=True
            ))

        return points

    @staticmethod
    def get_sector_stats(db: Session, country: Optional[str] = None) -> List[SectorStat]:
        query = db.query(CyberIncident)
        query = AnalyticsService._apply_country_filter(query, country)

        total = query.count()
        if total == 0:
            return []

        rows = query.with_entities(
            CyberIncident.sector,
            func.count(CyberIncident.id).label("cnt"),
            func.avg(CyberIncident.severity_score).label("avg_sev"),
            func.sum(case((CyberIncident.severity == "Critical", 1), else_=0)).label("crit_cnt")
        ).group_by(CyberIncident.sector).order_by(desc("cnt")).all()

        results = []
        for s, cnt, avg_sev, crit_cnt in rows:
            results.append(SectorStat(
                sector=s or "Other / Unclassified",
                count=cnt,
                percentage=round((cnt / total) * 100.0, 1),
                avg_severity=round(float(avg_sev or 5.0), 1),
                critical_count=int(crit_cnt or 0)
            ))
        return results

    @staticmethod
    def get_attack_type_stats(db: Session, country: Optional[str] = None, sector: Optional[str] = None) -> List[AttackTypeStat]:
        query = db.query(CyberIncident)
        query = AnalyticsService._apply_country_filter(query, country)
        if sector and sector != "All":
            query = query.filter(CyberIncident.sector == sector)

        total = query.count()
        if total == 0:
            return []

        rows = query.with_entities(
            CyberIncident.attack_type,
            func.count(CyberIncident.id).label("cnt"),
            func.avg(CyberIncident.severity_score).label("avg_sev")
        ).group_by(CyberIncident.attack_type).order_by(desc("cnt")).all()

        results = []
        for atk, cnt, avg_sev in rows:
            results.append(AttackTypeStat(
                attack_type=atk,
                count=cnt,
                percentage=round((cnt / total) * 100.0, 1),
                avg_severity=round(float(avg_sev or 5.0), 1)
            ))
        return results

    @staticmethod
    def get_geographic_distribution(db: Session, limit: int = 20) -> List[GeoStat]:
        total = db.query(CyberIncident).count()
        if total == 0:
            return []

        rows = db.query(
            CyberIncident.country,
            CyberIncident.country_code,
            func.count(CyberIncident.id).label("cnt")
        ).filter(
            CyberIncident.country.isnot(None),
            CyberIncident.country != "Unknown"
        ).group_by(
            CyberIncident.country,
            CyberIncident.country_code
        ).order_by(desc("cnt")).limit(limit).all()

        results = []
        for c, code, cnt in rows:
            results.append(GeoStat(
                country=c,
                country_code=code,
                count=cnt,
                percentage=round((cnt / total) * 100.0, 1)
            ))
        return results

    @staticmethod
    def get_severity_distribution(db: Session, country: Optional[str] = None, sector: Optional[str] = None) -> List[SeverityStat]:
        query = db.query(CyberIncident)
        query = AnalyticsService._apply_country_filter(query, country)
        if sector and sector != "All":
            query = query.filter(CyberIncident.sector == sector)

        total = query.count()
        if total == 0:
            return []

        rows = query.with_entities(
            CyberIncident.severity,
            func.count(CyberIncident.id).label("cnt")
        ).group_by(CyberIncident.severity).all()

        severity_order = ["Critical", "High", "Medium", "Low"]
        cnt_map = {s: cnt for s, cnt in rows}

        results = []
        for s in severity_order:
            cnt = cnt_map.get(s, 0)
            results.append(SeverityStat(
                severity=s,
                count=cnt,
                percentage=round((cnt / total) * 100.0, 1)
            ))
        return results

    @staticmethod
    def get_sector_attack_matrix(db: Session) -> List[SectorAttackMatrixCell]:
        rows = db.query(
            CyberIncident.sector,
            CyberIncident.attack_type,
            func.count(CyberIncident.id).label("cnt")
        ).group_by(
            CyberIncident.sector,
            CyberIncident.attack_type
        ).order_by(desc("cnt")).all()

        return [SectorAttackMatrixCell(sector=s, attack_type=a, count=c) for s, a, c in rows]
