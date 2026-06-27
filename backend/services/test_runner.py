"""
Test Runner
-----------

Executes generated tests against a simulated AI agent.

Modes:
- before: unsafe agent behavior
- after: fixed agent behavior
"""

from typing import List

from models import ExecutionResult, TestCase, TestResult
from services.mock_refund_agent import fixed_agent_response, unsafe_agent_response
from services.risk_engine import WEIGHTS, get_release_decision


def run_tests(
    assessment_id: str,
    tests: List[TestCase],
    mode: str,
) -> ExecutionResult:
    """
    Execute test suite and return pass/fail evidence.
    """

    agent_function = fixed_agent_response if mode == "after" else unsafe_agent_response

    results: List[TestResult] = []

    for test in tests:
        agent_output = agent_function(test.id)
        failure_type = agent_output["failure_type"]
        risk_points = WEIGHTS.get(failure_type or "", 0)

        status = agent_output["status"]

        evidence = (
            "Expected behavior matched actual behavior."
            if status == "Passed"
            else f"Failure detected: {failure_type} in {test.id}."
        )

        results.append(
            TestResult(
                id=test.id,
                name=test.category,
                category=test.category,
                status=status,
                expected=test.expected,
                actual=agent_output["actual"],
                evidence=evidence,
                failure_type=failure_type,
                risk_points=risk_points,
            )
        )

    passed = sum(1 for item in results if item.status == "Passed")
    failed = len(results) - passed
    risk_score = min(
        sum(item.risk_points for item in results if item.status == "Failed"),
        100,
    )

    return ExecutionResult(
        assessment_id=assessment_id,
        run_id=f"RUN-{assessment_id}-{mode.upper()}",
        mode=mode,
        passed=passed,
        failed=failed,
        risk_score=risk_score,
        decision=get_release_decision(risk_score),
        results=results,
    )

