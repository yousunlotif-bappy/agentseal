/**
 * AgentSeal Shared Types
 * ----------------------
 * This file is the single source of truth for frontend data.
 *
 * Phase 4 upgrade:
 * - Test Forge already creates test cases.
 * - Gladiator Engine now creates red-team prompts from those test cases.
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
 *
 * These are defensive red-team prompts for safe validation.
 * They are used to test whether the AI agent refuses unsafe requests.
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


