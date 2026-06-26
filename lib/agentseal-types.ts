/**
 * AgentSeal Shared Types
 * ----------------------
 * This file is the single source of truth for our frontend data structure.
 *
 * Phase 3 upgrade:
 * - Added RedTeamPrompt type
 * - Added attack/severity types
 * - Added "Red Team Generated" status
 */

export type AssessmentStatus =
  | "Submitted"
  | "Tests Generated"
  | "Ready for Red Team"
  | "Red Team Generated"
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

/**
 * Main object created from the New Agent Assessment form.
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
 * Test Forge creates these from assessment data.
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
 * Gladiator Engine creates these from generated test cases.
 *
 * Important:
 * These prompts are for safe red-team simulation only.
 * They help prove that an AI agent refuses unsafe, policy-breaking,
 * privacy-breaking, or unauthorized requests.
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



