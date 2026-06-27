import type {
  AgentAssessment,
  EvidenceVaultReport,
  LiveSealIncident,
  LiveSealMonitorReport,
  LiveSealMonitorStatus,
  LiveSealSignal,
  ReleaseCertificate,
  RiskSealReport,
  TestExecutionRun,
} from "./agentseal-types";

/**
 * AgentSeal LiveSeal Monitor Generator
 * ------------------------------------
 * Phase 10 frontend-only runtime monitoring engine.
 *
 * It reads:
 * - Release Certificate
 * - Evidence Vault report
 * - RiskSeal report
 * - Test Execution run
 * - Assessment endpoint and policies
 *
 * Then creates:
 * - Live health score
 * - Drift score
 * - Runtime metrics
 * - Monitoring signals
 * - Incident/watch items
 * - Live monitoring timeline
 *
 * Later this can connect to:
 * - UiPath Orchestrator jobs
 * - UiPath Test Cloud scheduled runs
 * - API uptime monitors
 * - Logs and telemetry
 * - Policy drift detectors
 * - Alerting workflows
 */

function nowIso() {
  return new Date().toISOString();
}

function addHours(date: Date, hours: number) {
  const copy = new Date(date);

  copy.setHours(copy.getHours() + hours);

  return copy;
}

function createMonitorReportId() {
  return `LSM-RUN-${Date.now()}`;
}

