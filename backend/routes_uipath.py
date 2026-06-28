"""
AgentSeal UiPath Integration Proof Routes
-----------------------------------------

These routes expose UiPath integration proof data from FastAPI.

They are designed for:
- Swagger demo
- Next.js frontend page
- Postman testing
- Devpost proof screenshots
"""

from datetime import datetime, timezone

from fastapi import APIRouter

from services.uipath_proof import (
    build_action_center_task,
    build_maestro_flow,
    build_orchestrator_plan,
    build_risk_case_model,
    build_test_cloud_map,
    build_uipath_proof_package,
)
from storage import STORE, put


router = APIRouter(
    prefix="/api/uipath",
    tags=["uipath-integration-proof"],
)


@router.get("/health")
def uipath_proof_health():
    """
    Check whether the UiPath proof layer is available.
    """

    return {
        "ok": True,
        "service": "AgentSeal UiPath Integration Proof",
        "mode": "proof-mapping",
        "note": "This is an integration proof layer, not a live UiPath tenant connection.",
    }


@router.get("/proof")
def get_uipath_proof_package():
    """
    Return the full UiPath proof package.
    """

    proof = build_uipath_proof_package(STORE)

    put("uipath", "latest_proof", proof)

    return {
        "ok": True,
        "data": proof,
    }


@router.get("/test-cloud-map")
def get_test_cloud_map():
    """
    Return Test Cloud / Test Manager mapping only.
    """

    return {
        "ok": True,
        "data": build_test_cloud_map(),
    }


@router.get("/maestro-flow")
def get_maestro_flow():
    """
    Return Maestro BPMN release-gate mapping only.
    """

    return {
        "ok": True,
        "data": build_maestro_flow(),
    }


@router.get("/action-center-task")
def get_action_center_task():
    """
    Return Action Center / Human Task mapping only.
    """

    return {
        "ok": True,
        "data": build_action_center_task(),
    }


@router.get("/risk-case-model")
def get_risk_case_model():
    """
    Return Maestro Risk Case model only.
    """

    return {
        "ok": True,
        "data": build_risk_case_model(),
    }


@router.get("/orchestrator-plan")
def get_orchestrator_plan():
    """
    Return Orchestrator / HTTP workflow plan only.
    """

    return {
        "ok": True,
        "data": build_orchestrator_plan(),
    }


@router.post("/simulate-job")
def simulate_uipath_job():
    """
    Simulate a UiPath Orchestrator job trigger.

    This does not call real UiPath Cloud.
    It creates a proof record showing how the integration would run.
    """

    job = {
        "job_id": f"UIPATH-JOB-{int(datetime.now(timezone.utc).timestamp())}",
        "status": "Completed",
        "process": "AgentSeal_Release_Gate_Process",
        "trigger": "Manual demo trigger",
        "proof_mode": "Simulated UiPath Orchestrator job",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "steps_completed": [
            "Create assessment",
            "Generate tests",
            "Run validation",
            "Score risk",
            "Route decision",
            "Create evidence",
            "Issue certificate",
        ],
    }

    put("uipath", "latest_job", job)

    return {
        "ok": True,
        "data": job,
    }


