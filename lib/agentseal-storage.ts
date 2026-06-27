import type {
  AgentAssessment,
  AssessmentStatus,
  EvidenceVaultReport,
  GeneratedTestCase,
  HumanReviewRecord,
  LiveSealMonitorReport,
  RedTeamPrompt,
  ReleaseCertificate,
  RiskSealReport,
  TestExecutionRun,
  TrustStage,
} from "./agentseal-types";

/**
 * AgentSeal Storage Layer
 * -----------------------
 * Phase 10 still uses browser localStorage as frontend demo database.
 *
 * Later:
 * These helpers can be replaced by backend APIs, database,
 * UiPath Orchestrator, UiPath Action Center, UiPath Test Cloud,
 * cloud object storage, or real runtime monitoring services.
 */

const ASSESSMENTS_KEY = "agentseal.assessments.v1";
const ACTIVE_ASSESSMENT_KEY = "agentseal.activeAssessmentId.v1";
const TEST_CASES_KEY = "agentseal.generatedTestCases.v1";
const RED_TEAM_PROMPTS_KEY = "agentseal.redTeamPrompts.v1";
const EXECUTION_RUNS_KEY = "agentseal.executionRuns.v1";
const RISKSEAL_REPORTS_KEY = "agentseal.riskSealReports.v1";
const HUMAN_REVIEW_RECORDS_KEY = "agentseal.humanReviewRecords.v1";
const EVIDENCE_VAULT_REPORTS_KEY = "agentseal.evidenceVaultReports.v1";
const RELEASE_CERTIFICATES_KEY = "agentseal.releaseCertificates.v1";
const LIVESEAL_MONITOR_REPORTS_KEY = "agentseal.liveSealMonitorReports.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Safe localStorage JSON reader.
 */
function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safe localStorage JSON writer.
 */
function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;

  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Assessment helpers
 */
export function getAssessments(): AgentAssessment[] {
  return readJson<AgentAssessment[]>(ASSESSMENTS_KEY, []);
}

export function saveAssessment(assessment: AgentAssessment) {
  if (!isBrowser()) return;

  const existingAssessments = getAssessments();

  const filteredAssessments = existingAssessments.filter(
    (item) => item.id !== assessment.id
  );

  const updatedAssessments = [assessment, ...filteredAssessments];

  writeJson(ASSESSMENTS_KEY, updatedAssessments);
  window.localStorage.setItem(ACTIVE_ASSESSMENT_KEY, assessment.id);
}

export function getActiveAssessment(): AgentAssessment | null {
  if (!isBrowser()) return null;

  const assessments = getAssessments();
  const activeAssessmentId = window.localStorage.getItem(ACTIVE_ASSESSMENT_KEY);

  if (activeAssessmentId) {
    const activeAssessment = assessments.find(
      (assessment) => assessment.id === activeAssessmentId
    );

    if (activeAssessment) {
      return activeAssessment;
    }
  }

  return assessments[0] ?? null;
}

export function updateAssessmentStatus(
  assessmentId: string,
  status: AssessmentStatus,
  trustStage: TrustStage
): AgentAssessment | null {
  const assessments = getAssessments();

  let updatedAssessment: AgentAssessment | null = null;

  const updatedAssessments = assessments.map((assessment) => {
    if (assessment.id !== assessmentId) {
      return assessment;
    }

    updatedAssessment = {
      ...assessment,
      status,
      trustStage,
    };

    return updatedAssessment;
  });

  writeJson(ASSESSMENTS_KEY, updatedAssessments);

  return updatedAssessment;
}

/**
 * Test Forge helpers
 */
function getAllGeneratedTests(): Record<string, GeneratedTestCase[]> {
  return readJson<Record<string, GeneratedTestCase[]>>(TEST_CASES_KEY, {});
}

export function saveGeneratedTests(
  assessmentId: string,
  testCases: GeneratedTestCase[]
) {
  const allGeneratedTests = getAllGeneratedTests();

  writeJson(TEST_CASES_KEY, {
    ...allGeneratedTests,
    [assessmentId]: testCases,
  });
}

export function getGeneratedTests(assessmentId: string): GeneratedTestCase[] {
  const allGeneratedTests = getAllGeneratedTests();

  return allGeneratedTests[assessmentId] ?? [];
}

/**
 * Gladiator Engine helpers
 */
function getAllGeneratedPrompts(): Record<string, RedTeamPrompt[]> {
  return readJson<Record<string, RedTeamPrompt[]>>(RED_TEAM_PROMPTS_KEY, {});
}

export function saveGeneratedPrompts(
  assessmentId: string,
  prompts: RedTeamPrompt[]
) {
  const allGeneratedPrompts = getAllGeneratedPrompts();

  writeJson(RED_TEAM_PROMPTS_KEY, {
    ...allGeneratedPrompts,
    [assessmentId]: prompts,
  });
}

export function getGeneratedPrompts(assessmentId: string): RedTeamPrompt[] {
  const allGeneratedPrompts = getAllGeneratedPrompts();

  return allGeneratedPrompts[assessmentId] ?? [];
}

/**
 * Test Execution helpers
 */
function getAllExecutionRuns(): Record<string, TestExecutionRun> {
  return readJson<Record<string, TestExecutionRun>>(EXECUTION_RUNS_KEY, {});
}