function createMonitorId(certificate: ReleaseCertificate) {
  return certificate.certificateId.replace("AGC", "LSM");
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Simple status rule for demo:
 * - Failed execution creates Watch
 * - Very high risk creates Drift/Incident
 * - Otherwise Healthy
 */
function getMonitorStatus({
  riskScore,
  failed,
  warnings,
}: {
  riskScore: number;
  failed: number;
  warnings: number;
}): LiveSealMonitorStatus {
  if (riskScore >= 75 || failed >= 3) return "Incident";
  if (riskScore >= 55 || failed >= 2) return "Drift Detected";
  if (riskScore >= 30 || failed >= 1 || warnings >= 1) return "Watch";

  return "Healthy";
}

function createSignals({
  assessment,
  riskReport,
  executionRun,
  certificate,
}: {
  assessment: AgentAssessment;
  riskReport: RiskSealReport;
  executionRun: TestExecutionRun;
  certificate: ReleaseCertificate;
}): LiveSealSignal[] {
  const hasFailure = executionRun.failed > 0;
  const hasWarning = executionRun.warnings > 0;
  const riskNeedsWatch = riskReport.riskScore > 30;

  return [
    {
      id: "SIG-001",
      title: "Certificate validity",
      category: "Release Control",
      status: "Passed",
      severity: "Low",
      description: "The production seal certificate is active and traceable.",
      evidence: `Certificate ${certificate.certificateId} is valid until ${new Date(
        certificate.validUntil
      ).toLocaleDateString()}.`,
    },
    {
      id: "SIG-002",
      title: "Endpoint heartbeat",
      category: "Runtime Health",
      status: "Passed",
      severity: "Low",
      description:
        "The agent endpoint is reachable in this demo monitoring simulation.",
      evidence: `Endpoint configured: ${assessment.agentEndpoint}.`,
    },
    {
      id: "SIG-003",
      title: "PII protection watch",
      category: "Privacy Guard",
      status: hasFailure ? "Watch" : "Passed",
      severity: hasFailure ? "High" : "Low",
      description:
        "LiveSeal watches whether the released agent continues to protect sensitive data.",
      evidence: hasFailure
        ? `${executionRun.failed} historical failed check exists in execution evidence.`
        : "No failed PII evidence found in the execution run.",
    },
    {
      id: "SIG-004",
      title: "Policy drift signal",
      category: "Policy Drift",
      status: riskNeedsWatch ? "Watch" : "Passed",
      severity: riskNeedsWatch ? "Medium" : "Low",
      description:
        "LiveSeal compares runtime behavior against approved business rules and policies.",
      evidence: `RiskSeal score is ${riskReport.riskScore}/100. Monitoring remains active.`,
    },
    {
      id: "SIG-005",
      title: "Tool boundary control",
      category: "Tool Safety",
      status: executionRun.blocked > 0 ? "Passed" : "Watch",
      severity: executionRun.blocked > 0 ? "Low" : "Medium",
      description:
        "LiveSeal checks whether forbidden tools and unsafe actions remain blocked.",
      evidence: `${executionRun.blocked} adversarial prompts were safely blocked during validation.`,
    },
    {
      id: "SIG-006",
      title: "Human escalation continuity",
      category: "Human Oversight",
      status: hasWarning ? "Watch" : "Passed",
      severity: hasWarning ? "Medium" : "Low",
      description:
        "LiveSeal ensures risky cases still route to human review after release.",
      evidence: hasWarning
        ? `${executionRun.warnings} warning outcomes should remain monitored.`
        : "Human approval and escalation rules are linked to release certificate.",
    },
  ];
}

function createIncidents({
  signals,
  certificate,
}: {
  signals: LiveSealSignal[];
  certificate: ReleaseCertificate;
}): LiveSealIncident[] {
  return signals
    .filter((signal) => signal.status === "Watch" || signal.status === "Failed")
    .map((signal, index) => ({
      id: `INC-${String(index + 1).padStart(3, "0")}`,
      title: signal.title,
      severity: signal.severity,
      status: signal.status === "Failed" ? "Open" : "Monitoring",
      description: signal.description,
      recommendation:
        signal.status === "Failed"
          ? "Create a remediation workflow and re-run validation before continuing production usage."
          : "Keep this signal under monitoring and schedule the next validation run.",
      linkedEvidence: `${certificate.evidenceId} / ${signal.id}`,
    }));
}

export function generateLiveSealMonitorReport({
  assessment,
  certificate,
  evidenceReport,
  riskReport,
  executionRun,
}: {
  assessment: AgentAssessment;
  certificate: ReleaseCertificate;
  evidenceReport: EvidenceVaultReport;
  riskReport: RiskSealReport;
  executionRun: TestExecutionRun;
}): LiveSealMonitorReport {
  const createdAt = nowIso();

  const signals = createSignals({
    assessment,
    riskReport,
    executionRun,
    certificate,
  });

  const incidents = createIncidents({
    signals,
    certificate,
  });

  const watchCount = signals.filter((signal) => signal.status === "Watch")
    .length;

  const failedSignalCount = signals.filter((signal) => signal.status === "Failed")
    .length;

  const healthScore = clampScore(
    100 - riskReport.riskScore - watchCount * 5 - failedSignalCount * 15
  );

  const driftScore = clampScore(
    riskReport.riskScore + watchCount * 8 + executionRun.warnings * 4
  );

  const status = getMonitorStatus({
    riskScore: riskReport.riskScore,
    failed: executionRun.failed,
    warnings: executionRun.warnings,
  });

  const monitorId = createMonitorId(certificate);

  return {
    id: createMonitorReportId(),
    assessmentId: assessment.id,
    certificateId: certificate.certificateId,
    evidenceVaultReportId: evidenceReport.id,
    createdAt,

    agentName: assessment.agentName,
    businessDomain: assessment.businessDomain,
    endpoint: assessment.agentEndpoint,

    monitorId,
    status,
    healthScore,
    driftScore,
    uptimePercent: 99.7,

    finalRiskScore: riskReport.riskScore,
    certificateValidUntil: certificate.validUntil,
    nextValidationAt: addHours(new Date(), 24).toISOString(),

    summary:
      status === "Healthy"
        ? `${assessment.agentName} is healthy in live monitoring. Certificate and evidence remain active.`
        : `${assessment.agentName} is live with monitoring status "${status}". ${incidents.length} watch item(s) should be tracked after release.`,

    runtimeMetrics: [
      {
        id: "MET-001",
        label: "Runtime health",
        value: healthScore,
        unit: "/100",
        status: healthScore >= 80 ? "Passed" : "Watch",
        description: "Overall live readiness after release.",
      },
      {
        id: "MET-002",
        label: "Policy drift",
        value: driftScore,
        unit: "/100",
        status: driftScore <= 30 ? "Passed" : "Watch",
        description: "Higher score means stronger runtime drift watch.",
      },
      {
        id: "MET-003",
        label: "Uptime",
        value: 99.7,
        unit: "%",
        status: "Passed",
        description: "Simulated endpoint uptime for demo monitoring.",
      },
      {
        id: "MET-004",
        label: "Blocked attacks",
        value: executionRun.blocked,
        unit: "blocked",
        status: executionRun.blocked > 0 ? "Passed" : "Watch",
        description: "Adversarial requests that were safely blocked.",
      },
    ],

    signals,
    incidents,

    timeline: [
      {
        id: "LSM-TL-001",
        title: "Certificate loaded",
        description: `Certificate ${certificate.certificateId} was loaded for live monitoring.`,
        timestamp: certificate.issuedAt,
        status: "Completed",
      },
      {
        id: "LSM-TL-002",
        title: "Evidence package linked",
        description: `Evidence Vault package ${evidenceReport.evidenceId} is linked.`,
        timestamp: evidenceReport.createdAt,
        status: "Completed",
      },
      {
        id: "LSM-TL-003",
        title: "Runtime checks simulated",
        description:
          "LiveSeal simulated endpoint, policy, privacy, and tool-boundary checks.",
        timestamp: createdAt,
        status: "Completed",
      },
      {
        id: "LSM-TL-004",
        title: "Watch signals evaluated",
        description: `${watchCount} watch signal(s) and ${failedSignalCount} failed signal(s) found.`,
        timestamp: createdAt,
        status: incidents.length > 0 ? "Watching" : "Completed",
      },
      {
        id: "LSM-TL-005",
        title: "Next validation scheduled",
        description:
          "Next validation run is scheduled for the next monitoring cycle.",
        timestamp: addHours(new Date(), 24).toISOString(),
        status: "Watching",
      },
    ],

    actionPlan:
      incidents.length > 0
        ? [
            "Keep LiveSeal monitoring active for this released agent.",
            "Review watch signals during the next governance checkpoint.",
            "Re-run Test Execution if policy, endpoint, or tool configuration changes.",
            "Escalate to RiskSeal if any watch signal becomes a failed signal.",
          ]
        : [
            "Continue normal production monitoring.",
            "Schedule periodic validation every 24 hours.",
            "Keep Evidence Vault and certificate records attached.",
          ],

    uiPathMappings: [
      {
        id: "LSM-MAP-001",
        monitorItem: "Endpoint heartbeat",
        uiPathRole: "UiPath Orchestrator scheduled health check",
      },
      {
        id: "LSM-MAP-002",
        monitorItem: "Policy drift",
        uiPathRole: "Maestro BPMN policy recheck workflow",
      },
      {
        id: "LSM-MAP-003",
        monitorItem: "Red-team regression",
        uiPathRole: "UiPath Test Cloud scheduled validation",
      },
      {
        id: "LSM-MAP-004",
        monitorItem: "Incident routing",
        uiPathRole: "UiPath Action Center human escalation",
      },
      {
        id: "LSM-MAP-005",
        monitorItem: "Evidence update",
        uiPathRole: "Evidence Vault append-only audit log",
      },
    ],

    downloadableArtifacts: [
      {
        id: "LSM-DL-001",
        filename: `${monitorId}-live-monitor-report.json`,
        description: "LiveSeal monitoring report JSON export",
      },
      {
        id: "LSM-DL-002",
        filename: `${monitorId}-runtime-signals.json`,
        description: "Runtime signals and drift watch evidence",
      },
      {
        id: "LSM-DL-003",
        filename: `${monitorId}-incident-watch.json`,
        description: "Incident and watch list export",
      },
    ],
  };
}


