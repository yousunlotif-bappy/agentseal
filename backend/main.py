"""
AgentSeal FastAPI Backend MVP
-----------------------------

This is the real executable backend for AgentSeal.

Run command:
    uvicorn main:app --reload --port 8000

Open API docs:
    http://127.0.0.1:8000/docs

Health check:
    http://127.0.0.1:8000/health

Important note:
- POST /api/demo/run-full-flow is the proper API method.
- GET  /api/demo/run-full-flow is also enabled for easy browser testing.
"""

from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from models import (
    Assessment,
    AssessmentCreate,
    HumanReviewRequest,
    MonitoringReplayRequest,
    RunMode,
    TestResult,
)
from services.monitoring import replay_logs
from services.policy_extractor import extract_policy
from services.red_team import generate_red_team_prompts
from services.report_generator import generate_certificate, generate_report
from services.risk_engine import score_from_results
from services.test_generator import generate_tests
from services.test_runner import run_tests
from storage import STORE, get, put


app = FastAPI(
    title="AgentSeal Backend MVP",
    version="0.1.0",
    description=(
        "Real executable FastAPI backend MVP for AgentSeal. "
        "Includes assessment, policy extraction, test generation, red-team "
        "generation, execution, risk scoring, human review, evidence report, "
        "certificate, and monitoring replay."
    ),
)


# CORS allows your Next.js frontend to call this FastAPI backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_assessment(assessment_id: str) -> dict:
    """
    Load one assessment from memory.

    If assessment does not exist, FastAPI returns 404.
    """

    assessment = get("assessments", assessment_id)

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return assessment


