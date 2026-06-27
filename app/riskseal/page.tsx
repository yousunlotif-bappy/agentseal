"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Bug,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gauge,
  GitBranch,
  LockKeyhole,
  Play,
  Scale,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UserCheck,
  XCircle,
} from "lucide-react";
import type {
  AgentAssessment,
  RiskSealDecision,
  RiskSealReport,
  TestExecutionRun,
} from "../../lib/agentseal-types";
import { generateRiskSealReport } from "../../lib/agentseal-riskseal-generator";
import {
  getActiveAssessment,
  getExecutionRun,
  getRiskSealReport,
  saveRiskSealReport,
  updateAssessmentStatus,
} from "../../lib/agentseal-storage";

/**
 * RiskSeal Page
 * -------------
 * Phase 6:
 * - Reads Test Execution run
 * - Calculates explainable risk score
 * - Creates release decision
 * - Creates human review / block / release routing
 * - Saves RiskSeal report for Human Seal Gate
 */

function decisionTone(decision: RiskSealDecision) {
  if (decision === "Seal Ready") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-200";
  }

  if (decision === "Human Review") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-200";
  }

  return "border-rose-300/25 bg-rose-300/10 text-rose-200";
}

function decisionIcon(decision: RiskSealDecision) {
  if (decision === "Seal Ready") return ShieldCheck;
  if (decision === "Human Review") return UserCheck;
  return ShieldX;
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
  icon: typeof Gauge;
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

export default function RiskSealPage() {
  const [assessment, setAssessment] = useState<AgentAssessment | null>(null);
  const [executionRun, setExecutionRun] = useState<TestExecutionRun | null>(
    null
  );
  const [riskReport, setRiskReport] = useState<RiskSealReport | null>(null);

  useEffect(() => {
    const activeAssessment = getActiveAssessment();

    setAssessment(activeAssessment);

    if (activeAssessment) {
      const savedExecutionRun = getExecutionRun(activeAssessment.id);
      const savedRiskReport = getRiskSealReport(activeAssessment.id);

      setExecutionRun(savedExecutionRun);
      setRiskReport(savedRiskReport);
    }
  }, []);

  function handleCalculateRiskSeal() {
    if (!assessment || !executionRun) return;

    const report = generateRiskSealReport(assessment, executionRun);

    saveRiskSealReport(assessment.id, report);

    const nextAssessmentStatus =
      report.decision === "Blocked"
        ? "Blocked"
        : report.decision === "Human Review"
          ? "Under Review"
          : "Risk Scored";

    const updatedAssessment = updateAssessmentStatus(
      assessment.id,
      nextAssessmentStatus,
      "RiskSeal"
    );

    setAssessment(updatedAssessment ?? assessment);
    setRiskReport(report);
  }

  if (!assessment) {
    return (
      <GuardPage
        title="Submit an Agent First"
        description="RiskSeal needs an active assessment before it can calculate release risk."
        href="/assessment"
        buttonText="Start New Assessment"
      />
    );
  }

  if (!executionRun) {
    return (
      <GuardPage
        title="Run Test Execution First"
        description="RiskSeal needs execution results, failed evidence, warnings, and blocked red-team prompts before it can calculate risk."
        href="/test-execution"
        buttonText="Open Test Execution"
      />
    );
  }

  const DecisionIcon = riskReport
    ? decisionIcon(riskReport.decision)
    : Gauge;

  return (
    <main className="grid-bg min-h-screen px-5 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Link
            href="/test-execution"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Test Execution
          </Link>

          <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-200">
            Phase 6 / RiskSeal
          </span>
        </div>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-emerald-300">
              RiskSeal Engine
            </p>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Risk Score & Release Decision
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              Convert execution results into an explainable risk score, release
              decision, and human review routing.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-300/10 text-emerald-300">
              <Scale className="h-11 w-11" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-emerald-100">
              RiskSeal Ready
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Connected agent: <strong>{assessment.agentName}</strong>
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {assessment.businessDomain}
            </p>
          </div>
        </section>

        <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Executed Checks"
            value={String(executionRun.totalChecks)}
            note="From Test Execution"
            icon={FileText}
            tone="bg-cyan-300/10 text-cyan-200"
          />

          <MetricCard
            label="Failed Results"
            value={String(executionRun.failed)}
            note="Needs scoring"
            icon={XCircle}
            tone="bg-rose-300/10 text-rose-200"
          />

          <MetricCard
            label="Blocked Attacks"
            value={String(executionRun.blocked)}
            note="Safe refusals"
            icon={LockKeyhole}
            tone="bg-emerald-300/10 text-emerald-200"
          />

          <MetricCard
            label="Risk Score"
            value={riskReport ? `${riskReport.riskScore}/100` : "—"}
            note={riskReport ? riskReport.decision : "Not calculated yet"}
            icon={Gauge}
            tone="bg-amber-300/10 text-amber-200"
          />
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_360px] xl:items-start">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200">
                  <DecisionIcon className="h-9 w-9" />
                </div>

                <div>
                  <h2 className="text-3xl font-black">
                    {assessment.agentName}
                  </h2>
                  <p className="mt-1 text-slate-400">
                    Status: {assessment.status} · Stage: {assessment.trustStage}
                  </p>
                </div>
              </div>

              <p className="max-w-4xl leading-7 text-slate-300">
                {riskReport
                  ? riskReport.summary
                  : "RiskSeal has execution evidence ready. Calculate the score to create release decision and routing."}
              </p>

              {riskReport && (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div
                    className={`rounded-2xl border p-5 ${decisionTone(
                      riskReport.decision
                    )}`}
                  >
                    <p className="text-sm opacity-80">Decision</p>
                    <p className="mt-2 text-2xl font-black">
                      {riskReport.decision}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-5 text-cyan-100">
                    <p className="text-sm opacity-80">Route</p>
                    <p className="mt-2 text-2xl font-black">
                      {riskReport.route}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5 text-amber-100">
                    <p className="text-sm opacity-80">Risk Score</p>
                    <p className="mt-2 text-2xl font-black">
                      {riskReport.riskScore}/100
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5">
              <h3 className="text-xl font-black text-emerald-200">
                RiskSeal Control
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                This button calculates a transparent score from failed results,
                warnings, and execution evidence.
              </p>

              <button
                onClick={handleCalculateRiskSeal}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-5 py-4 font-black text-white"
              >
                Calculate RiskSeal Score
                <Play className="h-5 w-5 fill-white" />
              </button>

              {riskReport && (
                <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
                  <div className="flex items-center gap-2 font-black">
                    <CheckCircle2 className="h-5 w-5" />
                    RiskSeal report saved
                  </div>
                  <p className="mt-2">Report ID: {riskReport.id}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {riskReport ? (
          <>
            <section className="glass-card mb-6 rounded-3xl p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-black">Risk Decision Gateway</h2>
                <p className="mt-2 text-sm text-slate-400">
                  RiskSeal uses a simple explainable decision rule for demo.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["0–30", "Seal Ready", "Low-risk agent can proceed."],
                  ["31–60", "Human Review", "Reviewer approval required."],
                  ["61–100", "Blocked", "Remediation required before release."],
                ].map(([range, title, desc]) => (
                  <div
                    key={range}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <p className="text-sm text-slate-400">Score {range}</p>
                    <p className="mt-2 text-2xl font-black text-white">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card mb-6 rounded-3xl p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-black">
                    Risk Contribution Breakdown
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    These failed or warning results created the final risk score.
                  </p>
                </div>

                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-black text-amber-200">
                  Total: {riskReport.riskScore}/100
                </span>
              </div>

              {riskReport.contributions.length > 0 ? (
                <div className="space-y-4">
                  {riskReport.contributions.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5"
                    >
                      <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                        <div>
                          <p className="font-mono text-sm text-cyan-300">
                            {item.id} · {item.sourceId}
                          </p>
                          <h3 className="mt-1 text-xl font-black text-white">
                            {item.label}
                          </h3>
                        </div>

                        <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-sm font-black text-amber-200">
                          +{item.points} pts
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-slate-400">
                        {item.reason}
                      </p>

                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="mb-1 text-sm font-black text-slate-200">
                          Evidence
                        </p>
                        <p className="text-sm leading-6 text-slate-400">
                          {item.evidence}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-5 text-emerald-100">
                  No failed or warning contribution found. The agent is low risk.
                </div>
              )}
            </section>

            <section className="mb-6 grid gap-5 xl:grid-cols-2">
              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <GitBranch className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">Release Gates</h2>
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
                  <h2 className="text-2xl font-black">Recommendations</h2>
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
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-100 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
                <p>
                  Phase 6 completed. Human Seal Gate will use this decision,
                  route, gates, recommendations, and evidence to approve or
                  reject release.
                </p>
              </div>

              <Link
                href="/human-seal-gate"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-center font-black text-white"
              >
                Continue to Human Seal Gate
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <section className="rounded-3xl border border-dashed border-emerald-300/25 bg-emerald-300/[0.03] p-10 text-center">
            <Scale className="mx-auto h-14 w-14 text-emerald-300" />
            <h2 className="mt-5 text-2xl font-black">
              No RiskSeal Report Yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Click “Calculate RiskSeal Score” to create the final risk score,
              release decision, and human review routing.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}



