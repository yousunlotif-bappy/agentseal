import type {
  AgentAssessment,
  HumanReviewDecision,
  HumanReviewRecord,
  HumanReviewRoute,
  RiskSealReport,
} from "./agentseal-types";

/**
 * AgentSeal Human Review Generator
 * --------------------------------
 * Phase 7 frontend-only human approval record creator.
 *
 * It converts:
 * - RiskSeal report
 * - Reviewer decision
 * - Reviewer notes
 *
 * into:
 * - saved Human Seal Gate record
 * - final route
 * - review checklist
 *
 * Later this can be replaced by UiPath Action Center / Human Task approval.
 */

function nowIso() {
  return new Date().toISOString();
}

function createReviewId() {
  return `HR-${Date.now()}`;
}

function getRoute(decision: HumanReviewDecision): HumanReviewRoute {
  if (decision === "Approved") return "Evidence Vault";
  if (decision === "Rejected") return "Remediation Required";
  return "RiskSeal Recheck";
}

function getSummary(
  assessment: AgentAssessment,
  report: RiskSealReport,
  decision: HumanReviewDecision
) {
  if (decision === "Approved") {
    return `${assessment.agentName} was approved by human reviewer after RiskSeal score ${report.riskScore}/100. Evidence should now be prepared for audit vault.`;
  }

  if (decision === "Rejected") {
    return `${assessment.agentName} was rejected by human reviewer. Production release is blocked until remediation is complete.`;
  }

  return `${assessment.agentName} needs remediation. Reviewer requested changes before the agent can continue to release.`;
}

/**
 * Creates a practical review checklist from RiskSeal gates.
 */
function createChecklist(report: RiskSealReport, notes: string) {
  const gateChecklist = report.gates.map((gate) => ({
    id: `HSG-${gate.id}`,
    label: gate.label,
    status: gate.status === "Passed" ? "Checked" as const : "Attention Required" as const,
    note: gate.description,
  }));

  return [
    ...gateChecklist,
    {
      id: "HSG-NOTES",
      label: "Reviewer notes captured",
      status: notes.trim().length > 0 ? "Checked" as const : "Attention Required" as const,
      note:
        notes.trim().length > 0
          ? "Reviewer notes were captured for audit evidence."
          : "Reviewer notes are required for final decision.",
    },
    {
      id: "HSG-ROUTE",
      label: "Decision route selected",
      status: "Checked" as const,
      note: `RiskSeal route was ${report.route}. Human decision will create the final next step.`,
    },
  ];
}

/**
 * Main creator function used by /human-seal-gate page.
 */
export function createHumanReviewRecord({
  assessment,
  report,
  decision,
  notes,
}: {
  assessment: AgentAssessment;
  report: RiskSealReport;
  decision: HumanReviewDecision;
  notes: string;
}): HumanReviewRecord {
  return {
    id: createReviewId(),
    assessmentId: assessment.id,
    riskSealReportId: report.id,
    createdAt: nowIso(),

    reviewerEmail: assessment.reviewerEmail,
    reviewerName: "Assigned Reviewer",

    decision,
    status: "Completed",
    route: getRoute(decision),

    approvedForRelease: decision === "Approved",
    linkedRiskDecision: report.decision,
    linkedRiskScore: report.riskScore,

    notes,
    summary: getSummary(assessment, report, decision),
    checklist: createChecklist(report, notes),
  };
}




