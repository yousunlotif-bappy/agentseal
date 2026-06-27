"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Archive,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Cloud,
  Database,
  Download,
  FileArchive,
  FileCheck2,
  FileJson,
  FileText,
  Fingerprint,
  GitBranch,
  History,
  LockKeyhole,
  Play,
  ScrollText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Swords,
  TestTube2,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type {
  AgentAssessment,
  EvidenceTone,
  EvidenceVaultReport,
  GeneratedTestCase,
  HumanReviewRecord,
  RedTeamPrompt,
  RiskSealReport,
  TestExecutionRun,
} from "../../lib/agentseal-types";
import { generateEvidenceVaultReport } from "../../lib/agentseal-evidence-vault-generator";
import {
  getActiveAssessment,
  getEvidenceVaultReport,
  getExecutionRun,
  getGeneratedPrompts,
  getGeneratedTests,
  getHumanReviewRecord,
  getRiskSealReport,
  saveEvidenceVaultReport,
  updateAssessmentStatus,
} from "../../lib/agentseal-storage";

/**
 * Evidence Vault Page
 * -------------------
 * Phase 8:
 * - Reads all previous workflow evidence
 * - Builds an audit-ready evidence package
 * - Shows artifacts, report structure, timeline, downloadable metadata
 * - Exports evidence as JSON for demo
 * - Prepares the workflow for Release Certificate
 */

function toneClass(tone: EvidenceTone) {
  if (tone === "green") {
    return "border-emerald-300/20 bg-emerald-300/10 text-emerald-200";
  }

  if (tone === "rose") {
    return "border-rose-300/20 bg-rose-300/10 text-rose-200";
  }

  if (tone === "amber") {
    return "border-amber-300/20 bg-amber-300/10 text-amber-200";
  }

  if (tone === "blue") {
    return "border-blue-300/20 bg-blue-300/10 text-blue-200";
  }

  return "border-cyan-300/20 bg-cyan-300/10 text-cyan-200";
}

