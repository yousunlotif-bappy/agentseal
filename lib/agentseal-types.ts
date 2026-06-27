/**
 * AgentSeal Shared Types
 * ----------------------
 * Single source of truth for the full AgentSeal frontend workflow.
 *
 * Phase 10 upgrade:
 * - LiveSeal Monitor types added
 * - Runtime health, drift signal, incident, and monitoring report types added
 */

export type AssessmentStatus =
  | "Submitted"
  | "Tests Generated"
  | "Ready for Red Team"
  | "Red Team Generated"
  | "Execution Complete"
  | "Risk Scored"
  | "Under Review"
  | "Seal Granted"
  | "Blocked";

export type TrustStage =
  | "Intake"
  | "Test Forge"
  | "Gladiator Engine"
  | "Test Execution"
  | "RiskSeal"
  | "Human Seal Gate"
  | "Evidence Vault"
  | "Release Certificate"
  | "LiveSeal Monitor";

export type RiskLevel = "Low" | "Medium" | "High";

export type AttackSeverity = "Low" | "Medium" | "High" | "Critical";

export type TestCaseStatus = "Ready" | "Passed" | "Failed";

export type RedTeamPromptStatus = "Generated" | "Blocked" | "Passed" | "Failed";

export type ExecutionResultStatus = "Passed" | "Failed" | "Blocked" | "Warning";

export type ExecutionSourceType = "Test Case" | "Red-Team Prompt";

export type ExecutionRunStatus = "Ready for RiskSeal" | "Blocked";

export type RiskSealDecision = "Seal Ready" | "Human Review" | "Blocked";

export type RiskSealRoute =
  | "Release Certificate"
  | "Human Seal Gate"
  | "Remediation Required";

export type HumanReviewDecision =
  | "Approved"
  | "Rejected"
  | "Remediation Requested";

export type HumanReviewStatus = "Pending" | "Completed";

export type HumanReviewRoute =
  | "Evidence Vault"
  | "Remediation Required"
  | "RiskSeal Recheck";

export type EvidenceVaultStatus =
  | "Certificate Ready"
  | "Archived for Remediation"
  | "Review Archive";

export type EvidenceArtifactStatus =
  | "Captured"
  | "Generated"
  | "Executed"
  | "Calculated"
  | "Recorded"
  | "Packaged";

export type EvidenceTone = "cyan" | "blue" | "green" | "amber" | "rose";

export type ReleaseCertificateStatus = "Seal Granted" | "Certificate Blocked";

export type ReleaseSealLevel =
  | "Production Ready"
  | "Production Ready with Monitoring"
  | "Not Eligible";

export type LiveSealMonitorStatus =
  | "Healthy"
  | "Watch"
  | "Drift Detected"
  | "Incident";

export type LiveSealSignalStatus = "Passed" | "Watch" | "Failed";

export type LiveSealIncidentSeverity = "Low" | "Medium" | "High" | "Critical";

export type LiveSealIncidentStatus = "Open" | "Monitoring" | "Resolved";

/**
 * Main assessment object created from /assessment form.
 */
export type AgentAssessment = {
  id: string;
  createdAt: string;

  agentName: string;
  businessDomain: string;
  agentDescription: string;
  businessRules: string;
  sensitiveDataPolicy: string;
  allowedApis: string;
  forbiddenActions: string;
  humanApprovalRules: string;
  agentEndpoint: string;
  reviewerEmail: string;

  status: AssessmentStatus;
  trustStage: TrustStage;
};

/**
 * Test Forge creates these test cases from assessment data.
 */
export type GeneratedTestCase = {
  id: string;
  title: string;
  category: string;
  risk: RiskLevel;
  sourceRule: string;
  expectedResult: string;
  status: TestCaseStatus;
};

/**
 * Gladiator Engine creates these prompts from Test Forge cases.
 */
