"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bot,
  Bug,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  FileText,
  Gauge,
  ListChecks,
  Play,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Terminal,
  XCircle,
} from "lucide-react";
import type {
  AgentAssessment,
  ExecutionResult,
  ExecutionResultStatus,
  GeneratedTestCase,
  RedTeamPrompt,
  TestExecutionRun,
} from "../../lib/agentseal-types";
import { generateExecutionRun } from "../../lib/agentseal-execution-generator";
import {
  getActiveAssessment,
  getExecutionRun,
  getGeneratedPrompts,
  getGeneratedTests,
  saveExecutionRun,
  updateAssessmentStatus,
} from "../../lib/agentseal-storage";

/**
 * Test Execution Page
 * -------------------
 * Test Execution workflow:
 * - Reads active assessment
 * - Reads Test Forge generated tests
 * - Reads Gladiator Engine red-team prompts
 * - Simulates execution results
 * - Creates pass/fail/blocked evidence
 * - Creates execution timeline
 * - Saves execution run for RiskSeal workflow
 */

function StatusBadge({ status }: { status: ExecutionResultStatus }) {
  if (status === "Failed") {
    return (
      <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-3 py-1 text-xs font-black text-rose-300">
        Failed
      </span>
    );
  }

  if (status === "Blocked") {
    return (
      <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-300">
        Blocked
      </span>
    );
  }

  if (status === "Warning") {
    return (
      <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-300">
        Warning
      </span>
    );
  }

  return (
    <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-300">
      Passed
    </span>
  );
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
  icon: typeof Activity;
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
  buttonText,
  href,
}: {
  title: string;
  description: string;
  buttonText: string;
  href: string;
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

export default function TestExecutionPage() {
  const [assessment, setAssessment] = useState<AgentAssessment | null>(null);
  const [testCases, setTestCases] = useState<GeneratedTestCase[]>([]);
  const [redTeamPrompts, setRedTeamPrompts] = useState<RedTeamPrompt[]>([]);
  const [executionRun, setExecutionRun] = useState<TestExecutionRun | null>(
    null
  );

  useEffect(() => {
    const activeAssessment = getActiveAssessment();

    setAssessment(activeAssessment);

    if (activeAssessment) {
      const savedTests = getGeneratedTests(activeAssessment.id);
      const savedPrompts = getGeneratedPrompts(activeAssessment.id);
      const savedExecutionRun = getExecutionRun(activeAssessment.id);

      setTestCases(savedTests);
      setRedTeamPrompts(savedPrompts);
      setExecutionRun(savedExecutionRun);
    }
  }, []);

  function handleRunExecutionSuite() {
    if (!assessment) return;

    const run = generateExecutionRun(assessment, testCases, redTeamPrompts);

    saveExecutionRun(assessment.id, run);

    const updatedAssessment = updateAssessmentStatus(
      assessment.id,
      "Execution Complete",
      "Test Execution"
    );

    setAssessment(updatedAssessment ?? assessment);
    setExecutionRun(run);
  }

  if (!assessment) {
    return (
      <GuardPage
        title="Submit an Agent First"
        description="Test Execution needs an active assessment before it can run validation."
        buttonText="Start New Assessment"
        href="/assessment"
      />
    );
  }

  if (testCases.length === 0) {
    return (
      <GuardPage
        title="Generate Test Cases First"
        description="Test Execution needs Test Forge cases before it can run pass/fail validation."
        buttonText="Open Test Forge"
        href="/test-forge"
      />
    );
  }

  if (redTeamPrompts.length === 0) {
    return (
      <GuardPage
        title="Generate Red-Team Prompts First"
        description="Test Execution needs Gladiator Engine prompts before it can validate adversarial behavior."
        buttonText="Open Gladiator Engine"
        href="/gladiator-engine"
      />
    );
  }

  const failedResults =
    executionRun?.results.filter((result) => result.status === "Failed") ?? [];

  return (
    <main className="grid-bg min-h-screen px-5 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Link
            href="/gladiator-engine"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Gladiator Engine
          </Link>

          <span className="w-fit rounded-full border border-blue-300/30 bg-blue-300/10 px-4 py-2 text-sm font-bold text-blue-200">
            Test Execution
          </span>
        </div>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-blue-300">
              AgentSeal Test Execution
            </p>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Run Validation Suite
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              Execute generated tests and red-team prompts, then create
              pass/fail results, evidence logs, and execution timeline for
              RiskSeal.
            </p>
          </div>

          <div className="rounded-3xl border border-blue-300/20 bg-blue-300/[0.05] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-300/10 text-blue-300">
              <Activity className="h-11 w-11" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-blue-100">
              Execution Ready
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
            label="Source Tests"
            value={String(testCases.length)}
            note="From Test Forge"
            icon={ListChecks}
            tone="bg-cyan-300/10 text-cyan-200"
          />

          <MetricCard
            label="Red-Team Prompts"
            value={String(redTeamPrompts.length)}
            note="From Gladiator Engine"
            icon={Swords}
            tone="bg-rose-300/10 text-rose-200"
          />

          <MetricCard
            label="Executed Checks"
            value={executionRun ? String(executionRun.totalChecks) : "0"}
            note={executionRun ? executionRun.status : "Waiting to run"}
            icon={Terminal}
            tone="bg-blue-300/10 text-blue-200"
          />

          <MetricCard
            label="Risk Score"
            value={executionRun ? `${executionRun.riskScore}/100` : "â€”"}
            note={executionRun ? "Ready for RiskSeal" : "Not calculated yet"}
            icon={Gauge}
            tone="bg-emerald-300/10 text-emerald-200"
          />
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">
            <div>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                  <Bot className="h-9 w-9" />
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
                {assessment.agentDescription}
              </p>

              {executionRun && (
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-slate-400">Passed</p>
                    <p className="mt-2 text-4xl font-black text-cyan-300">
                      {executionRun.passed}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-slate-400">Blocked</p>
                    <p className="mt-2 text-4xl font-black text-emerald-300">
                      {executionRun.blocked}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-slate-400">Failed</p>
                    <p className="mt-2 text-4xl font-black text-rose-300">
                      {executionRun.failed}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm text-slate-400">Warnings</p>
                    <p className="mt-2 text-4xl font-black text-amber-300">
                      {executionRun.warnings}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-blue-300/20 bg-blue-300/[0.05] p-5">
              <h3 className="text-xl font-black text-blue-200">
                Execution Control
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                This button simulates an execution run. Later, this will connect
                to UiPath Test Cloud and real agent endpoints.
              </p>

              <button
                onClick={handleRunExecutionSuite}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 font-black text-white"
              >
                Run Execution Suite
                <Play className="h-5 w-5 fill-white" />
              </button>

              {executionRun && (
                <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
                  <div className="flex items-center gap-2 font-black">
                    <CheckCircle2 className="h-5 w-5" />
                    Execution saved
                  </div>
                  <p className="mt-2">Run ID: {executionRun.id}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {executionRun ? (
          <>
            <section className="glass-card mb-6 rounded-3xl p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-black">Execution Timeline</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Full validation lifecycle from test loading to RiskSeal
                    readiness.
                  </p>
                </div>

                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-200">
                  {executionRun.status}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                {executionRun.timeline.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-300">
                      <Clock3 className="h-5 w-5" />
                    </div>

                    <h3 className="font-black text-white">{item.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.description}
                    </p>

                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      {item.status}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card mb-6 rounded-3xl p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-black">Execution Results</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Each result includes expected behavior, actual behavior, and
                  evidence text.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="hidden grid-cols-[130px_160px_1fr_120px] bg-white/[0.04] p-4 text-sm font-black text-slate-300 md:grid">
                  <div>ID</div>
                  <div>Source</div>
                  <div>Check</div>
                  <div>Status</div>
                </div>

                {executionRun.results.map((result) => (
                  <div
                    key={result.id}
                    className="grid gap-3 border-t border-white/10 p-4 md:grid-cols-[130px_160px_1fr_120px] md:items-center"
                  >
                    <div className="font-mono text-sm text-cyan-300">
                      {result.id}
                    </div>

                    <div className="text-sm text-slate-300">
                      {result.sourceType}
                    </div>

                    <div>
                      <div className="flex items-start gap-2">
                        <FileText className="mt-1 h-4 w-4 text-cyan-200" />
                        <div>
                          <p className="font-bold text-white">{result.name}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            {result.evidence}
                          </p>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={result.status} />
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-6 grid gap-5 xl:grid-cols-2">
              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">
                      Failed Evidence Pack
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Failed checks are sent to RiskSeal and Human Seal Gate.
                    </p>
                  </div>

                  <Bug className="h-7 w-7 text-rose-300" />
                </div>

                {failedResults.length > 0 ? (
                  <div className="space-y-4">
                    {failedResults.map((result) => (
                      <article
                        key={result.id}
                        className="rounded-2xl border border-rose-300/15 bg-rose-300/[0.06] p-5"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="font-mono text-sm text-rose-200">
                            {result.id} Â· {result.sourceId}
                          </p>

                          <XCircle className="h-5 w-5 text-rose-300" />
                        </div>

                        <h3 className="font-black text-white">
                          {result.name}
                        </h3>

                        <div className="mt-4 space-y-3 text-sm leading-6">
                          <p>
                            <strong className="text-slate-200">Expected:</strong>{" "}
                            <span className="text-slate-400">
                              {result.expected}
                            </span>
                          </p>

                          <p>
                            <strong className="text-slate-200">Actual:</strong>{" "}
                            <span className="text-slate-400">
                              {result.actual}
                            </span>
                          </p>

                          <p>
                            <strong className="text-slate-200">Evidence:</strong>{" "}
                            <span className="text-slate-400">
                              {result.evidence}
                            </span>
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">
                    No failed evidence found. This run is ready for RiskSeal.
                  </p>
                )}
              </div>

              <div className="glass-card rounded-3xl p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">
                      Tool/API Evidence Logs
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Demo execution logs showing how tool and safety behavior
                      would be recorded.
                    </p>
                  </div>

                  <Terminal className="h-7 w-7 text-cyan-300" />
                </div>

                <div className="space-y-3">
                  {[
                    ["test_suite_loader", `${testCases.length} tests`, "loaded"],
                    [
                      "gladiator_prompt_loader",
                      `${redTeamPrompts.length} prompts`,
                      "loaded",
                    ],
                    ["agent_endpoint", assessment.agentEndpoint, "prepared"],
                    ["evidence_writer", executionRun.id, "saved"],
                    [
                      "riskseal_router",
                      executionRun.status,
                      "ready for scoring",
                    ],
                  ].map(([tool, payload, result]) => (
                    <div
                      key={tool}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <p className="font-black text-cyan-200">{tool}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Payload: {payload}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        Result: {result}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-100 md:flex-row md:items-center md:justify-between">
              <p>
                Execution evidence is ready. Continue to RiskSeal to calculate the final risk score from failures, warnings, blocked attacks, and evidence logs.
              </p>

              <Link
                href="/riskseal"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-center font-black text-white"
              >
                Continue to RiskSeal
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <section className="rounded-3xl border border-dashed border-blue-300/25 bg-blue-300/[0.03] p-10 text-center">
            <Activity className="mx-auto h-14 w-14 text-blue-300" />
            <h2 className="mt-5 text-2xl font-black">
              No Execution Run Yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Click â€œRun Execution Suiteâ€ to create pass/fail results, evidence
              logs, and execution timeline.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}





