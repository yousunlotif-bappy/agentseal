"""
Report Generator
----------------

Creates Evidence Vault report and Release Certificate from backend workflow data.
"""


def generate_report(
    assessment: dict,
    execution: dict,
    risk: dict,
    review: dict | None = None,
) -> dict:
    """
    Generate an audit-ready evidence report.
    """

    return {
        "report_id": f"EV-{assessment['assessment_id']}",
        "title": "AgentSeal Evidence Vault Report",
        "assessment_id": assessment["assessment_id"],
        "agent_name": assessment["agent_name"],
        "sections": [
            "Executive Summary",
            "Business Requirement",
            "Extracted Rules",
            "Generated Tests",
            "Red-Team Prompts",
            "Execution Results",
            "Tool/API Evidence",
            "RiskSeal Analysis",
            "Human Review",
            "Fix Verification",
        ],
        "execution_summary": {
            "run_id": execution["run_id"],
            "passed": execution["passed"],
            "failed": execution["failed"],
            "risk_score": execution["risk_score"],
            "decision": execution["decision"],
        },
        "risk_summary": {
            "score": risk["score"],
            "level": risk["level"],
            "decision": risk["decision"],
        },
        "review": review or {},
        "status": "READY",
    }


def generate_certificate(
    assessment: dict,
    risk: dict,
    review: dict | None = None,
) -> dict:
    """
    Generate final release certificate.

    Rule:
    - Risk must be <= 30
    - Human review should approve the release
    """

    review_decision = (review or {}).get("decision")
    is_approved = review_decision == "approve"
    is_low_risk = risk["score"] <= 30

    is_granted = is_low_risk and is_approved

    return {
        "certificate_id": f"AGC-2026-{assessment['assessment_id'].split('-')[-1]}",
        "assessment_id": assessment["assessment_id"],
        "agent_name": assessment["agent_name"],
        "status": "SEAL_GRANTED" if is_granted else "NOT_GRANTED",
        "final_risk_score": risk["score"],
        "seal_level": (
            "Production Ready with Monitoring"
            if is_granted
            else "Not Production Ready"
        ),
        "validity": "90 days" if is_granted else "Not valid",
        "human_review": review or {},
    }


