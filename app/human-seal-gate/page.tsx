"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GitBranch,
  LockKeyhole,
  MessageSquareText,
  Play,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UserCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type {
  AgentAssessment,
  AssessmentStatus,
  HumanReviewDecision,
  HumanReviewRecord,
  RiskSealReport,
} from "../../lib/agentseal-types";
import { createHumanReviewRecord } from "../../lib/agentseal-human-review-generator";
import {
  getActiveAssessment,
  getHumanReviewRecord,
  getRiskSealReport,
  saveHumanReviewRecord,
  updateAssessmentStatus,
} from "../../lib/agentseal-storage";

/**
 * Human Seal Gate Page
 * --------------------
 * Human Seal Gate workflow:
 * - Reads RiskSeal report
 * - Shows risk score, decision, route, gates, recommendations
 * - Allows reviewer to approve, reject, or request remediation
 * - Saves final human review record
 * - Updates assessment status for the next workflow stage
 */

function decisionColor(decision: HumanReviewDecision) {
  if (decision === "Approved") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-200";
  }

  if (decision === "Rejected") {
    return "border-rose-300/25 bg-rose-300/10 text-rose-200";
  }

  return "border-amber-300/25 bg-amber-300/10 text-amber-200";
}

function getDecisionIcon(decision: HumanReviewDecision) {
  if (decision === "Approved") return ShieldCheck;
  if (decision === "Rejected") return ShieldX;
  return RefreshCcw;
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${tone}`}
        >
          <Icon className="h-9 w-9" />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-300">{label}</p>
          <p className="mt-2 text-4xl font-black text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-400">{note}</p>
        </div>
      </div>
    </div>
  );
}

function GuardPage({
  title,
  description,
  href,
  buttonText,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <main className="grid-bg min-h-screen px-6 py-10 text-white">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <section className="glass-card mx-auto mt-20 max-w-4xl rounded-3xl p-8 md:p-10">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
          <ShieldAlert className="h-11 w-11" />
        </div>

        <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-amber-300">
          Workflow Guard
        </p>

        <h1 className="text-4xl font-black tracking-tight md:text-6xl">
          {title}
        </h1>

        <p className="mt-5 text-lg leading-8 text-slate-300">{description}</p>

        <Link
          href={href}
          className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-black text-white"
        >
          {buttonText}
        </Link>
      </section>
    </main>
  );
}

export default function HumanSealGatePage() {
  const [assessment, setAssessment] = useState<AgentAssessment | null>(null);
  const [riskReport, setRiskReport] = useState<RiskSealReport | null>(null);
  const [reviewRecord, setReviewRecord] =
    useState<HumanReviewRecord | null>(null);

  const [reviewNotes, setReviewNotes] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const activeAssessment = getActiveAssessment();

    setAssessment(activeAssessment);

    if (activeAssessment) {
      const savedRiskReport = getRiskSealReport(activeAssessment.id);
      const savedReviewRecord = getHumanReviewRecord(activeAssessment.id);

      setRiskReport(savedRiskReport);
      setReviewRecord(savedReviewRecord);

      if (savedReviewRecord) {
        setReviewNotes(savedReviewRecord.notes);
      }
    }
  }, []);

  function handleHumanDecision(decision: HumanReviewDecision) {
    if (!assessment || !riskReport) return;

    if (reviewNotes.trim().length < 10) {
      setValidationError(
        "Please write at least 10 characters of reviewer notes before submitting a decision."
      );
      return;
    }

    const record = createHumanReviewRecord({
      assessment,
      report: riskReport,
      decision,
      notes: reviewNotes.trim(),
    });

    saveHumanReviewRecord(assessment.id, record);

    /**
     * Human decision changes the workflow status.
     */
    const nextStatus: AssessmentStatus =
      decision === "Approved"
        ? "Seal Granted"
        : decision === "Rejected"
          ? "Blocked"
          : "Under Review";

    const updatedAssessment = updateAssessmentStatus(
      assessment.id,
      nextStatus,
      "Human Seal Gate"
    );

    setAssessment(updatedAssessment ?? assessment);
    setReviewRecord(record);
    setValidationError("");
  }

  if (!assessment) {
    return (
      <GuardPage
        title="Submit an Agent First"
        description="Human Seal Gate needs an active assessment before a reviewer can approve or reject release."
        href="/assessment"
        buttonText="Start New Assessment"
      />
    );
  }

  if (!riskReport) {
    return (
      <GuardPage
        title="Calculate RiskSeal First"
        description="Human Seal Gate needs a RiskSeal report before reviewer approval can happen."
        href="/riskseal"
        buttonText="Open RiskSeal"
      />
    );
  }

  const reviewDecision = reviewRecord?.decision;
  const DecisionIcon = reviewDecision
    ? getDecisionIcon(reviewDecision)
    : UserCheck;

  return (
    <main className="grid-bg min-h-screen px-5 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Link
            href="/riskseal"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to RiskSeal
          </Link>

          <span className="w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
            Human Seal Gate
          </span>
        </div>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Human Seal Gate
            </p>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Reviewer Approval Workflow
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              Review RiskSeal decision, evidence, gates, and recommendations.
              Then approve release, reject release, or request remediation.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-300/10 text-cyan-300">
              <UserCheck className="h-11 w-11" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-cyan-100">
              Reviewer Task Ready
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Reviewer: <strong>{assessment.reviewerEmail}</strong>
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              UiPath Mapping: Human Task approval
            </p>
          </div>
        </section>

        <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Risk Score"
            value={`${riskReport.riskScore}/100`}
            note={riskReport.decision}
            icon={AlertTriangle}
            tone="bg-amber-300/10 text-amber-200"
          />

          <MetricCard
            label="Risk Route"
            value={riskReport.route}
            note="From RiskSeal"
            icon={GitBranch}
            tone="bg-cyan-300/10 text-cyan-200"
          />

          <MetricCard
            label="Failed"
            value={String(riskReport.failed)}
            note="Evidence items"
            icon={XCircle}
            tone="bg-rose-300/10 text-rose-200"
          />

          <MetricCard
            label="Blocked"
            value={String(riskReport.blocked)}
            note="Safe refusals"
            icon={LockKeyhole}
            tone="bg-emerald-300/10 text-emerald-200"
          />
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_380px] xl:items-start">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                  <DecisionIcon className="h-9 w-9" />
                </div>

                <div>
                  <h2 className="text-3xl font-black">
                    {assessment.agentName}
                  </h2>
                  <p className="mt-1 text-slate-400">
                    Status: {assessment.status} Â· Stage: {assessment.trustStage}
                  </p>
                </div>
              </div>

              <p className="max-w-4xl leading-7 text-slate-300">
                {reviewRecord
                  ? reviewRecord.summary
                  : riskReport.summary}
              </p>

              {reviewRecord && (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div
                    className={`rounded-2xl border p-5 ${decisionColor(
                      reviewRecord.decision
                    )}`}
                  >
                    <p className="text-sm opacity-80">Human Decision</p>
                    <p className="mt-2 text-2xl font-black">
                      {reviewRecord.decision}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-5 text-cyan-100">
                    <p className="text-sm opacity-80">Next Route</p>
                    <p className="mt-2 text-2xl font-black">
                      {reviewRecord.route}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5 text-emerald-100">
                    <p className="text-sm opacity-80">Approved?</p>
                    <p className="mt-2 text-2xl font-black">
                      {reviewRecord.approvedForRelease ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-5">
              <h3 className="text-xl font-black text-cyan-200">
                Human Decision Control
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                Add reviewer notes, then choose the final decision. This
                simulates a UiPath human task approval.
              </p>

              <label className="mt-5 block">
                <span className="mb-2 flex items-center gap-2 text-sm font-black text-slate-200">
                  <MessageSquareText className="h-4 w-4 text-cyan-300" />
                  Reviewer Notes
                </span>

                <textarea
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  placeholder="Example: Reviewed RiskSeal evidence. One failed PII extraction scenario needs policy owner review before production release."
                  rows={6}
                  className="focus-glow min-h-36 w-full rounded-2xl border border-cyan-300/10 bg-[#031124]/70 px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-600"
                />
              </label>

              {validationError && (
                <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
                  {validationError}
                </div>
              )}

              <div className="mt-5 grid gap-3">
                <button
                  onClick={() => handleHumanDecision("Approved")}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-5 py-4 font-black text-white"
                >
                  Approve Seal
                  <ShieldCheck className="h-5 w-5" />
                </button>

                <button
                  onClick={() => handleHumanDecision("Remediation Requested")}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-600 to-cyan-500 px-5 py-4 font-black text-white"
                >
                  Request Remediation
                  <RefreshCcw className="h-5 w-5" />
                </button>

                <button
                  onClick={() => handleHumanDecision("Rejected")}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-5 py-4 font-black text-white"
                >
                  Reject Release
                  <ShieldX className="h-5 w-5" />
                </button>
              </div>

              {reviewRecord && (
                <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
                  <div className="flex items-center gap-2 font-black">
                    <CheckCircle2 className="h-5 w-5" />
                    Human review saved
                  </div>
                  <p className="mt-2">Review ID: {reviewRecord.id}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-2">
          <div className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardCheck className="h-7 w-7 text-cyan-300" />
              <h2 className="text-2xl font-black">RiskSeal Gates</h2>
            </div>

            <div className="space-y-4">
              {riskReport.gates.map((gate) => (
                <div
                  key={gate.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-black text-white">{gate.label}</h3>

                    <span
                      className={
                        gate.status === "Passed"
                          ? "rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-300"
                          : gate.status === "Review"
                            ? "rounded-full bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-300"
                            : "rounded-full bg-rose-300/10 px-3 py-1 text-xs font-black text-rose-300"
                      }
                    >
                      {gate.status}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-slate-400">
                    {gate.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <BadgeCheck className="h-7 w-7 text-emerald-300" />
              <h2 className="text-2xl font-black">Reviewer Checklist</h2>
            </div>

            {reviewRecord ? (
              <div className="space-y-4">
                {reviewRecord.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="font-black text-white">{item.label}</h3>

                      <span
                        className={
                          item.status === "Checked"
                            ? "rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-300"
                            : "rounded-full bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-300"
                        }
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-sm leading-6 text-slate-400">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-cyan-300/25 bg-cyan-300/[0.04] p-6 text-slate-300">
                Reviewer checklist will appear after a human decision is saved.
              </div>
            )}
          </div>
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <FileText className="h-7 w-7 text-cyan-300" />
            <h2 className="text-2xl font-black">RiskSeal Recommendations</h2>
          </div>

          <div className="space-y-4">
            {riskReport.recommendations.map((recommendation, index) => (
              <div
                key={recommendation}
                className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5"
              >
                <p className="text-sm font-black text-emerald-200">
                  Recommendation {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {reviewRecord ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-100 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
              <p>
                Human review record is saved. Continue to Evidence Vault to package assessment, tests, prompts, execution results, RiskSeal report, and approval evidence.
              </p>
            </div>

            <Link
              href={
                reviewRecord.decision === "Approved"
                  ? "/evidence-vault"
                  : "/riskseal"
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-center font-black text-white"
            >
              {reviewRecord.decision === "Approved"
                ? "Continue to Evidence Vault"
                : "Back to RiskSeal"}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <section className="rounded-3xl border border-dashed border-cyan-300/25 bg-cyan-300/[0.03] p-10 text-center">
            <UserCheck className="mx-auto h-14 w-14 text-cyan-300" />
            <h2 className="mt-5 text-2xl font-black">
              No Human Decision Yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Add reviewer notes and choose Approve, Reject, or Request
              Remediation to complete Human Seal Gate.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}





