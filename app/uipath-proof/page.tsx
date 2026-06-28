"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Database,
  Download,
  FileJson,
  Gauge,
  GitBranch,
  Play,
  Server,
  ShieldCheck,
  UserCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  getUiPathProofPackage,
  simulateUiPathJob,
  type UiPathProofPackage,
  type UiPathSimulatedJob,
} from "../../lib/agentseal/uipath-proof-client";

/**
 * UiPath Integration Proof Page
 * -----------------------------
 *
 * This page shows how AgentSeal maps to:
 * - UiPath Test Cloud
 * - Maestro BPMN
 * - Action Center / Human Task
 * - Orchestrator/API Workflow
 * - Evidence and Devpost proof
 */

function downloadJsonFile(fileName: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

function toneClass(tone: "cyan" | "emerald" | "amber" | "rose" | "blue") {
  const tones = {
    cyan: "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200",
    emerald: "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200",
    amber: "border-amber-300/20 bg-amber-300/[0.06] text-amber-200",
    rose: "border-rose-300/20 bg-rose-300/[0.06] text-rose-200",
    blue: "border-blue-300/20 bg-blue-300/[0.06] text-blue-200",
  };

  return tones[tone];
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  tone: "cyan" | "emerald" | "amber" | "rose" | "blue";
}) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${toneClass(
            tone
          )}`}
        >
          <Icon className="h-8 w-8" />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-300">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-400">{note}</p>
        </div>
      </div>
    </div>
  );
}

export default function UiPathProofPage() {
  const [proof, setProof] = useState<UiPathProofPackage | null>(null);
  const [job, setJob] = useState<UiPathSimulatedJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProof() {
    setLoading(true);
    setError("");

    try {
      const response = await getUiPathProofPackage();
      setProof(response.data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not connect to FastAPI backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function runSimulatedJob() {
    setJobLoading(true);
    setError("");

    try {
      const response = await simulateUiPathJob();
      setJob(response.data);
      await loadProof();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not simulate UiPath job."
      );
    } finally {
      setJobLoading(false);
    }
  }

  useEffect(() => {
    loadProof();
  }, []);

  const connectedCount = useMemo(() => {
    if (!proof) return 0;

    const state = proof.latest_backend_state;

    return [
      state.has_assessment,
      state.has_before_execution,
      state.has_after_execution,
      state.has_risk_score,
      state.has_certificate,
    ].filter(Boolean).length;
  }, [proof]);

  const totalTestCases = proof?.test_cloud.test_cases.length ?? 0;
  const mappedModules = proof?.modules.length ?? 0;
  const orchestratorSteps = proof?.orchestrator.steps.length ?? 0;

  return (
    <main className="grid-bg min-h-screen px-5 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div className="flex items-start gap-4">
            <Link
              href="/"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/15"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.32em] text-cyan-300">
                AgentSeal UiPath Integration Proof
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
                UiPath Release Gate Mapping
              </h1>

              <p className="mt-3 max-w-4xl text-base leading-7 text-slate-300">
                Show how AgentSeal connects to UiPath Test Cloud, Maestro BPMN,
                Action Center Human Task, Orchestrator API workflows, Risk Case,
                and audit evidence.
              </p>
            </div>
          </div>

          <button
            onClick={runSimulatedJob}
            className="flex w-fit items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-black text-white"
          >
            <Play className="h-5 w-5" />
            {jobLoading ? "Running Proof..." : "Run UiPath Proof Check"}
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-300/25 bg-rose-300/[0.08] p-5 text-rose-100">
            <div className="flex items-start gap-3">
              <XCircle className="mt-1 h-5 w-5 shrink-0" />
              <div>
                <p className="font-black">FastAPI connection problem</p>
                <p className="mt-1 text-sm leading-6 text-rose-100/80">
                  {error}
                </p>
                <p className="mt-2 text-sm leading-6 text-rose-100/80">
                  Make sure backend is running at http://127.0.0.1:8000
                </p>
              </div>
            </div>
          </div>
        )}

        <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Server}
            label="Proof API"
            value={proof ? "Online" : loading ? "Loading" : "Offline"}
            note="/api/uipath/proof"
            tone={proof ? "emerald" : "amber"}
          />

          <MetricCard
            icon={Database}
            label="Backend State"
            value={`${connectedCount}/5`}
            note="Assessment, runs, risk, certificate"
            tone={connectedCount >= 4 ? "emerald" : "amber"}
          />

          <MetricCard
            icon={ShieldCheck}
            label="Mapped Modules"
            value={String(mappedModules)}
            note="AgentSeal → UiPath"
            tone="cyan"
          />

          <MetricCard
            icon={Gauge}
            label="Test Cases"
            value={String(totalTestCases)}
            note="Test Cloud mapping"
            tone="blue"
          />
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">Integration Positioning</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Use this exact message in demo and Devpost.
              </p>
            </div>

            <span className="w-fit rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-200">
              Honest proof layer
            </span>
          </div>

          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-5 text-sm leading-7 text-cyan-50">
            {proof?.positioning ??
              "Load proof data from FastAPI to show UiPath positioning."}
          </div>

          {job && (
            <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                <div>
                  <p className="font-black text-emerald-100">
                    Simulated UiPath job completed
                  </p>
                  <p className="mt-1 text-sm text-emerald-100/80">
                    Job ID: {job.job_id}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <GitBranch className="h-7 w-7 text-cyan-300" />
            <h2 className="text-2xl font-black">AgentSeal → UiPath Map</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {proof?.modules.map((item) => (
              <div
                key={item.agentseal_module}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
                  {item.agentseal_module}
                </p>

                <h3 className="mt-3 text-xl font-black text-white">
                  {item.uipath_role}
                </h3>

                <p className="mt-3 w-fit rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1 text-sm font-bold text-emerald-200">
                  {item.proof_status}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">UiPath Test Cloud Mapping</h2>
              <p className="mt-2 text-sm text-slate-400">
                Test Set: {proof?.test_cloud.test_set ?? "Loading..."}
              </p>
            </div>

            <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
              {totalTestCases} mapped tests
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-white/[0.06] text-slate-300">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Before</th>
                  <th className="p-4">After</th>
                </tr>
              </thead>

              <tbody>
                {proof?.test_cloud.test_cases.map((test) => (
                  <tr key={test.id} className="border-t border-white/10">
                    <td className="p-4 font-mono text-cyan-200">{test.id}</td>
                    <td className="p-4 font-bold text-white">{test.title}</td>
                    <td className="p-4 text-slate-300">{test.type}</td>
                    <td className="p-4 text-slate-300">{test.priority}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          test.before_fix === "Fail"
                            ? "bg-rose-300/10 text-rose-200"
                            : "bg-emerald-300/10 text-emerald-200"
                        }`}
                      >
                        {test.before_fix}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          test.after_fix === "Minor issue"
                            ? "bg-amber-300/10 text-amber-200"
                            : "bg-emerald-300/10 text-emerald-200"
                        }`}
                      >
                        {test.after_fix}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <Activity className="h-7 w-7 text-cyan-300" />
              <h2 className="text-2xl font-black">Maestro Gateway</h2>
            </div>

            <div className="grid gap-4">
              {proof?.maestro.gateway_rules.map((rule) => (
                <div
                  key={rule.condition}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="font-mono text-sm text-cyan-200">
                    {rule.condition}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-white">
                    {rule.route}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {rule.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <UserCheck className="h-7 w-7 text-cyan-300" />
              <h2 className="text-2xl font-black">Human Task Outcomes</h2>
            </div>

            <div className="grid gap-4">
              {proof?.action_center.outcomes.map((outcome) => (
                <div
                  key={outcome.output}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <h3 className="text-xl font-black text-white">
                    {outcome.button}
                  </h3>
                  <p className="mt-2 text-sm text-cyan-200">
                    Output: {outcome.output}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Route: {outcome.route}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card mt-6 rounded-3xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <Server className="h-7 w-7 text-cyan-300" />
            <h2 className="text-2xl font-black">Orchestrator API Workflow</h2>
          </div>

          <div className="grid gap-4">
            {proof?.orchestrator.steps.map((step) => (
              <div
                key={`${step.step}-${step.endpoint}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-black text-cyan-200">
                      Step {step.step} · {step.activity}
                    </p>
                    <p className="mt-2 font-mono text-sm leading-6 text-slate-300">
                      {step.method} {step.endpoint}
                    </p>
                  </div>

                  <span className="w-fit rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-black text-slate-300">
                    {step.save_as ? `Save: ${step.save_as}` : "Mapped"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm text-slate-400">
            Total workflow steps: {orchestratorSteps}
          </p>
        </section>

        <section className="glass-card mt-6 rounded-3xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-amber-300" />
            <h2 className="text-2xl font-black">Maestro Risk Case Model</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5">
              <h3 className="text-xl font-black text-white">
                {proof?.risk_case.case_type}
              </h3>
              <p className="mt-2 text-sm leading-6 text-amber-100/80">
                Trigger: {proof?.risk_case.trigger}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.05] p-5">
              <h3 className="text-xl font-black text-white">Case Stages</h3>
              <p className="mt-2 text-sm leading-6 text-cyan-100/80">
                {proof?.risk_case.stages.join(" → ")}
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card mt-6 rounded-3xl p-6">
          <div className="mb-6 flex items-center gap-3">
            <FileJson className="h-7 w-7 text-cyan-300" />
            <h2 className="text-2xl font-black">Export Proof Artifacts</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              disabled={!proof}
              onClick={() =>
                proof && downloadJsonFile("agentseal-uipath-proof.json", proof)
              }
              className="flex items-center justify-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] px-5 py-4 font-black text-cyan-100 disabled:opacity-40"
            >
              Export Full Proof JSON
              <Download className="h-5 w-5" />
            </button>

            <button
              disabled={!job}
              onClick={() =>
                job && downloadJsonFile("agentseal-uipath-simulated-job.json", job)
              }
              className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.08] px-5 py-4 font-black text-emerald-100 disabled:opacity-40"
            >
              Export Simulated Job JSON
              <Download className="h-5 w-5" />
            </button>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5 text-sm leading-6 text-emerald-100 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0" />
            <p>
              UiPath Integration Proof completed. AgentSeal now has a clear
              proof layer for Test Cloud, Maestro, Human Task, Risk Case,
              Orchestrator, and evidence mapping.
            </p>
          </div>

          <Link
            href="/backend-health"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-center font-black text-white"
          >
            Backend Health
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}