@app.get("/")
def root():
    """
    Root endpoint for checking if backend server is running.
    """

    return {
        "ok": True,
        "service": "AgentSeal Backend MVP",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    """
    Backend health check endpoint.
    """

    return {
        "ok": True,
        "service": "agentseal-backend",
        "version": "0.1.0",
        "mode": "fastapi-mvp",
    }


@app.post("/api/assessments")
def create_assessment(payload: AssessmentCreate):
    """
    Create a new agent assessment.

    This is the starting point of the backend workflow.
    """

    assessment_id = f"AGS-{str(uuid4())[:8].upper()}"

    assessment = Assessment(
        assessment_id=assessment_id,
        agent_name=payload.agent_name,
        domain=payload.domain,
        requirement=payload.requirement,
        endpoint=payload.endpoint,
        reviewer_email=payload.reviewer_email,
        status="ASSESSMENT_CREATED",
    )

    put("assessments", assessment_id, assessment.model_dump())

    return {
        "ok": True,
        "data": assessment,
    }


@app.post("/api/demo/refund-assessment")
def create_demo_refund_assessment():
    """
    Create a ready-made Customer Refund Agent assessment for demo.
    """

    payload = AssessmentCreate()
    return create_assessment(payload)


@app.get("/api/assessments/{assessment_id}")
def get_assessment(assessment_id: str):
    """
    Get one assessment by assessment ID.
    """

    return {
        "ok": True,
        "data": ensure_assessment(assessment_id),
    }


@app.post("/api/assessments/{assessment_id}/extract-rules")
def extract_rules(assessment_id: str):
    """
    Extract structured business rules and safety policies.
    """

    assessment = Assessment(**ensure_assessment(assessment_id))
    policy = extract_policy(assessment)

    put("policies", assessment_id, policy.model_dump())

    return {
        "ok": True,
        "data": policy,
    }


@app.post("/api/assessments/{assessment_id}/generate-tests")
def create_tests(assessment_id: str):
    """
    Generate Test Forge validation test cases.
    """

    ensure_assessment(assessment_id)

    tests = generate_tests(assessment_id)

    put(
        "tests",
        assessment_id,
        [test.model_dump() for test in tests],
    )

    return {
        "ok": True,
        "count": len(tests),
        "data": tests,
    }


@app.post("/api/assessments/{assessment_id}/generate-red-team")
def create_red_team(assessment_id: str):
    """
    Generate Gladiator Engine red-team adversarial prompts.
    """

    ensure_assessment(assessment_id)

    prompts = generate_red_team_prompts(assessment_id)

    put(
        "red_team",
        assessment_id,
        [prompt.model_dump() for prompt in prompts],
    )

    return {
        "ok": True,
        "count": len(prompts),
        "data": prompts,
    }


@app.post("/api/assessments/{assessment_id}/run-tests")
def execute_tests(
    assessment_id: str,
    mode: RunMode = Query(default="before"),
):
    """
    Execute generated test cases.

    mode=before:
        Simulates unsafe agent before fixes.

    mode=after:
        Simulates safer agent after fixes.
    """

    ensure_assessment(assessment_id)

    tests = generate_tests(assessment_id)
    execution = run_tests(assessment_id, tests, mode)

    put(
        "executions",
        f"{assessment_id}:{mode}",
        execution.model_dump(),
    )

    return {
        "ok": True,
        "data": execution,
    }


@app.post("/api/assessments/{assessment_id}/score-risk")
def score_risk(
    assessment_id: str,
    mode: RunMode = Query(default="before"),
):
    """
    Calculate RiskSeal score from execution results.
    """

    ensure_assessment(assessment_id)

    execution = get("executions", f"{assessment_id}:{mode}")

    if not execution:
        execution_response = execute_tests(assessment_id, mode)
        execution = execution_response["data"].model_dump()

    results = [
        TestResult(**result)
        for result in execution["results"]
    ]

    risk = score_from_results(assessment_id, results)

    put(
        "risk",
        f"{assessment_id}:{mode}",
        risk.model_dump(),
    )

    return {
        "ok": True,
        "data": risk,
    }


@app.post("/api/assessments/{assessment_id}/human-review")
def human_review(
    assessment_id: str,
    payload: HumanReviewRequest,
):
    """
    Save human reviewer decision.
    """

    ensure_assessment(assessment_id)

    review = {
        "assessment_id": assessment_id,
        "decision": payload.decision,
        "reviewer": payload.reviewer,
        "note": payload.note,
    }

    put("reviews", assessment_id, review)

    return {
        "ok": True,
        "data": review,
    }


@app.get("/api/assessments/{assessment_id}/report")
def evidence_report(
    assessment_id: str,
    mode: RunMode = Query(default="after"),
):
    """
    Generate Evidence Vault report.
    """

    assessment = ensure_assessment(assessment_id)

    execution = get("executions", f"{assessment_id}:{mode}")
    if not execution:
        execution = execute_tests(assessment_id, mode)["data"].model_dump()

    risk = get("risk", f"{assessment_id}:{mode}")
    if not risk:
        risk = score_risk(assessment_id, mode)["data"].model_dump()

    review = get("reviews", assessment_id, {})

    report = generate_report(
        assessment=assessment,
        execution=execution,
        risk=risk,
        review=review,
    )

    put("reports", assessment_id, report)

    return {
        "ok": True,
        "data": report,
    }


@app.get("/api/assessments/{assessment_id}/certificate")
def release_certificate(
    assessment_id: str,
    mode: RunMode = Query(default="after"),
):
    """
    Generate Release Certificate.
    """

    assessment = ensure_assessment(assessment_id)

    risk = get("risk", f"{assessment_id}:{mode}")
    if not risk:
        risk = score_risk(assessment_id, mode)["data"].model_dump()

    review = get("reviews", assessment_id, {})

    certificate = generate_certificate(
        assessment=assessment,
        risk=risk,
        review=review,
    )

    put("certificates", assessment_id, certificate)

    return {
        "ok": True,
        "data": certificate,
    }


@app.post("/api/monitoring/replay")
def monitoring_replay(payload: MonitoringReplayRequest):
    """
    Replay runtime logs and generate new regression tests.
    """

    result = replay_logs(payload.logs)

    put("monitoring", "latest", result)

    return {
        "ok": True,
        "data": result,
    }


def run_full_demo_flow_logic():
    """
    Shared full-flow logic.

    This helper is used by both:
    - POST /api/demo/run-full-flow
    - GET  /api/demo/run-full-flow

    POST is the proper API method.
    GET is added only for easy browser testing.
    """

    created = create_demo_refund_assessment()
    assessment_id = created["data"].assessment_id

    extract_rules(assessment_id)
    create_tests(assessment_id)
    create_red_team(assessment_id)

    before_execution = execute_tests(assessment_id, "before")["data"]
    before_risk = score_risk(assessment_id, "before")["data"]

    after_execution = execute_tests(assessment_id, "after")["data"]
    after_risk = score_risk(assessment_id, "after")["data"]

    review = human_review(
        assessment_id,
        HumanReviewRequest(
            decision="approve",
            reviewer="Maya Rahman",
            note=(
                "Approved after retest. Risk was reduced and the remaining "
                "minor issue is acceptable with monitoring."
            ),
        ),
    )["data"]

    report = evidence_report(assessment_id, "after")["data"]
    certificate = release_certificate(assessment_id, "after")["data"]

    return {
        "ok": True,
        "message": "Full AgentSeal backend flow executed successfully.",
        "assessment_id": assessment_id,
        "before": {
            "execution": before_execution,
            "risk": before_risk,
        },
        "after": {
            "execution": after_execution,
            "risk": after_risk,
        },
        "review": review,
        "report": report,
        "certificate": certificate,
    }


@app.post("/api/demo/run-full-flow")
def run_full_demo_flow_post():
    """
    Proper API endpoint for running the complete backend flow.
    Use this from Swagger, frontend, Postman, or scripts.
    """

    return run_full_demo_flow_logic()


@app.get("/api/demo/run-full-flow")
def run_full_demo_flow_get():
    """
    Browser-friendly demo endpoint.

    This allows you to paste the URL into the browser and run the full flow.
    In real production, side-effect actions should normally use POST only.
    """

    return run_full_demo_flow_logic()


@app.get("/api/debug/store")
def debug_store():
    """
    Debug endpoint for checking in-memory backend state.
    """

    return {
        "ok": True,
        "data": STORE,
    }


