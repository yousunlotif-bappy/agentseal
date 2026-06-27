/**
 * AgentSeal Shared Types
 * ----------------------
 * This file is the single source of truth for frontend workflow data.
 *
 * Phase 6 upgrade:
 * - RiskSeal scoring types added
 * - Release decision types added
 * - Human review routing types added
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
  | "Release Certificate";

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
 * - a normal Test Forge test case
 * - a Gladiator red-team prompt
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
 * Timeline item for the execution lifecycle.
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
 * One explainable risk contribution.
 * RiskSeal uses this to show why the score increased.
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
 * Release gates are judge-friendly.
 * They show what passed, what needs review, and what blocks production.
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



