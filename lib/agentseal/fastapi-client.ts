const API_BASE_URL =
  process.env.NEXT_PUBLIC_AGENTSEAL_API_URL ?? "http://127.0.0.1:8000";

/**
 * Small frontend client for the real FastAPI backend.
 * This is optional for now.
 */

async function requestJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export async function createFastApiDemoAssessment() {
  return requestJson(`${API_BASE_URL}/api/demo/refund-assessment`, {
    method: "POST",
  });
}

export async function runFastApiFullFlow() {
  return requestJson(`${API_BASE_URL}/api/demo/run-full-flow`, {
    method: "POST",
  });
}

export async function runAssessmentStep(
  assessmentId: string,
  step: string,
  mode?: "before" | "after"
) {
  const query = mode ? `?mode=${mode}` : "";

  return requestJson(
    `${API_BASE_URL}/api/assessments/${assessmentId}/${step}${query}`,
    {
      method: "POST",
    }
  );
}

export async function getFastApiReport(assessmentId: string) {
  return requestJson(
    `${API_BASE_URL}/api/assessments/${assessmentId}/report?mode=after`
  );
}

export async function getFastApiCertificate(assessmentId: string) {
  return requestJson(
    `${API_BASE_URL}/api/assessments/${assessmentId}/certificate?mode=after`
  );
}