export function saveExecutionRun(
  assessmentId: string,
  executionRun: TestExecutionRun
) {
  const allExecutionRuns = getAllExecutionRuns();

  writeJson(EXECUTION_RUNS_KEY, {
    ...allExecutionRuns,
    [assessmentId]: executionRun,
  });
}

export function getExecutionRun(assessmentId: string): TestExecutionRun | null {
  const allExecutionRuns = getAllExecutionRuns();

  return allExecutionRuns[assessmentId] ?? null;
}

/**
 * RiskSeal helpers
 */
function getAllRiskSealReports(): Record<string, RiskSealReport> {
  return readJson<Record<string, RiskSealReport>>(RISKSEAL_REPORTS_KEY, {});
}

export function saveRiskSealReport(
  assessmentId: string,
  report: RiskSealReport
) {
  const allReports = getAllRiskSealReports();

  writeJson(RISKSEAL_REPORTS_KEY, {
    ...allReports,
    [assessmentId]: report,
  });
}

export function getRiskSealReport(
  assessmentId: string
): RiskSealReport | null {
  const allReports = getAllRiskSealReports();

  return allReports[assessmentId] ?? null;
}

/**
 * Human Seal Gate helpers
 */
function getAllHumanReviewRecords(): Record<string, HumanReviewRecord> {
  return readJson<Record<string, HumanReviewRecord>>(
    HUMAN_REVIEW_RECORDS_KEY,
    {}
  );
}

export function saveHumanReviewRecord(
  assessmentId: string,
  record: HumanReviewRecord
) {
  const allRecords = getAllHumanReviewRecords();

  writeJson(HUMAN_REVIEW_RECORDS_KEY, {
    ...allRecords,
    [assessmentId]: record,
  });
}

export function getHumanReviewRecord(
  assessmentId: string
): HumanReviewRecord | null {
  const allRecords = getAllHumanReviewRecords();

  return allRecords[assessmentId] ?? null;
}

/**
 * Evidence Vault helpers
 */
function getAllEvidenceVaultReports(): Record<string, EvidenceVaultReport> {
  return readJson<Record<string, EvidenceVaultReport>>(
    EVIDENCE_VAULT_REPORTS_KEY,
    {}
  );
}

export function saveEvidenceVaultReport(
  assessmentId: string,
  report: EvidenceVaultReport
) {
  const allReports = getAllEvidenceVaultReports();

  writeJson(EVIDENCE_VAULT_REPORTS_KEY, {
    ...allReports,
    [assessmentId]: report,
  });
}

export function getEvidenceVaultReport(
  assessmentId: string
): EvidenceVaultReport | null {
  const allReports = getAllEvidenceVaultReports();

  return allReports[assessmentId] ?? null;
}

/**
 * Release Certificate helpers
 */
function getAllReleaseCertificates(): Record<string, ReleaseCertificate> {
  return readJson<Record<string, ReleaseCertificate>>(
    RELEASE_CERTIFICATES_KEY,
    {}
  );
}

export function saveReleaseCertificate(
  assessmentId: string,
  certificate: ReleaseCertificate
) {
  const allCertificates = getAllReleaseCertificates();

  writeJson(RELEASE_CERTIFICATES_KEY, {
    ...allCertificates,
    [assessmentId]: certificate,
  });
}

export function getReleaseCertificate(
  assessmentId: string
): ReleaseCertificate | null {
  const allCertificates = getAllReleaseCertificates();

  return allCertificates[assessmentId] ?? null;
}

/**
 * LiveSeal Monitor helpers
 */
function getAllLiveSealMonitorReports(): Record<
  string,
  LiveSealMonitorReport
> {
  return readJson<Record<string, LiveSealMonitorReport>>(
    LIVESEAL_MONITOR_REPORTS_KEY,
    {}
  );
}

export function saveLiveSealMonitorReport(
  assessmentId: string,
  report: LiveSealMonitorReport
) {
  const allReports = getAllLiveSealMonitorReports();

  writeJson(LIVESEAL_MONITOR_REPORTS_KEY, {
    ...allReports,
    [assessmentId]: report,
  });
}

export function getLiveSealMonitorReport(
  assessmentId: string
): LiveSealMonitorReport | null {
  const allReports = getAllLiveSealMonitorReports();

  return allReports[assessmentId] ?? null;
}

/**
 * Clear all demo data.
 */
export function clearAgentSealDemoData() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(ASSESSMENTS_KEY);
  window.localStorage.removeItem(ACTIVE_ASSESSMENT_KEY);
  window.localStorage.removeItem(TEST_CASES_KEY);
  window.localStorage.removeItem(RED_TEAM_PROMPTS_KEY);
  window.localStorage.removeItem(EXECUTION_RUNS_KEY);
  window.localStorage.removeItem(RISKSEAL_REPORTS_KEY);
  window.localStorage.removeItem(HUMAN_REVIEW_RECORDS_KEY);
  window.localStorage.removeItem(EVIDENCE_VAULT_REPORTS_KEY);
  window.localStorage.removeItem(RELEASE_CERTIFICATES_KEY);
  window.localStorage.removeItem(LIVESEAL_MONITOR_REPORTS_KEY);
}



