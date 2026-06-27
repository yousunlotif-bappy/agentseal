import type {
  AgentAssessment,
  AssessmentStatus,
  GeneratedTestCase,
  RedTeamPrompt,
  TrustStage,
} from "./agentseal-types";

/**
 * AgentSeal Storage Layer
 * -----------------------
 * This is a frontend-only demo data layer.
 *
 * We use localStorage because:
 * - No backend is needed yet.
 * - Dashboard, Test Forge, and Gladiator Engine can share workflow data.
 * - It is perfect for early demo/prototype phase.
 *
 * Later:
 * This file can be replaced with real API/database/UiPath calls.
 */

const ASSESSMENTS_KEY = "agentseal.assessments.v1";
const ACTIVE_ASSESSMENT_KEY = "agentseal.activeAssessmentId.v1";
const TEST_CASES_KEY = "agentseal.generatedTestCases.v1";
const RED_TEAM_PROMPTS_KEY = "agentseal.redTeamPrompts.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Safe localStorage JSON reader.
 * If data is missing or corrupted, fallback value is returned.
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
 * Return all submitted assessments.
 * Newest assessment comes first.
 */
export function getAssessments(): AgentAssessment[] {
  return readJson<AgentAssessment[]>(ASSESSMENTS_KEY, []);
}

/**
 * Save one assessment and make it active.
 */
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

/**
 * Return active assessment.
 * If active ID is missing, newest assessment is returned.
 */
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

/**
 * Update workflow status and stage.
 */
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
 * Test Forge storage helpers.
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
 * Gladiator Engine storage helpers.
 */
function getAllGeneratedPrompts(): Record<string, RedTeamPrompt[]> {
  return readJson<Record<string, RedTeamPrompt[]>>(
    RED_TEAM_PROMPTS_KEY,
    {}
  );
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
 * Clear all demo data.
 * Useful when you want to test the full workflow from zero.
 */
export function clearAgentSealDemoData() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(ASSESSMENTS_KEY);
  window.localStorage.removeItem(ACTIVE_ASSESSMENT_KEY);
  window.localStorage.removeItem(TEST_CASES_KEY);
  window.localStorage.removeItem(RED_TEAM_PROMPTS_KEY);
}



