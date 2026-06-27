import type {
  AgentAssessment,
  EvidenceVaultReport,
  GeneratedTestCase,
  HumanReviewRecord,
  RedTeamPrompt,
  RiskSealReport,
  TestExecutionRun,
} from "./agentseal-types";

/**
 * AgentSeal Evidence Vault Generator
 * ----------------------------------
 * Phase 8 frontend-only evidence pack generator.
 *
 * It collects:
 * - Assessment
 * - Test Forge cases
 * - Gladiator prompts
 * - Test Execution run
 * - RiskSeal report
 * - Human Seal Gate review record
 *
 * Then creates:
 * - audit-ready evidence pack
 * - evidence artifact list
 * - report structure
 * - traceable timeline
 * - downloadable artifact metadata
 *
 * Later this can connect to:
 * - UiPath Orchestrator
 * - UiPath Test Cloud
 * - Document Understanding
 * - Real PDF/report generation
 * - Real storage bucket/database
 */

function nowIso() {
  return new Date().toISOString();
}

function createEvidenceId(assessment: AgentAssessment) {
  const shortId = assessment.id.replace("AS-", "").slice(-6);

  return `EV-${shortId}`;
}

function createReportId() {
  return `EVR-${Date.now()}`;
}

function getVaultStatus(review: HumanReviewRecord) {
  if (review.decision === "Approved") return "Certificate Ready";

  if (review.decision === "Rejected") {
    return "Archived for Remediation";
  }

  return "Review Archive";
}

function getReadinessScore(review: HumanReviewRecord, riskReport: RiskSealReport) {
  if (review.decision === "Approved") {
    return Math.max(70, 100 - riskReport.riskScore);
  }

  if (review.decision === "Remediation Requested") {
    return Math.max(40, 75 - riskReport.riskScore);
  }

  return Math.max(10, 50 - riskReport.riskScore);
}

function getSummary({
  assessment,
  tests,
  prompts,
  executionRun,
  riskReport,
  review,
}: {
  assessment: AgentAssessment;
  tests: GeneratedTestCase[];
  prompts: RedTeamPrompt[];
  executionRun: TestExecutionRun;
  riskReport: RiskSealReport;
  review: HumanReviewRecord;
}) {
  if (review.decision === "Approved") {
    return `${assessment.agentName} has a complete audit trail: ${tests.length} test cases, ${prompts.length} red-team prompts, ${executionRun.totalChecks} execution results, RiskSeal score ${riskReport.riskScore}/100, and human approval. Evidence is ready for certificate generation.`;
  }

  if (review.decision === "Rejected") {
    return `${assessment.agentName} has been archived with complete evidence, but release is rejected. The evidence pack contains failures, RiskSeal decision, and reviewer notes for remediation.`;
  }

  return `${assessment.agentName} has a complete evidence pack, but remediation is requested. The evidence should be used for rework and RiskSeal recheck.`;
}

/**
 * Main function used by /evidence-vault page.
 */
