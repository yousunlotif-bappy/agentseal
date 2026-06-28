/**
 * AgentSeal UiPath Proof Client
 * -----------------------------
 *
 * This small client lets the Next.js frontend call the FastAPI UiPath proof API.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_AGENTSEAL_API_URL ?? "http://127.0.0.1:8000";

export type UiPathProofResponse<T> = {
  ok: boolean;
  data: T;
};

export type UiPathTestCase = {
  id: string;
  title: string;
  type: string;
  priority: string;
  expected: string;
  before_fix: string;
  after_fix: string;
};

export type UiPathProofPackage = {
  created_at: string;
  positioning: string;
  modules: {
    agentseal_module: string;
    uipath_role: string;
    proof_status: string;
  }[];
  test_cloud: {
    project: string;
    requirement: string;
    test_set: string;
    execution_model: string;
    test_cases: UiPathTestCase[];
  };
  maestro: {
    process_name: string;
    bpmn_summary: string[];
    gateway_rules: {
      condition: string;
      route: string;
      meaning: string;
    }[];
  };
  action_center: {
    task_name: string;
    task_type: string;
    fields: string[];
    outcomes: {
      button: string;
      output: string;
      route: string;
    }[];
  };
  risk_case: {
    case_type: string;
    trigger: string;
    triggers: string[];
    stages: string[];
  };
  orchestrator: {
    process_name: string;
    base_url: string;
    steps: {
      step: number;
      activity: string;
      method: string;
      endpoint: string;
      save_as?: string;
    }[];
  };
  evidence: {
    honesty_label: string;
    screenshots_to_capture: string[];
    proof_labels: string[];
  };
  latest_backend_state: {
    has_assessment: boolean;
    has_before_execution: boolean;
    has_after_execution: boolean;
    has_risk_score: boolean;
    has_certificate: boolean;
    latest_assessment_id: string | null;
  };
};

export type UiPathSimulatedJob = {
  job_id: string;
  status: string;
  process: string;
  trigger: string;
  proof_mode: string;
  created_at: string;
  steps_completed: string[];
};

async function requestJson<T>(
  path: string,
  options?: RequestInit
): Promise<UiPathProofResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FastAPI request failed: ${response.status}`);
  }

  return response.json();
}

export function getUiPathProofPackage() {
  return requestJson<UiPathProofPackage>("/api/uipath/proof");
}

export function simulateUiPathJob() {
  return requestJson<UiPathSimulatedJob>("/api/uipath/simulate-job", {
    method: "POST",
  });
}


