import pytest
from backend.app.services.risk_engine import determine_risk_tier, METHODOLOGY_DOCS

def test_determine_risk_tier():
    assert determine_risk_tier(92.0) == "Severe"
    assert determine_risk_tier(75.5) == "High"
    assert determine_risk_tier(60.0) == "Elevated"
    assert determine_risk_tier(35.0) == "Moderate"
    assert determine_risk_tier(15.0) == "Low"

def test_methodology_docs_integrity():
    assert "version" in METHODOLOGY_DOCS
    assert "formula" in METHODOLOGY_DOCS
    assert "default_weights" in METHODOLOGY_DOCS
    weights = METHODOLOGY_DOCS["default_weights"]
    total_w = sum(weights.values())
    assert round(total_w, 2) == 1.00
