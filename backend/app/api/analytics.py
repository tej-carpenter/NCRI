from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.services.analytics_service import AnalyticsService
from backend.app.schemas.stats import (
    SummaryKPIs,
    AnalyticsDashboardData
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/kpis", response_model=SummaryKPIs)
def get_kpis(
    country: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_summary_kpis(db=db, country=country, sector=sector)

@router.get("/trends")
def get_trends(
    country: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    granularity: str = Query("yearly", pattern="^(yearly|monthly)$"),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_trends(db=db, country=country, sector=sector, granularity=granularity)

@router.get("/sectors")
def get_sectors(
    country: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_sector_stats(db=db, country=country)

@router.get("/attack-types")
def get_attack_types(
    country: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_attack_type_stats(db=db, country=country, sector=sector)

@router.get("/geography")
def get_geography(
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_geographic_distribution(db=db, limit=limit)

@router.get("/severity")
def get_severity(
    country: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_severity_distribution(db=db, country=country, sector=sector)

@router.get("/matrix")
def get_matrix(db: Session = Depends(get_db)):
    return AnalyticsService.get_sector_attack_matrix(db=db)

@router.get("/dashboard", response_model=AnalyticsDashboardData)
def get_dashboard_data(
    country: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    kpis = AnalyticsService.get_summary_kpis(db=db, country=country, sector=sector)
    trends = AnalyticsService.get_trends(db=db, country=country, sector=sector, granularity="yearly")
    sectors = AnalyticsService.get_sector_stats(db=db, country=country)
    attack_types = AnalyticsService.get_attack_type_stats(db=db, country=country, sector=sector)
    geography = AnalyticsService.get_geographic_distribution(db=db, limit=15)
    severity_dist = AnalyticsService.get_severity_distribution(db=db, country=country, sector=sector)

    return AnalyticsDashboardData(
        kpis=kpis,
        trends=trends,
        sectors=sectors,
        attack_types=attack_types,
        geography=geography,
        severity_distribution=severity_dist
    )
