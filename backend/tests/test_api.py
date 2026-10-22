import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "version" in data
    assert "database" in data

def test_incidents_listing():
    response = client.get("/api/incidents?page=1&size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] > 0
    assert len(data["items"]) <= 10

def test_incidents_search_and_filter():
    response = client.get("/api/incidents?sector=Healthcare%20%26%20Pharmaceuticals&size=5")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["sector"] == "Healthcare & Pharmaceuticals"

def test_incident_detail():
    list_resp = client.get("/api/incidents?size=1")
    items = list_resp.json()["items"]
    if items:
        inc_id = items[0]["id"]
        detail_resp = client.get(f"/api/incidents/{inc_id}")
        assert detail_resp.status_code == 200
        assert detail_resp.json()["id"] == inc_id

def test_analytics_kpis():
    response = client.get("/api/analytics/kpis")
    assert response.status_code == 200
    data = response.json()
    assert data["total_incidents"] > 0
    assert data["total_sources"] >= 3
    assert data["total_vulnerabilities"] > 0

def test_analytics_trends():
    response = client.get("/api/analytics/trends")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_analytics_sectors():
    response = client.get("/api/analytics/sectors")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "sector" in data[0]
    assert "count" in data[0]
    assert "avg_severity" in data[0]

def test_analytics_attack_types():
    response = client.get("/api/analytics/attack-types")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "attack_type" in data[0]
    assert "count" in data[0]

def test_risk_index_and_methodology():
    method_resp = client.get("/api/risk/methodology")
    assert method_resp.status_code == 200
    assert "v1.0.0" in method_resp.json()["version"]

    idx_resp = client.get("/api/risk/index")
    assert idx_resp.status_code == 200
    data = idx_resp.json()
    assert "overall_national_ncri" in data
    assert len(data["sector_scores"]) > 0

def test_data_sources_list():
    response = client.get("/api/sources")
    assert response.status_code == 200
    sources = response.json()
    slugs = [s["slug"] for s in sources]
    assert "cissm" in slugs
    assert "cisa_kev" in slugs

def test_vulnerabilities_list():
    response = client.get("/api/vulnerabilities?size=5")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["items"]) <= 5

def test_csv_export():
    response = client.get("/api/reports/export-csv?size=5")
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    assert "Incident ID" in response.text
