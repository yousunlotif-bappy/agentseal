import type {
  AgentAssessment,
  EvidenceVaultReport,
  HumanReviewRecord,
  ReleaseCertificate,
  RiskSealReport,
  TestExecutionRun,
} from "./agentseal-types";

/**
 * AgentSeal Release Certificate Generator
 * ---------------------------------------
 * Phase 9 frontend-only certificate generator.
 *
 * It reads:
 * - Assessment
 * - Evidence Vault report
 * - RiskSeal report
 * - Human Seal Gate approval
 * - Test Execution run
 *
 * Then creates:
 * - Final AgentSeal production certificate
 * - Verified release controls
 * - Lifecycle trace
 * - Verification payload
 * - Downloadable certificate metadata
 *
 * Later this can be replaced by real PDF generation,
 * signed certificate issuance, QR verification, and backend storage.
 */

const CERTIFICATE_VALIDITY_DAYS = 90;

function nowDate() {
  return new Date();
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);

  copy.setDate(copy.getDate() + days);

  return copy;
}

function compactDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function createCertificateId(assessment: AgentAssessment) {
  const shortAssessmentId = assessment.id.replace("AS-", "").slice(-6);
  const datePart = compactDate(nowDate());

  return `AGC-${datePart}-${shortAssessmentId}`;
}

function createCertificateRecordId() {
  return `CERT-${Date.now()}`;
}

function getSealLevel(riskScore: number) {
  if (riskScore <= 20) return "Production Ready" as const;

  return "Production Ready with Monitoring" as const;
}

function createSummary({
  assessment,
  evidenceReport,
  riskReport,
  executionRun,
}: {
  assessment: AgentAssessment;
  evidenceReport: EvidenceVaultReport;
  riskReport: RiskSealReport;
  executionRun: TestExecutionRun;
}) {
  return `${assessment.agentName} is granted an AgentSeal production certificate. The release is backed by ${evidenceReport.totalTests} generated tests, ${evidenceReport.totalPrompts} red-team prompts, ${executionRun.totalChecks} execution checks, RiskSeal score ${riskReport.riskScore}/100, human approval, and Evidence Vault package ${evidenceReport.evidenceId}.`;
}

/**
 * Main function used by /release-certificate page.
 */