export type RedTeamPrompt = {
  id: string;
  testCaseId: string;
  attackType: string;
  severity: AttackSeverity;
  objective: string;
  adversarialPrompt: string;
  expectedSafeBehavior: string;
  blockedBy: string;
  status: RedTeamPromptStatus;
};

/**
 * One execution result created from either:
 * - normal test case
 * - red-team prompt
 */
export type ExecutionResult = {
  id: string;
  sourceId: string;
  sourceType: ExecutionSourceType;
  name: string;
  category: string;
  severity: RiskLevel | AttackSeverity;
  status: ExecutionResultStatus;
  expected: string;
  actual: string;
  evidence: string;
  timestamp: string;
};

/**
 * Timeline item for execution lifecycle.
 */
export type ExecutionTimelineEvent = {
  id: string;
  title: string;
  description: string;
  status: "Completed" | "Blocked" | "Ready";
  timestamp: string;
};

/**
 * Full execution run saved after clicking "Run Execution Suite".
 */
export type TestExecutionRun = {
  id: string;
  assessmentId: string;
  createdAt: string;
  agentName: string;

  totalChecks: number;
  passed: number;
  failed: number;
  blocked: number;
  warnings: number;

  riskScore: number;
  status: ExecutionRunStatus;

  results: ExecutionResult[];
  timeline: ExecutionTimelineEvent[];
};

/**
 * One explainable RiskSeal contribution.
 */
export type RiskContribution = {
  id: string;
  sourceId: string;
  label: string;
  points: number;
  reason: string;
  evidence: string;
};

/**
 * Release gates from RiskSeal.
 */
export type RiskSealGate = {
  id: string;
  label: string;
  status: "Passed" | "Review" | "Blocked";
  description: string;
};

/**
 * Full RiskSeal report.
 */
export type RiskSealReport = {
  id: string;
  assessmentId: string;
  executionRunId: string;
  createdAt: string;

  agentName: string;
  riskScore: number;
  decision: RiskSealDecision;
  route: RiskSealRoute;
  summary: string;

  totalChecks: number;
  passed: number;
  blocked: number;
  failed: number;
  warnings: number;

  contributions: RiskContribution[];
  gates: RiskSealGate[];
  recommendations: string[];
};

/**
 * Human Seal Gate checklist.
 */
export type HumanReviewChecklistItem = {
  id: string;
  label: string;
  status: "Checked" | "Attention Required";
  note: string;
};

/**
 * Human Seal Gate final record.
 */
export type HumanReviewRecord = {
  id: string;
  assessmentId: string;
  riskSealReportId: string;
  createdAt: string;

  reviewerEmail: string;
  reviewerName: string;

  decision: HumanReviewDecision;
  status: HumanReviewStatus;
  route: HumanReviewRoute;

  approvedForRelease: boolean;
  linkedRiskDecision: RiskSealDecision;
  linkedRiskScore: number;

  notes: string;
  summary: string;
  checklist: HumanReviewChecklistItem[];
};

/**
 * One evidence artifact shown in Evidence Vault.
 */
export type EvidenceVaultArtifact = {
  id: string;
  type: string;
  name: string;
  description: string;
  sourceModule: TrustStage;
  status: EvidenceArtifactStatus;
  count: number;
  tone: EvidenceTone;
};

/**
 * Evidence report section.
 */
export type EvidenceVaultReportSection = {
  id: string;
  title: string;
  description: string;
  included: boolean;
};

/**
 * Evidence Vault timeline event.
 */
export type EvidenceVaultTimelineEvent = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: "Captured" | "Packaged" | "Ready";
};

/**
 * Evidence Vault downloadable artifact metadata.
 */
export type EvidenceDownloadableArtifact = {
  id: string;
  filename: string;
  description: string;
  kind: "JSON" | "Report" | "Evidence";
};

/**
 * Full Evidence Vault report.
 */
