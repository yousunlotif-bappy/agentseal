"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Download,
  FileJson,
  Gauge,
  GitBranch,
  HeartPulse,
  LockKeyhole,
  Play,
  Radar,
  RefreshCcw,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Siren,
  TimerReset,
  type LucideIcon,
} from "lucide-react";
import type {
  AgentAssessment,
  EvidenceVaultReport,
  LiveSealMonitorReport,
  LiveSealMonitorStatus,
  ReleaseCertificate,
  RiskSealReport,
  TestExecutionRun,
} from "../../lib/agentseal-types";
import { generateLiveSealMonitorReport } from "../../lib/agentseal-liveseal-monitor-generator";
import {
  getActiveAssessment,
  getEvidenceVaultReport,
  getExecutionRun,
  getLiveSealMonitorReport,
  getReleaseCertificate,
  getRiskSealReport,
  saveLiveSealMonitorReport,
  updateAssessmentStatus,
} from "../../lib/agentseal-storage";

/**
 * LiveSeal Monitor Page
 * ---------------------
 * Phase 10:
 * - Reads final Release Certificate
 * - Reads Evidence Vault and RiskSeal context
 * - Simulates live runtime monitoring
 * - Creates health score, drift score, signals, incidents, and action plan
 * - Saves monitoring report in localStorage
 */

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function statusTone(status: LiveSealMonitorStatus) {
  if (status === "Healthy") {
    return "border-emerald-300/25 bg-emerald-300/10 text-emerald-200";
  }

  if (status === "Watch") {
    return "border-amber-300/25 bg-amber-300/10 text-amber-200";
  }

  if (status === "Drift Detected") {
    return "border-orange-300/25 bg-orange-300/10 text-orange-200";
  }

  return "border-rose-300/25 bg-rose-300/10 text-rose-200";
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

export default function LiveSealMonitorPage() {
  const [assessment, setAssessment] = useState<AgentAssessment | null>(null);
  const [certificate, setCertificate] = useState<ReleaseCertificate | null>(
    null
  );
  const [evidenceReport, setEvidenceReport] =
    useState<EvidenceVaultReport | null>(null);
  const [riskReport, setRiskReport] = useState<RiskSealReport | null>(null);
  const [executionRun, setExecutionRun] = useState<TestExecutionRun | null>(
    null
  );
  const [monitorReport, setMonitorReport] =
    useState<LiveSealMonitorReport | null>(null);

  useEffect(() => {
    const activeAssessment = getActiveAssessment();

    setAssessment(activeAssessment);

    if (activeAssessment) {
      setCertificate(getReleaseCertificate(activeAssessment.id));
      setEvidenceReport(getEvidenceVaultReport(activeAssessment.id));
      setRiskReport(getRiskSealReport(activeAssessment.id));
      setExecutionRun(getExecutionRun(activeAssessment.id));
      setMonitorReport(getLiveSealMonitorReport(activeAssessment.id));
    }
  }, []);

  function handleRunLiveSealCheck() {
    if (!assessment || !certificate || !evidenceReport || !riskReport || !executionRun) {
      return;
    }

    const report = generateLiveSealMonitorReport({
      assessment,
      certificate,
      evidenceReport,
      riskReport,
      executionRun,
    });

    saveLiveSealMonitorReport(assessment.id, report);

    const updatedAssessment = updateAssessmentStatus(
      assessment.id,
      "Seal Granted",
      "LiveSeal Monitor"
    );

    setAssessment(updatedAssessment ?? assessment);
    setMonitorReport(report);
  }

  function handleExportMonitorJson() {
    if (!monitorReport) return;

    const blob = new Blob([JSON.stringify(monitorReport, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${monitorReport.monitorId}-live-monitor-report.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  if (!assessment) {
    return (
      <GuardPage
        title="Submit an Agent First"
        description="LiveSeal Monitor needs an active assessment before runtime monitoring can start."
        href="/assessment"
        buttonText="Start New Assessment"
      />
    );
  }

  if (!certificate) {
    return (
      <GuardPage
        title="Generate Release Certificate First"
        description="LiveSeal Monitor starts after the final production certificate is issued."
        href="/release-certificate"
        buttonText="Open Release Certificate"
      />
    );
  }

  if (!evidenceReport || !riskReport || !executionRun) {
    return (
      <GuardPage
        title="Complete Evidence and Risk Workflow First"
        description="LiveSeal Monitor needs Evidence Vault, RiskSeal, and Test Execution data before runtime monitoring."
        href="/evidence-vault"
        buttonText="Open Evidence Vault"
      />
    );
  }

  return (
    <main className="grid-bg min-h-screen px-5 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Link
            href="/release-certificate"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Release Certificate
          </Link>

          <span className="w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
            Phase 10 / LiveSeal Monitor
          </span>
        </div>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              AgentSeal LiveSeal Monitor
            </p>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Runtime Trust Monitoring
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              Monitor the released agent after certificate issuance. Track
              runtime health, policy drift, privacy guardrails, tool safety, and
              incident routing.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-300/10 text-cyan-300">
              <Radar className="h-11 w-11" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-cyan-100">
              Monitor Ready
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Certificate: <strong>{certificate.certificateId}</strong>
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              UiPath Mapping: Scheduled monitoring + Action Center escalation
            </p>
          </div>
        </section>

        <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Live Status"
            value={monitorReport ? monitorReport.status : "Ready"}
            note={monitorReport ? "Monitoring active" : "Not checked yet"}
            icon={Signal}
            tone="bg-cyan-300/10 text-cyan-200"
          />

          <MetricCard
            label="Health Score"
            value={monitorReport ? `${monitorReport.healthScore}/100` : "—"}
            note="Runtime readiness"
            icon={HeartPulse}
            tone="bg-emerald-300/10 text-emerald-200"
          />

          <MetricCard
            label="Drift Score"
            value={monitorReport ? `${monitorReport.driftScore}/100` : "—"}
            note="Policy drift watch"
            icon={RefreshCcw}
            tone="bg-amber-300/10 text-amber-200"
          />

          <MetricCard
            label="Incidents"
            value={monitorReport ? String(monitorReport.incidents.length) : "—"}
            note="Watch and alert items"
            icon={Siren}
            tone="bg-rose-300/10 text-rose-200"
          />
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_360px] xl:items-start">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                  <Cloud className="h-9 w-9" />
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
                {monitorReport
                  ? monitorReport.summary
                  : "Release certificate is active. Run LiveSeal Check to simulate runtime trust monitoring."}
              </p>

              {monitorReport && (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div
                    className={`rounded-2xl border p-5 ${statusTone(
                      monitorReport.status
                    )}`}
                  >
                    <p className="text-sm opacity-80">Monitor Status</p>
                    <p className="mt-2 text-2xl font-black">
                      {monitorReport.status}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-5 text-cyan-100">
                    <p className="text-sm opacity-80">Monitor ID</p>
                    <p className="mt-2 text-xl font-black">
                      {monitorReport.monitorId}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5 text-emerald-100">
                    <p className="text-sm opacity-80">Next Validation</p>
                    <p className="mt-2 text-sm font-black">
                      {formatDate(monitorReport.nextValidationAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-5">
              <h3 className="text-xl font-black text-cyan-200">
                LiveSeal Control
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                This button simulates a live runtime monitoring cycle. Later it
                can connect to UiPath scheduled checks and real telemetry.
              </p>

              <button
                onClick={handleRunLiveSealCheck}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 font-black text-white"
              >
                Run LiveSeal Check
                <Play className="h-5 w-5 fill-white" />
              </button>

              <button
                onClick={handleExportMonitorJson}
                disabled={!monitorReport}
                className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 font-black text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Export Monitor JSON
                <Download className="h-5 w-5" />
              </button>

              {monitorReport && (
                <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
                  <div className="flex items-center gap-2 font-black">
                    <CheckCircle2 className="h-5 w-5" />
                    LiveSeal report saved
                  </div>
                  <p className="mt-2">Report ID: {monitorReport.id}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {monitorReport ? (
          <>
            <section className="glass-card mb-6 rounded-3xl p-6">
              <div className="mb-6 flex items-center gap-3">
                <Gauge className="h-7 w-7 text-cyan-300" />
                <h2 className="text-2xl font-black">Runtime Metrics</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {monitorReport.runtimeMetrics.map((metric) => (
                  <article
                    key={metric.id}
                    className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5"
                  >
                    <p className="text-sm text-slate-400">{metric.label}</p>

                    <p className="mt-2 text-4xl font-black text-white">
                      {metric.value}
                      <span className="ml-1 text-xl text-slate-400">
                        {metric.unit}
                      </span>
                    </p>

                    <span
                      className={
                        metric.status === "Passed"
                          ? "mt-4 inline-flex rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-300"
                          : "mt-4 inline-flex rounded-full bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-300"
                      }
                    >
                      {metric.status}
                    </span>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {metric.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="glass-card mb-6 rounded-3xl p-6">
              <div className="mb-6 flex items-center gap-3">
                <Activity className="h-7 w-7 text-cyan-300" />
                <h2 className="text-2xl font-black">Live Trust Signals</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {monitorReport.signals.map((signal) => (
                  <article
                    key={signal.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                        {signal.status === "Passed" ? (
                          <ShieldCheck className="h-6 w-6" />
                        ) : (
                          <AlertTriangle className="h-6 w-6" />
                        )}
                      </div>

                      <span
                        className={
                          signal.status === "Passed"
                            ? "rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-300"
                            : signal.status === "Watch"
                              ? "rounded-full bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-300"
                              : "rounded-full bg-rose-300/10 px-3 py-1 text-xs font-black text-rose-300"
                        }
                      >
                        {signal.status}
                      </span>
                    </div>

                    <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                      {signal.category}
                    </p>

                    <h3 className="mt-1 text-xl font-black text-white">
                      {signal.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {signal.description}
                    </p>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="mb-1 text-sm font-black text-slate-200">
                        Evidence
                      </p>
                      <p className="text-sm leading-6 text-slate-400">
                        {signal.evidence}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mb-6 grid gap-5 xl:grid-cols-2">
              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <BellRing className="h-7 w-7 text-amber-300" />
                  <h2 className="text-2xl font-black">Incident Watch</h2>
                </div>

                {monitorReport.incidents.length > 0 ? (
                  <div className="space-y-4">
                    {monitorReport.incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="font-black text-white">
                            {incident.title}
                          </h3>

                          <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-300">
                            {incident.status}
                          </span>
                        </div>

                        <p className="text-sm leading-6 text-slate-400">
                          {incident.description}
                        </p>

                        <p className="mt-3 text-sm font-black text-amber-200">
                          Recommendation
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          {incident.recommendation}
                        </p>

                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          Linked Evidence: {incident.linkedEvidence}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5 text-emerald-100">
                    No active incidents. LiveSeal status is healthy.
                  </div>
                )}
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <TimerReset className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">Monitoring Timeline</h2>
                </div>

                <div className="space-y-4">
                  {monitorReport.timeline.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="font-black text-white">{item.title}</h3>

                        <span
                          className={
                            item.status === "Completed"
                              ? "rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-300"
                              : item.status === "Watching"
                                ? "rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-300"
                                : "rounded-full bg-rose-300/10 px-3 py-1 text-xs font-black text-rose-300"
                          }
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-slate-400">
                        {item.description}
                      </p>

                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-6 grid gap-5 xl:grid-cols-2">
              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <LockKeyhole className="h-7 w-7 text-emerald-300" />
                  <h2 className="text-2xl font-black">Action Plan</h2>
                </div>

                <div className="space-y-4">
                  {monitorReport.actionPlan.map((action, index) => (
                    <div
                      key={action}
                      className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5"
                    >
                      <p className="text-sm font-black text-emerald-200">
                        Action {index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <GitBranch className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">UiPath Monitor Mapping</h2>
                </div>

                <div className="space-y-4">
                  {monitorReport.uiPathMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <p className="text-sm font-black text-cyan-200">
                        {mapping.monitorItem}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {mapping.uiPathRole}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="glass-card mb-6 rounded-3xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <FileJson className="h-7 w-7 text-cyan-300" />
                <h2 className="text-2xl font-black">
                  Downloadable Monitor Artifacts
                </h2>
              </div>

              <div className="space-y-4">
                {monitorReport.downloadableArtifacts.map((artifact) => (
                  <div
                    key={artifact.id}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                      <FileJson className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-white">
                        {artifact.filename}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {artifact.description}
                      </p>
                    </div>

                    <Download className="h-5 w-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5 text-sm leading-6 text-emerald-100 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Rocket className="mt-1 h-5 w-5 shrink-0" />
                <p>
                  Phase 10 completed. LiveSeal Monitor now watches the released
                  certificate, runtime health, drift signals, incidents, and
                  scheduled re-validation readiness.
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-center font-black text-white"
              >
                Back to Dashboard
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <section className="rounded-3xl border border-dashed border-cyan-300/25 bg-cyan-300/[0.03] p-10 text-center">
            <Radar className="mx-auto h-14 w-14 text-cyan-300" />
            <h2 className="mt-5 text-2xl font-black">
              No LiveSeal Check Yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Click “Run LiveSeal Check” to simulate post-release monitoring
              for runtime health, policy drift, incidents, and trust signals.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}