export function generateEvidenceVaultReport({
  assessment,
  tests,
  prompts,
  executionRun,
  riskReport,
  review,
}: {
  assessment: AgentAssessment;
  tests: GeneratedTestCase[];
  prompts: RedTeamPrompt[];
  executionRun: TestExecutionRun;
  riskReport: RiskSealReport;
  review: HumanReviewRecord;
}): EvidenceVaultReport {
  const evidenceId = createEvidenceId(assessment);

  const artifacts = [
    {
      id: "ART-001",
      type: "Assessment",
      name: "Agent Assessment Intake",
      description:
        "Original submitted agent details, business rules, sensitive data policy, endpoint, and reviewer.",
      sourceModule: "Intake" as const,
      status: "Captured" as const,
      count: 1,
      tone: "cyan" as const,
    },
    {
      id: "ART-002",
      type: "Test Cases",
      name: "Test Forge Validation Suite",
      description:
        "Generated functional, policy, privacy, tool-safety, forbidden-action, and approval tests.",
      sourceModule: "Test Forge" as const,
      status: "Generated" as const,
      count: tests.length,
      tone: "blue" as const,
    },
    {
      id: "ART-003",
      type: "Red-Team Prompts",
      name: "Gladiator Adversarial Prompt Library",
      description:
        "Generated prompt injection, PII extraction, approval bypass, policy bypass, and tool misuse prompts.",
      sourceModule: "Gladiator Engine" as const,
      status: "Generated" as const,
      count: prompts.length,
      tone: "rose" as const,
    },
    {
      id: "ART-004",
      type: "Execution Results",
      name: "Test Execution Evidence",
      description:
        "Pass, fail, blocked, and warning outcomes with expected behavior, actual behavior, and evidence text.",
      sourceModule: "Test Execution" as const,
      status: "Executed" as const,
      count: executionRun.totalChecks,
      tone: "cyan" as const,
    },
    {
      id: "ART-005",
      type: "RiskSeal",
      name: "Risk Score and Release Decision",
      description:
        "Explainable risk score, contribution breakdown, release gates, and recommendations.",
      sourceModule: "RiskSeal" as const,
      status: "Calculated" as const,
      count: riskReport.contributions.length + riskReport.gates.length,
      tone: "amber" as const,
    },
    {
      id: "ART-006",
      type: "Human Review",
      name: "Human Seal Gate Decision Record",
      description:
        "Reviewer notes, decision, approval route, checklist, and human-in-the-loop audit trail.",
      sourceModule: "Human Seal Gate" as const,
      status: "Recorded" as const,
      count: review.checklist.length,
      tone: review.decision === "Approved" ? ("green" as const) : ("amber" as const),
    },
    {
      id: "ART-007",
      type: "Audit Package",
      name: "Evidence Vault Package",
      description:
        "Complete traceable evidence package prepared for release certificate, remediation, or recheck.",
      sourceModule: "Evidence Vault" as const,
      status: "Packaged" as const,
      count: 1,
      tone: "green" as const,
    },
  ];

  const reportSections = [
    {
      id: "SEC-001",
      title: "Executive Summary",
      description:
        "Agent name, evidence ID, risk score, human decision, and final route.",
      included: true,
    },
    {
      id: "SEC-002",
      title: "Submitted Assessment",
      description:
        "Original business domain, agent description, business rules, policies, endpoint, and reviewer.",
      included: true,
    },
    {
      id: "SEC-003",
      title: "Generated Test Cases",
      description:
        "Traceable Test Forge cases with risk category, source rule, and expected result.",
      included: tests.length > 0,
    },
    {
      id: "SEC-004",
      title: "Generated Red-Team Prompts",
      description:
        "Gladiator adversarial prompts with attack type, severity, objective, and expected safe behavior.",
      included: prompts.length > 0,
    },
    {
      id: "SEC-005",
      title: "Execution Results",
      description:
        "Pass, fail, blocked, and warning outcomes with evidence logs.",
      included: executionRun.totalChecks > 0,
    },
    {
      id: "SEC-006",
      title: "RiskSeal Analysis",
      description:
        "Risk score, decision, route, contribution breakdown, gates, and recommendations.",
      included: true,
    },
    {
      id: "SEC-007",
      title: "Human Seal Gate Review",
      description:
        "Reviewer decision, notes, checklist, approval flag, and route.",
      included: true,
    },
    {
      id: "SEC-008",
      title: "Certificate Readiness",
      description:
        "Evidence status and next step for Release Certificate or remediation.",
      included: true,
    },
  ];

  const timeline = [
    {
      id: "TL-EV-001",
      title: "Assessment Captured",
      description: `${assessment.agentName} assessment was submitted and stored.`,
      timestamp: assessment.createdAt,
      status: "Captured" as const,
    },
    {
      id: "TL-EV-002",
      title: "Test Forge Evidence Added",
      description: `${tests.length} generated test cases were attached to the evidence pack.`,
      timestamp: executionRun.createdAt,
      status: "Captured" as const,
    },
    {
      id: "TL-EV-003",
      title: "Gladiator Evidence Added",
      description: `${prompts.length} red-team prompts were attached to the evidence pack.`,
      timestamp: executionRun.createdAt,
      status: "Captured" as const,
    },
    {
      id: "TL-EV-004",
      title: "Execution Evidence Added",
      description: `${executionRun.totalChecks} execution results were packaged.`,
      timestamp: executionRun.createdAt,
      status: "Captured" as const,
    },
    {
      id: "TL-EV-005",
      title: "RiskSeal Evidence Added",
      description: `RiskSeal decision was ${riskReport.decision} with score ${riskReport.riskScore}/100.`,
      timestamp: riskReport.createdAt,
      status: "Captured" as const,
    },
    {
      id: "TL-EV-006",
      title: "Human Review Added",
      description: `Reviewer decision was ${review.decision}.`,
      timestamp: review.createdAt,
      status: "Captured" as const,
    },
    {
      id: "TL-EV-007",
      title: "Evidence Vault Packaged",
      description: "Audit-ready evidence package was generated.",
      timestamp: nowIso(),
      status: "Ready" as const,
    },
  ];

  const downloadableArtifacts = [
    {
      id: "DL-001",
      filename: `${evidenceId}-assessment.json`,
      description: "Submitted assessment details",
      kind: "JSON" as const,
    },
    {
      id: "DL-002",
      filename: `${evidenceId}-test-cases.json`,
      description: "Generated Test Forge suite",
      kind: "JSON" as const,
    },
    {
      id: "DL-003",
      filename: `${evidenceId}-red-team-prompts.json`,
      description: "Generated Gladiator prompt library",
      kind: "JSON" as const,
    },
    {
      id: "DL-004",
      filename: `${evidenceId}-execution-results.json`,
      description: "Execution results and evidence logs",
      kind: "JSON" as const,
    },
    {
      id: "DL-005",
      filename: `${evidenceId}-riskseal-report.json`,
      description: "Risk score and release decision",
      kind: "JSON" as const,
    },
    {
      id: "DL-006",
      filename: `${evidenceId}-human-review.json`,
      description: "Reviewer decision record",
      kind: "JSON" as const,
    },
    {
      id: "DL-007",
      filename: `${evidenceId}-audit-report.pdf`,
      description: "Future PDF audit report placeholder",
      kind: "Report" as const,
    },
  ];

  return {
    id: createReportId(),
    assessmentId: assessment.id,
    createdAt: nowIso(),

    agentName: assessment.agentName,
    evidenceId,
    status: getVaultStatus(review),
    readinessScore: getReadinessScore(review, riskReport),

    totalEvidenceItems:
      artifacts.length +
      tests.length +
      prompts.length +
      executionRun.results.length +
      riskReport.contributions.length +
      review.checklist.length,

    totalTests: tests.length,
    totalPrompts: prompts.length,
    totalExecutionResults: executionRun.totalChecks,
    riskScore: riskReport.riskScore,
    humanDecision: review.decision,

    summary: getSummary({
      assessment,
      tests,
      prompts,
      executionRun,
      riskReport,
      review,
    }),

    artifacts,
    reportSections,
    timeline,
    downloadableArtifacts,

    uiPathMappings: [
      {
        id: "MAP-001",
        evidence: "Generated test cases",
        uiPathRole: "UiPath Test Manager / Test Cloud",
      },
      {
        id: "MAP-002",
        evidence: "Red-team prompts",
        uiPathRole: "UiPath coded agent / AI validation workflow",
      },
      {
        id: "MAP-003",
        evidence: "Execution results",
        uiPathRole: "UiPath Test Cloud run evidence",
      },
      {
        id: "MAP-004",
        evidence: "Risk score and route",
        uiPathRole: "Maestro BPMN / risk scoring workflow",
      },
      {
        id: "MAP-005",
        evidence: "Reviewer decision",
        uiPathRole: "UiPath Action Center / Human Task",
      },
      {
        id: "MAP-006",
        evidence: "Evidence package",
        uiPathRole: "Audit vault / release certificate workflow",
      },
    ],
  };
}