function getArtifactIcon(type: string): LucideIcon {
  if (type === "Assessment") return ClipboardCheck;
  if (type === "Test Cases") return TestTube2;
  if (type === "Red-Team Prompts") return Swords;
  if (type === "Execution Results") return Cloud;
  if (type === "RiskSeal") return ShieldCheck;
  if (type === "Human Review") return UserCheck;
  return Archive;
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

export default function EvidenceVaultPage() {
  const [assessment, setAssessment] = useState<AgentAssessment | null>(null);
  const [tests, setTests] = useState<GeneratedTestCase[]>([]);
  const [prompts, setPrompts] = useState<RedTeamPrompt[]>([]);
  const [executionRun, setExecutionRun] = useState<TestExecutionRun | null>(
    null
  );
  const [riskReport, setRiskReport] = useState<RiskSealReport | null>(null);
  const [humanReview, setHumanReview] = useState<HumanReviewRecord | null>(
    null
  );
  const [evidenceReport, setEvidenceReport] =
    useState<EvidenceVaultReport | null>(null);

  useEffect(() => {
    const activeAssessment = getActiveAssessment();

    setAssessment(activeAssessment);

    if (activeAssessment) {
      setTests(getGeneratedTests(activeAssessment.id));
      setPrompts(getGeneratedPrompts(activeAssessment.id));
      setExecutionRun(getExecutionRun(activeAssessment.id));
      setRiskReport(getRiskSealReport(activeAssessment.id));
      setHumanReview(getHumanReviewRecord(activeAssessment.id));
      setEvidenceReport(getEvidenceVaultReport(activeAssessment.id));
    }
  }, []);

  function handleBuildEvidenceVault() {
    if (!assessment || !executionRun || !riskReport || !humanReview) return;

    const report = generateEvidenceVaultReport({
      assessment,
      tests,
      prompts,
      executionRun,
      riskReport,
      review: humanReview,
    });

    saveEvidenceVaultReport(assessment.id, report);

    const updatedAssessment = updateAssessmentStatus(
      assessment.id,
      humanReview.approvedForRelease ? "Seal Granted" : assessment.status,
      "Evidence Vault"
    );

    setAssessment(updatedAssessment ?? assessment);
    setEvidenceReport(report);
  }

  function handleExportEvidenceJson() {
    if (!evidenceReport || !assessment || !executionRun || !riskReport || !humanReview) {
      return;
    }

    const exportPayload = {
      evidenceReport,
      assessment,
      tests,
      prompts,
      executionRun,
      riskReport,
      humanReview,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${evidenceReport.evidenceId}-agentseal-evidence-pack.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  if (!assessment) {
    return (
      <GuardPage
        title="Submit an Agent First"
        description="Evidence Vault needs an active assessment before it can package audit evidence."
        href="/assessment"
        buttonText="Start New Assessment"
      />
    );
  }

  if (!executionRun) {
    return (
      <GuardPage
        title="Run Test Execution First"
        description="Evidence Vault needs execution results and evidence logs before packaging."
        href="/test-execution"
        buttonText="Open Test Execution"
      />
    );
  }

  if (!riskReport) {
    return (
      <GuardPage
        title="Calculate RiskSeal First"
        description="Evidence Vault needs RiskSeal score, gates, and recommendations."
        href="/riskseal"
        buttonText="Open RiskSeal"
      />
    );
  }

  if (!humanReview) {
    return (
      <GuardPage
        title="Complete Human Seal Gate First"
        description="Evidence Vault needs reviewer approval, rejection, or remediation decision before audit packaging."
        href="/human-seal-gate"
        buttonText="Open Human Seal Gate"
      />
    );
  }

  return (
    <main className="grid-bg min-h-screen px-5 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Link
            href="/human-seal-gate"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Human Seal Gate
          </Link>

          <span className="w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
            Phase 8 / Evidence Vault
          </span>
        </div>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              AgentSeal Evidence Vault
            </p>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Audit-Ready Evidence Pack
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              Package assessment data, generated tests, red-team prompts,
              execution results, RiskSeal report, and human review into one
              traceable audit vault.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-300/10 text-cyan-300">
              <Archive className="h-11 w-11" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-cyan-100">
              Vault Ready
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Connected agent: <strong>{assessment.agentName}</strong>
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              UiPath Mapping: Evidence Vault + Certificate Workflow
            </p>
          </div>
        </section>

        <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Evidence Items"
            value={evidenceReport ? String(evidenceReport.totalEvidenceItems) : "—"}
            note={evidenceReport ? evidenceReport.status : "Not packaged yet"}
            icon={FileArchive}
            tone="bg-cyan-300/10 text-cyan-200"
          />

          <MetricCard
            label="Tests"
            value={String(tests.length)}
            note="From Test Forge"
            icon={TestTube2}
            tone="bg-blue-300/10 text-blue-200"
          />

          <MetricCard
            label="Execution"
            value={String(executionRun.totalChecks)}
            note="Results archived"
            icon={Cloud}
            tone="bg-emerald-300/10 text-emerald-200"
          />

          <MetricCard
            label="Risk Score"
            value={`${riskReport.riskScore}/100`}
            note={riskReport.decision}
            icon={ShieldCheck}
            tone="bg-amber-300/10 text-amber-200"
          />
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_380px] xl:items-start">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                  <Archive className="h-9 w-9" />
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
                {evidenceReport
                  ? evidenceReport.summary
                  : "Evidence sources are ready. Build the Evidence Vault Pack to create an audit-ready package for release certificate or remediation."}
              </p>

              {evidenceReport && (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-5 text-cyan-100">
                    <p className="text-sm opacity-80">Evidence ID</p>
                    <p className="mt-2 text-2xl font-black">
                      {evidenceReport.evidenceId}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5 text-emerald-100">
                    <p className="text-sm opacity-80">Vault Status</p>
                    <p className="mt-2 text-2xl font-black">
                      {evidenceReport.status}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5 text-amber-100">
                    <p className="text-sm opacity-80">Readiness</p>
                    <p className="mt-2 text-2xl font-black">
                      {evidenceReport.readinessScore}/100
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-5">
              <h3 className="text-xl font-black text-cyan-200">
                Evidence Vault Control
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                This button packages all workflow records into a single
                audit-ready evidence vault.
              </p>

              <button
                onClick={handleBuildEvidenceVault}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 font-black text-white"
              >
                Build Evidence Vault Pack
                <Play className="h-5 w-5 fill-white" />
              </button>

              <button
                onClick={handleExportEvidenceJson}
                disabled={!evidenceReport}
                className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 font-black text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Export Evidence JSON
                <Download className="h-5 w-5" />
              </button>

              {evidenceReport && (
                <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
                  <div className="flex items-center gap-2 font-black">
                    <CheckCircle2 className="h-5 w-5" />
                    Evidence Vault report saved
                  </div>
                  <p className="mt-2">Report ID: {evidenceReport.id}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {evidenceReport ? (
          <>
            <section className="glass-card mb-6 rounded-3xl p-6">
              <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-black">Evidence Package</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Every artifact required for traceability, governance, and
                    certificate readiness.
                  </p>
                </div>

                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-200">
                  Complete audit trail
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {evidenceReport.artifacts.map((artifact) => {
                  const Icon = getArtifactIcon(artifact.type);

                  return (
                    <article
                      key={artifact.id}
                      className={`rounded-2xl border p-5 ${toneClass(
                        artifact.tone
                      )}`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                          <Icon className="h-6 w-6" />
                        </div>

                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                          {artifact.status}
                        </span>
                      </div>

                      <p className="text-xs font-black uppercase tracking-[0.18em] opacity-80">
                        {artifact.type}
                      </p>

                      <h3 className="mt-1 text-xl font-black text-white">
                        {artifact.name}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {artifact.description}
                      </p>

                      <div className="mt-4 rounded-xl bg-black/20 px-4 py-3 text-sm font-bold text-white">
                        Count: {artifact.count}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mb-6 grid gap-5 xl:grid-cols-2">
              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <ScrollText className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">Report Structure</h2>
                </div>

                <div className="space-y-4">
                  {evidenceReport.reportSections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="font-black text-white">
                          {section.title}
                        </h3>

                        <span
                          className={
                            section.included
                              ? "rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-300"
                              : "rounded-full bg-rose-300/10 px-3 py-1 text-xs font-black text-rose-300"
                          }
                        >
                          {section.included ? "Included" : "Missing"}
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-slate-400">
                        {section.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <History className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">Evidence Timeline</h2>
                </div>

                <div className="space-y-4">
                  {evidenceReport.timeline.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="font-black text-white">{item.title}</h3>

                        <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-300">
                          {item.status}
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-slate-400">
                        {item.description}
                      </p>

                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mb-6 grid gap-5 xl:grid-cols-2">
              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <FileJson className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">Downloadable Artifacts</h2>
                </div>

                <div className="space-y-4">
                  {evidenceReport.downloadableArtifacts.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                        {item.kind === "Report" ? (
                          <FileText className="h-6 w-6" />
                        ) : (
                          <FileJson className="h-6 w-6" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-white">
                          {item.filename}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {item.description}
                        </p>
                      </div>

                      <Download className="h-5 w-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <GitBranch className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">UiPath Evidence Mapping</h2>
                </div>

                <div className="space-y-4">
                  {evidenceReport.uiPathMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <p className="text-sm font-black text-cyan-200">
                        {mapping.evidence}
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
                <Fingerprint className="h-7 w-7 text-cyan-300" />
                <h2 className="text-2xl font-black">Final Evidence Summary</h2>
              </div>

              <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] p-5 text-sm leading-7 text-slate-200">
                {evidenceReport.summary}
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-100 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Shield className="mt-1 h-5 w-5 shrink-0" />
                <p>
                  Phase 8 completed. Release Certificate will use this evidence
                  vault package to generate the final production-readiness seal.
                </p>
              </div>

              <Link
                href={
                  humanReview.approvedForRelease
                    ? "/release-certificate"
                    : "/human-seal-gate"
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-center font-black text-white"
              >
                {humanReview.approvedForRelease
                  ? "Continue to Release Certificate"
                  : "Back to Human Review"}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <section className="rounded-3xl border border-dashed border-cyan-300/25 bg-cyan-300/[0.03] p-10 text-center">
            <Archive className="mx-auto h-14 w-14 text-cyan-300" />
            <h2 className="mt-5 text-2xl font-black">
              No Evidence Vault Pack Yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Click “Build Evidence Vault Pack” to package all workflow records
              into an audit-ready evidence vault.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}



