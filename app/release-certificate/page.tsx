"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileJson,
  Fingerprint,
  Gauge,
  GitBranch,
  LockKeyhole,
  Play,
  QrCode,
  Rocket,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Stamp,
  UserCheck,
  Vault,
  type LucideIcon,
} from "lucide-react";
import type {
  AgentAssessment,
  EvidenceVaultReport,
  HumanReviewRecord,
  ReleaseCertificate,
  RiskSealReport,
  TestExecutionRun,
} from "../../lib/agentseal-types";
import { generateReleaseCertificate } from "../../lib/agentseal-release-certificate-generator";
import {
  getActiveAssessment,
  getEvidenceVaultReport,
  getExecutionRun,
  getHumanReviewRecord,
  getReleaseCertificate,
  getRiskSealReport,
  saveReleaseCertificate,
  updateAssessmentStatus,
} from "../../lib/agentseal-storage";

/**
 * Release Certificate Page
 * ------------------------
 * Release Certificate workflow:
 * - Reads Evidence Vault package
 * - Confirms Human Seal Gate approval
 * - Generates final production readiness certificate
 * - Saves certificate to localStorage
 * - Allows JSON export for demo/audit
 */

function formatDate(value: string) {
  return new Date(value).toLocaleString();
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

export default function ReleaseCertificatePage() {
  const [assessment, setAssessment] = useState<AgentAssessment | null>(null);
  const [executionRun, setExecutionRun] = useState<TestExecutionRun | null>(
    null
  );
  const [riskReport, setRiskReport] = useState<RiskSealReport | null>(null);
  const [humanReview, setHumanReview] = useState<HumanReviewRecord | null>(
    null
  );
  const [evidenceReport, setEvidenceReport] =
    useState<EvidenceVaultReport | null>(null);
  const [certificate, setCertificate] = useState<ReleaseCertificate | null>(
    null
  );

  useEffect(() => {
    const activeAssessment = getActiveAssessment();

    setAssessment(activeAssessment);

    if (activeAssessment) {
      setExecutionRun(getExecutionRun(activeAssessment.id));
      setRiskReport(getRiskSealReport(activeAssessment.id));
      setHumanReview(getHumanReviewRecord(activeAssessment.id));
      setEvidenceReport(getEvidenceVaultReport(activeAssessment.id));
      setCertificate(getReleaseCertificate(activeAssessment.id));
    }
  }, []);

  function handleGenerateCertificate() {
    if (
      !assessment ||
      !executionRun ||
      !riskReport ||
      !humanReview ||
      !evidenceReport
    ) {
      return;
    }

    const generatedCertificate = generateReleaseCertificate({
      assessment,
      executionRun,
      riskReport,
      humanReview,
      evidenceReport,
    });

    saveReleaseCertificate(assessment.id, generatedCertificate);

    const updatedAssessment = updateAssessmentStatus(
      assessment.id,
      "Seal Granted",
      "Release Certificate"
    );

    setAssessment(updatedAssessment ?? assessment);
    setCertificate(generatedCertificate);
  }

  function handleExportCertificateJson() {
    if (!certificate) return;

    const blob = new Blob([JSON.stringify(certificate, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${certificate.certificateId}-release-certificate.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  if (!assessment) {
    return (
      <GuardPage
        title="Submit an Agent First"
        description="Release Certificate needs an active assessment before a certificate can be issued."
        href="/assessment"
        buttonText="Start New Assessment"
      />
    );
  }

  if (!executionRun || !riskReport) {
    return (
      <GuardPage
        title="Complete Test Execution and RiskSeal First"
        description="Release Certificate needs execution results and RiskSeal score before production seal generation."
        href="/riskseal"
        buttonText="Open RiskSeal"
      />
    );
  }

  if (!humanReview) {
    return (
      <GuardPage
        title="Complete Human Seal Gate First"
        description="Release Certificate needs reviewer approval before issuing the final production seal."
        href="/human-seal-gate"
        buttonText="Open Human Seal Gate"
      />
    );
  }

  if (!humanReview.approvedForRelease) {
    return (
      <GuardPage
        title="Release Not Approved"
        description="The current human decision is not approved for release. Request remediation or approve the agent before certificate generation."
        href="/human-seal-gate"
        buttonText="Back to Human Seal Gate"
      />
    );
  }

  if (!evidenceReport) {
    return (
      <GuardPage
        title="Build Evidence Vault First"
        description="Release Certificate needs an audit-ready Evidence Vault package before final seal generation."
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
            href="/evidence-vault"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Evidence Vault
          </Link>

          <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-200">
            Release Certificate
          </span>
        </div>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-emerald-300">
              AgentSeal Release Certificate
            </p>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Final Production Seal
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              Generate the final production-readiness certificate from Evidence
              Vault, RiskSeal score, execution evidence, and human approval.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-300/10 text-emerald-300">
              <Award className="h-11 w-11" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-emerald-100">
              Certificate Ready
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Connected agent: <strong>{assessment.agentName}</strong>
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              UiPath Mapping: Final production seal
            </p>
          </div>
        </section>

        <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Risk Score"
            value={`${riskReport.riskScore}/100`}
            note={riskReport.decision}
            icon={Gauge}
            tone="bg-amber-300/10 text-amber-200"
          />

          <MetricCard
            label="Evidence ID"
            value={evidenceReport.evidenceId}
            note={evidenceReport.status}
            icon={Vault}
            tone="bg-cyan-300/10 text-cyan-200"
          />

          <MetricCard
            label="Reviewer"
            value="Approved"
            note={humanReview.reviewerEmail}
            icon={UserCheck}
            tone="bg-emerald-300/10 text-emerald-200"
          />

          <MetricCard
            label="Certificate"
            value={certificate ? "Issued" : "Ready"}
            note={certificate ? certificate.certificateId : "Not generated yet"}
            icon={Stamp}
            tone="bg-blue-300/10 text-blue-200"
          />
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_360px] xl:items-start">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200">
                  <ShieldCheck className="h-9 w-9" />
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
                {certificate
                  ? certificate.summary
                  : "All required approval and evidence data is ready. Generate the final certificate to grant the AgentSeal production seal."}
              </p>

              {certificate && (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5 text-emerald-100">
                    <p className="text-sm opacity-80">Certificate ID</p>
                    <p className="mt-2 text-2xl font-black">
                      {certificate.certificateId}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-5 text-cyan-100">
                    <p className="text-sm opacity-80">Seal Level</p>
                    <p className="mt-2 text-2xl font-black">
                      {certificate.sealLevel}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5 text-amber-100">
                    <p className="text-sm opacity-80">Valid Until</p>
                    <p className="mt-2 text-lg font-black">
                      {formatDate(certificate.validUntil)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5">
              <h3 className="text-xl font-black text-emerald-200">
                Certificate Control
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                This button issues the final AgentSeal production certificate
                using Evidence Vault and human approval records.
              </p>

              <button
                onClick={handleGenerateCertificate}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-5 py-4 font-black text-white"
              >
                Generate Release Certificate
                <Play className="h-5 w-5 fill-white" />
              </button>

              <button
                onClick={handleExportCertificateJson}
                disabled={!certificate}
                className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 font-black text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Export Certificate JSON
                <Download className="h-5 w-5" />
              </button>

              {certificate && (
                <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
                  <div className="flex items-center gap-2 font-black">
                    <CheckCircle2 className="h-5 w-5" />
                    Release certificate saved
                  </div>
                  <p className="mt-2">Record ID: {certificate.id}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {certificate ? (
          <>
            <section className="glass-card mb-6 overflow-hidden rounded-3xl p-6 md:p-8">
              <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
                <div>
                  <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-200">
                    <BadgeCheck className="h-5 w-5" />
                    Seal Granted
                  </div>

                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
                    Official Certificate
                  </p>

                  <h2 className="text-4xl font-black md:text-6xl">
                    {certificate.agentName}
                  </h2>

                  <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
                    {certificate.summary}
                  </p>

                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5">
                      <p className="text-sm text-slate-400">Final Risk</p>
                      <p className="mt-2 text-3xl font-black text-emerald-200">
                        {certificate.finalRiskScore}/100
                      </p>
                    </div>

                    <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-5">
                      <p className="text-sm text-slate-400">Readiness</p>
                      <p className="mt-2 text-3xl font-black text-cyan-200">
                        {certificate.readinessScore}/100
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-300/15 bg-blue-300/[0.05] p-5">
                      <p className="text-sm text-slate-400">Validity</p>
                      <p className="mt-2 text-3xl font-black text-blue-200">
                        {certificate.validityDays} days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-6 text-center">
                  <div className="flex h-44 w-44 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10">
                    <ShieldCheck className="h-24 w-24 text-emerald-200" />
                  </div>

                  <p className="mt-6 text-2xl font-black">
                    {certificate.certificateId}
                  </p>

                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                    Verified Seal ID
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-6 grid gap-5 xl:grid-cols-2">
              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Fingerprint className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">Certificate Metadata</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["Certificate ID", certificate.certificateId],
                    ["Evidence ID", certificate.evidenceId],
                    ["Business Domain", certificate.businessDomain],
                    ["Reviewer", certificate.reviewerEmail],
                    ["Issued At", formatDate(certificate.issuedAt)],
                    ["Valid Until", formatDate(certificate.validUntil)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-bold text-cyan-100">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <QrCode className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">Verification Mock</h2>
                </div>

                <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.04] p-6">
                  <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-3xl border border-cyan-300/20 bg-black/20">
                    <QrCode className="h-24 w-24 text-cyan-200" />
                  </div>

                  <p className="mt-5 text-center text-sm leading-6 text-slate-300">
                    QR payload is generated from certificate ID, evidence ID,
                    agent name, and final risk score.
                  </p>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-slate-400">
                    {certificate.qrPayload}
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-card mb-6 rounded-3xl p-6">
              <div className="mb-6 flex items-center gap-3">
                <LockKeyhole className="h-7 w-7 text-emerald-300" />
                <h2 className="text-2xl font-black">Verified Release Controls</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {certificate.controls.map((control) => (
                  <article
                    key={control.id}
                    className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-300">
                        <FileCheck2 className="h-6 w-6" />
                      </div>

                      <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-300">
                        {control.status}
                      </span>
                    </div>

                    <h3 className="font-black text-white">{control.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {control.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mb-6 grid gap-5 xl:grid-cols-2">
              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <ScrollText className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">Lifecycle Trace</h2>
                </div>

                <div className="space-y-4">
                  {certificate.lifecycle.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="font-black text-white">{item.title}</h3>

                        <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-300">
                          {item.status}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-cyan-200">
                        {item.stage}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {item.description}
                      </p>

                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        {formatDate(item.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center gap-3">
                  <GitBranch className="h-7 w-7 text-cyan-300" />
                  <h2 className="text-2xl font-black">Proof Mapping</h2>
                </div>

                <div className="space-y-4">
                  {certificate.proofMapping.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <p className="text-sm font-black text-cyan-200">
                        {item.proof}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Source: {item.source}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="glass-card mb-6 rounded-3xl p-6">
              <div className="mb-5 flex items-center gap-3">
                <FileJson className="h-7 w-7 text-cyan-300" />
                <h2 className="text-2xl font-black">Downloadable Certificate Artifacts</h2>
              </div>

              <div className="space-y-4">
                {certificate.downloadableArtifacts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
                      <FileJson className="h-6 w-6" />
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
            </section>

            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5 text-sm leading-6 text-emerald-100 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <Rocket className="mt-1 h-5 w-5 shrink-0" />
                <p>
                  AgentSeal has issued the final production seal certificate from the full evidence trail.
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
          <section className="rounded-3xl border border-dashed border-emerald-300/25 bg-emerald-300/[0.03] p-10 text-center">
            <Award className="mx-auto h-14 w-14 text-emerald-300" />
            <h2 className="mt-5 text-2xl font-black">
              No Release Certificate Yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Click â€œGenerate Release Certificateâ€ to issue the final AgentSeal
              production-readiness seal.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}





