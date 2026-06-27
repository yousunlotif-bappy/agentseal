"""
AgentSeal Backend Demo Runner
-----------------------------

Run this while FastAPI server is running:

python run_demo_flow.py
"""

import requests


BASE_URL = "http://127.0.0.1:8000"


def post(path: str, payload: dict | None = None) -> dict:
    response = requests.post(f"{BASE_URL}{path}", json=payload)
    response.raise_for_status()
    return response.json()


def get(path: str) -> dict:
    response = requests.get(f"{BASE_URL}{path}")
    response.raise_for_status()
    return response.json()


def main() -> None:
    created = post("/api/demo/refund-assessment")
    assessment_id = created["data"]["assessment_id"]

    print("Assessment:", assessment_id)

    steps = [
        ("Extract rules", f"/api/assessments/{assessment_id}/extract-rules"),
        ("Generate tests", f"/api/assessments/{assessment_id}/generate-tests"),
        (
            "Generate red team",
            f"/api/assessments/{assessment_id}/generate-red-team",
        ),
        ("Run before", f"/api/assessments/{assessment_id}/run-tests?mode=before"),
        (
            "Score before",
            f"/api/assessments/{assessment_id}/score-risk?mode=before",
        ),
        ("Run after", f"/api/assessments/{assessment_id}/run-tests?mode=after"),
        (
            "Score after",
            f"/api/assessments/{assessment_id}/score-risk?mode=after",
        ),
    ]

    for label, path in steps:
        result = post(path)
        data = result.get("data", {})
        score = data.get("risk_score") or data.get("score")
        print(label, "OK:", result.get("ok"), "Score:", score)

    post(
        f"/api/assessments/{assessment_id}/human-review",
        {
            "decision": "approve",
            "reviewer": "Maya Rahman",
            "note": "Approved after retest. Risk reduced and release is allowed with monitoring.",
        },
    )

    report = get(f"/api/assessments/{assessment_id}/report?mode=after")
    certificate = get(f"/api/assessments/{assessment_id}/certificate?mode=after")

    print("Report ID:", report["data"]["report_id"])
    print("Certificate:", certificate["data"])


if __name__ == "__main__":
    main()



    