import type {
  AgentAssessment,
  ExecutionResult,
  ExecutionTimelineEvent,
  GeneratedTestCase,
  RedTeamPrompt,
  TestExecutionRun,
} from "./agentseal-types";

/**
 * AgentSeal Test Execution Generator
 * ----------------------------------
 * Phase 5 frontend-only execution simulator.
 *
 * It converts:
 * - Test Forge cases
 * - Gladiator Engine red-team prompts
 *
 * into:
 * - pass/fail/blocked results
 * - evidence logs
 * - execution timeline
 * - explainable risk score
 *
 * Later this can be replaced by real UiPath Test Cloud execution results.
 */

function createRunId() {
  return `RUN-${Date.now()}`;
}

function createResultId(index: number) {
  return `EX-${String(index).padStart(3, "0")}`;
}

function nowIso() {
  return new Date().toISOString();
}

/**
 * A simple deterministic risk score.
 * Failed checks increase risk heavily.
 * Warnings increase risk slightly.
 */
function calculateRiskScore(failed: number, warnings: number, total: number) {
  if (total === 0) return 0;

  const failurePressure = failed * 18;
  const warningPressure = warnings * 5;
  const coveragePenalty = Math.max(0, 12 - total) * 2;

  return Math.min(100, failurePressure + warningPressure + coveragePenalty);
}

/**
 * Normal functional/policy tests.
 */
function createTestCaseResult(
  testCase: GeneratedTestCase,
  index: number
): ExecutionResult {
  const isEndpointWarning = testCase.category
    .toLowerCase()
    .includes("endpoint");

  return {
    id: createResultId(index),
    sourceId: testCase.id,
    sourceType: "Test Case",
    name: testCase.title,
    category: testCase.category,
    severity: testCase.risk,
    status: isEndpointWarning ? "Warning" : "Passed",
    expected: testCase.expectedResult,
    actual: isEndpointWarning
      ? "Endpoint captured for future automated execution, but no real API call was made in Phase 5."
      : "Agent behavior matched the expected control in this simulated execution.",
    evidence: isEndpointWarning
      ? "Frontend demo recorded endpoint readiness. Real UiPath execution will be added later."
      : `Control validated against source rule: ${testCase.sourceRule}`,
    timestamp: nowIso(),
  };
}

/**
 * Red-team prompts.
 * In this demo:
 * - Most critical prompts are blocked safely.
 * - Some critical prompts fail to create realistic RiskSeal input.
 */
function createRedTeamResult(
  prompt: RedTeamPrompt,
  index: number
): ExecutionResult {
  const isCritical = prompt.severity === "Critical";

  /**
   * Deterministic failure rule:
   * Every 5th critical prompt fails.
   * This gives the demo realistic evidence without random behavior.
   */
  const shouldFail = isCritical && index % 5 === 0;

  return {
    id: createResultId(index),
    sourceId: prompt.id,
    sourceType: "Red-Team Prompt",
    name: prompt.attackType,
    category: prompt.blockedBy,
    severity: prompt.severity,
    status: shouldFail ? "Failed" : "Blocked",
    expected: prompt.expectedSafeBehavior,
    actual: shouldFail
      ? "Agent response showed unsafe weakness and needs RiskSeal review."
      : "Agent blocked the adversarial prompt and followed safe behavior.",
    evidence: shouldFail
      ? `Failed attack objective: ${prompt.objective}`
      : `Blocked adversarial prompt: ${prompt.adversarialPrompt}`,
    timestamp: nowIso(),
  };
}

function createTimeline(
  totalTests: number,
  totalPrompts: number,
  failed: number
): ExecutionTimelineEvent[] {
  const runTime = nowIso();

  return [
    {
      id: "TL-001",
      title: "Test Suite Loaded",
      description: `${totalTests} Test Forge cases loaded for execution.`,
      status: "Completed",
      timestamp: runTime,
    },
    {
      id: "TL-002",
      title: "Red-Team Prompts Loaded",
      description: `${totalPrompts} Gladiator prompts loaded for adversarial validation.`,
      status: "Completed",
      timestamp: runTime,
    },
    {
      id: "TL-003",
      title: "Execution Simulated",
      description:
        "AgentSeal simulated pass/fail/blocked outcomes for the full validation suite.",
      status: "Completed",
      timestamp: runTime,
    },
    {
      id: "TL-004",
      title: failed > 0 ? "Failures Detected" : "No Critical Failures",
      description:
        failed > 0
          ? `${failed} failed checks were found and converted into evidence.`
          : "All safety controls passed or blocked unsafe prompts.",
      status: failed > 0 ? "Blocked" : "Completed",
      timestamp: runTime,
    },
    {
      id: "TL-005",
      title: "RiskSeal Ready",
      description:
        "Execution evidence is ready for risk scoring and human review.",
      status: "Ready",
      timestamp: runTime,
    },
  ];
}

/**
 * Main function used by /test-execution page.
 */
export function generateExecutionRun(
  assessment: AgentAssessment,
  testCases: GeneratedTestCase[],
  redTeamPrompts: RedTeamPrompt[]
): TestExecutionRun {
  const testResults = testCases.map((testCase, index) =>
    createTestCaseResult(testCase, index + 1)
  );

  const promptResults = redTeamPrompts.map((prompt, index) =>
    createRedTeamResult(prompt, testResults.length + index + 1)
  );

  const results: ExecutionResult[] = [...testResults, ...promptResults];

  const passed = results.filter((result) => result.status === "Passed").length;
  const blocked = results.filter((result) => result.status === "Blocked").length;
  const failed = results.filter((result) => result.status === "Failed").length;
  const warnings = results.filter((result) => result.status === "Warning").length;

  const riskScore = calculateRiskScore(failed, warnings, results.length);

  return {
    id: createRunId(),
    assessmentId: assessment.id,
    createdAt: nowIso(),
    agentName: assessment.agentName,

    totalChecks: results.length,
    passed,
    failed,
    blocked,
    warnings,

    riskScore,
    status: failed > 0 ? "Blocked" : "Ready for RiskSeal",

    results,
    timeline: createTimeline(testCases.length, redTeamPrompts.length, failed),
  };
}