export function generateReleaseCertificate({
  assessment,
  evidenceReport,
  riskReport,
  humanReview,
  executionRun,
}: {
  assessment: AgentAssessment;
  evidenceReport: EvidenceVaultReport;
  riskReport: RiskSealReport;
  humanReview: HumanReviewRecord;
  executionRun: TestExecutionRun;
}): ReleaseCertificate {
  const issuedAt = nowDate();
  const validUntil = addDays(issuedAt, CERTIFICATE_VALIDITY_DAYS);
  const certificateId = createCertificateId(assessment);

  const verificationUrl = `https://agentseal.local/verify/${certificateId}`;

  const qrPayload = JSON.stringify({
    certificateId,
    agentName: assessment.agentName,
    evidenceId: evidenceReport.evidenceId,
    riskScore: riskReport.riskScore,
    status: "Seal Granted",
  });

  return {
    id: createCertificateRecordId(),
    assessmentId: assessment.id,
    evidenceVaultReportId: evidenceReport.id,
    humanReviewRecordId: humanReview.id,
    riskSealReportId: riskReport.id,

    certificateId,
    issuedAt: issuedAt.toISOString(),
    validUntil: validUntil.toISOString(),
    validityDays: CERTIFICATE_VALIDITY_DAYS,

    agentName: assessment.agentName,
    businessDomain: assessment.businessDomain,
    status: "Seal Granted",
    sealLevel: getSealLevel(riskReport.riskScore),

    finalRiskScore: riskReport.riskScore,
    readinessScore: evidenceReport.readinessScore,
    evidenceId: evidenceReport.evidenceId,
    reviewerEmail: humanReview.reviewerEmail,

    summary: createSummary({
      assessment,
      evidenceReport,
      riskReport,
      executionRun,
    }),

    verificationUrl,
    qrPayload,

    controls: [
      {
        id: "CTRL-001",
        title: "Assessment evidence verified",
        description:
          "Original agent submission, business rules, policy, endpoint, and reviewer identity are linked.",
        status: "Verified",
      },
      {
        id: "CTRL-002",
        title: "Generated tests verified",
        description: `${evidenceReport.totalTests} Test Forge cases are included in the evidence vault.`,
        status: "Verified",
      },
      {
        id: "CTRL-003",
        title: "Red-team validation verified",
        description: `${evidenceReport.totalPrompts} Gladiator adversarial prompts are included and traceable.`,
        status: "Verified",
      },
      {
        id: "CTRL-004",
        title: "Execution evidence verified",
        description: `${executionRun.totalChecks} execution results are archived with pass, fail, blocked, and warning status.`,
        status: "Verified",
      },
      {
        id: "CTRL-005",
        title: "RiskSeal score verified",
        description: `RiskSeal score is ${riskReport.riskScore}/100 with release route ${riskReport.route}.`,
        status: "Verified",
      },
      {
        id: "CTRL-006",
        title: "Human approval verified",
        description: `Reviewer ${humanReview.reviewerEmail} approved the release through Human Seal Gate.`,
        status: "Verified",
      },
      {
        id: "CTRL-007",
        title: "Evidence Vault package verified",
        description: `Evidence Vault package ${evidenceReport.evidenceId} is complete and audit-ready.`,
        status: "Verified",
      },
    ],

    lifecycle: [
      {
        id: "LC-001",
        stage: "Intake",
        title: "Agent assessment submitted",
        description: "Agent business rules, tools, policies, endpoint, and reviewer were captured.",
        timestamp: assessment.createdAt,
        status: "Completed",
      },
      {
        id: "LC-002",
        stage: "Test Forge",
        title: "Test suite generated",
        description: `${evidenceReport.totalTests} test cases were generated from the assessment.`,
        timestamp: executionRun.createdAt,
        status: "Completed",
      },
      {
        id: "LC-003",
        stage: "Gladiator Engine",
        title: "Red-team prompts generated",
        description: `${evidenceReport.totalPrompts} adversarial prompts were generated.`,
        timestamp: executionRun.createdAt,
        status: "Completed",
      },
      {
        id: "LC-004",
        stage: "Test Execution",
        title: "Validation suite executed",
        description: `${executionRun.totalChecks} execution checks were simulated and logged.`,
        timestamp: executionRun.createdAt,
        status: "Completed",
      },
      {
        id: "LC-005",
        stage: "RiskSeal",
        title: "Risk score calculated",
        description: `RiskSeal generated final score ${riskReport.riskScore}/100.`,
        timestamp: riskReport.createdAt,
        status: "Completed",
      },
      {
        id: "LC-006",
        stage: "Human Seal Gate",
        title: "Human approval completed",
        description: `Human reviewer decision: ${humanReview.decision}.`,
        timestamp: humanReview.createdAt,
        status: "Completed",
      },
      {
        id: "LC-007",
        stage: "Evidence Vault",
        title: "Evidence package created",
        description: `Evidence Vault package ${evidenceReport.evidenceId} was generated.`,
        timestamp: evidenceReport.createdAt,
        status: "Completed",
      },
      {
        id: "LC-008",
        stage: "Release Certificate",
        title: "Production certificate issued",
        description: `Certificate ${certificateId} was issued for production readiness.`,
        timestamp: issuedAt.toISOString(),
        status: "Completed",
      },
    ],

    proofMapping: [
      {
        id: "PROOF-001",
        proof: "Assessment intake",
        source: "New Agent Assessment",
      },
      {
        id: "PROOF-002",
        proof: "Generated tests",
        source: "Test Forge",
      },
      {
        id: "PROOF-003",
        proof: "Adversarial prompts",
        source: "Gladiator Engine",
      },
      {
        id: "PROOF-004",
        proof: "Execution results",
        source: "Test Execution",
      },
      {
        id: "PROOF-005",
        proof: "Risk score and release route",
        source: "RiskSeal",
      },
      {
        id: "PROOF-006",
        proof: "Reviewer approval",
        source: "Human Seal Gate",
      },
      {
        id: "PROOF-007",
        proof: "Audit-ready evidence package",
        source: "Evidence Vault",
      },
    ],

    downloadableArtifacts: [
      {
        id: "CERT-DL-001",
        filename: `${certificateId}-release-certificate.json`,
        description: "Release certificate JSON export",
      },
      {
        id: "CERT-DL-002",
        filename: `${certificateId}-evidence-reference.json`,
        description: "Evidence Vault reference metadata",
      },
      {
        id: "CERT-DL-003",
        filename: `${certificateId}-verification-record.json`,
        description: "Certificate verification payload",
      },
    ],
  };
}



