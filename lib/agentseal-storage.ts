import type {
  AgentAssessment,
  AssessmentStatus,
  GeneratedTestCase,
  RedTeamPrompt,
  TrustStage,
} from "./agentseal-types";

/**
 * AgentSeal Local Storage Layer
 * -----------------------------
 * Phase 3 still uses localStorage as a frontend-only demo database.
 *
 * Why?
 * - No backend required yet
 * - Easy contest demo
 * - Assessment, Test Forge, Gladiator Engine, and Dashboard can share data
 *
 * Later:
 * This layer can be replaced by real API calls, database, or UiPath workflow.
 */

const ASSESSMENTS_KEY = "agentseal.assessments.v1";
const ACTIVE_ASSESSMENT_KEY = "agentseal.activeAssessmentId.v1";
const TEST_CASES_KEY = "agentseal.generatedTestCases.v1";
const RED_TEAM_PROMPTS_KEY = "agentseal.redTeamPrompts.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Safe JSON reader.
 * If localStorage is empty or broken, we return the fallback value.
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
 * Safe JSON writer.
 */
function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;

  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Returns all submitted assessments.
 * Newest assessment comes first.
 */
export function getAssessments(): AgentAssessment[] {
  return readJson<AgentAssessment[]>(ASSESSMENTS_KEY, []);
}

/**
 * Saves one assessment and makes it active.
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
 * Returns the active assessment.
 * If active ID is missing, it returns the newest assessment.
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
 * Updates assessment workflow status and stage.
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
 * Reads all generated Test Forge test cases.
 * Data is stored by assessment ID.
 */
function getAllGeneratedTests(): Record<string, GeneratedTestCase[]> {
  return readJson<Record<string, GeneratedTestCase[]>>(TEST_CASES_KEY, {});
}

/**
 * Saves test cases for one assessment.
 */
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

/**
 * Returns Test Forge cases for one assessment.
 */
export function getGeneratedTests(assessmentId: string): GeneratedTestCase[] {
  const allGeneratedTests = getAllGeneratedTests();

  return allGeneratedTests[assessmentId] ?? [];
}

/**
 * Reads all Gladiator Engine red-team prompts.
 */
function getAllGeneratedPrompts(): Record<string, RedTeamPrompt[]> {
  return readJson<Record<string, RedTeamPrompt[]>>(RED_TEAM_PROMPTS_KEY, {});
}

/**
 * Saves red-team prompts for one assessment.
 */
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

/**
 * Returns red-team prompts for one assessment.
 */
export function getGeneratedPrompts(assessmentId: string): RedTeamPrompt[] {
  const allGeneratedPrompts = getAllGeneratedPrompts();

  return allGeneratedPrompts[assessmentId] ?? [];
}

/**
 * Demo reset helper.
 * This clears all local Phase 2 and Phase 3 workflow data.
 */
export function clearAgentSealDemoData() {
  if (!isBrowser()) return;

  window.localStorage.removeItem(ASSESSMENTS_KEY);
  window.localStorage.removeItem(ACTIVE_ASSESSMENT_KEY);
  window.localStorage.removeItem(TEST_CASES_KEY);
  window.localStorage.removeItem(RED_TEAM_PROMPTS_KEY);
}