export type EvidenceVaultReport = {
  id: string;
  assessmentId: string;
  createdAt: string;

  agentName: string;
  evidenceId: string;
  status: EvidenceVaultStatus;
  readinessScore: number;

  totalEvidenceItems: number;
  totalTests: number;
  totalPrompts: number;
  totalExecutionResults: number;
  riskScore: number;
  humanDecision: HumanReviewDecision;

  summary: string;
  artifacts: EvidenceVaultArtifact[];
  reportSections: EvidenceVaultReportSection[];
  timeline: EvidenceVaultTimelineEvent[];
  downloadableArtifacts: EvidenceDownloadableArtifact[];
  uiPathMappings: Array<{
    id: string;
    evidence: string;
    uiPathRole: string;
  }>;
};

/**
 * Verified control shown on Release Certificate.
 */
export type ReleaseCertificateControl = {
  id: string;
  title: string;
  description: string;
  status: "Verified";
};

/**
 * Release certificate lifecycle trace.
 */
export type ReleaseCertificateLifecycleItem = {
  id: string;
  stage: TrustStage;
  title: string;
  description: string;
  timestamp: string;
  status: "Completed";
};

/**
 * Final Release Certificate generated from Evidence Vault.
 */
export type ReleaseCertificate = {
  id: string;
  assessmentId: string;
  evidenceVaultReportId: string;
  humanReviewRecordId: string;
  riskSealReportId: string;

  certificateId: string;
  issuedAt: string;
  validUntil: string;
  validityDays: number;

  agentName: string;
  businessDomain: string;
  status: ReleaseCertificateStatus;
  sealLevel: ReleaseSealLevel;

  finalRiskScore: number;
  readinessScore: number;
  evidenceId: string;
  reviewerEmail: string;

  summary: string;
  verificationUrl: string;
  qrPayload: string;

  controls: ReleaseCertificateControl[];
  lifecycle: ReleaseCertificateLifecycleItem[];

  proofMapping: Array<{
    id: string;
    proof: string;
    source: string;
  }>;

  downloadableArtifacts: Array<{
    id: string;
    filename: string;
    description: string;
  }>;
};

/**
 * One live monitoring signal.
 * Example: policy drift, endpoint health, tool boundary, PII protection.
 */
export type LiveSealSignal = {
  id: string;
  title: string;
  category: string;
  status: LiveSealSignalStatus;
  severity: LiveSealIncidentSeverity;
  description: string;
  evidence: string;
};

/**
 * Runtime metric shown in LiveSeal Monitor.
 */
export type LiveSealRuntimeMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: LiveSealSignalStatus;
  description: string;
};

/**
 * LiveSeal incident/watch item.
 */
export type LiveSealIncident = {
  id: string;
  title: string;
  severity: LiveSealIncidentSeverity;
  status: LiveSealIncidentStatus;
  description: string;
  recommendation: string;
  linkedEvidence: string;
};

/**
 * Live monitoring timeline event.
 */
export type LiveSealTimelineEvent = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: "Completed" | "Watching" | "Action Required";
};

/**
 * Full LiveSeal Monitor report.
 */
export type LiveSealMonitorReport = {
  id: string;
  assessmentId: string;
  certificateId: string;
  evidenceVaultReportId: string;
  createdAt: string;

  agentName: string;
  businessDomain: string;
  endpoint: string;

  monitorId: string;
  status: LiveSealMonitorStatus;
  healthScore: number;
  driftScore: number;
  uptimePercent: number;

  finalRiskScore: number;
  certificateValidUntil: string;
  nextValidationAt: string;

  summary: string;

  runtimeMetrics: LiveSealRuntimeMetric[];
  signals: LiveSealSignal[];
  incidents: LiveSealIncident[];
  timeline: LiveSealTimelineEvent[];

  actionPlan: string[];

  uiPathMappings: Array<{
    id: string;
    monitorItem: string;
    uiPathRole: string;
  }>;

  downloadableArtifacts: Array<{
    id: string;
    filename: string;
    description: string;
  }>;
};



