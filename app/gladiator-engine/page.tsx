"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileText,
  Play,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Target,
  Zap,
} from "lucide-react";
import type {
  AgentAssessment,
  AttackSeverity,
  GeneratedTestCase,
  RedTeamPrompt,
} from "../../lib/agentseal-types";
import { generateRedTeamPrompts } from "../../lib/agentseal-gladiator-generator";
import {
  getActiveAssessment,
  getGeneratedPrompts,
  getGeneratedTests,
  saveGeneratedPrompts,
  updateAssessmentStatus,
} from "../../lib/agentseal-storage";

/**
 * Gladiator Engine Page
 * ---------------------
 * Phase 3:
 * - Reads active assessment
 * - Reads generated Test Forge cases
 * - Creates adversarial red-team prompts
 * - Saves prompts to localStorage
 * - Updates workflow stage to Gladiator Engine
 */

function SeverityBadge({ severity }: { severity: AttackSeverity }) {
  if (severity === "Critical") {
    return (
      <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-3 py-1 text-xs font-black text-rose-300">
        Critical
      </span>
    );
  }

  if (severity === "High") {
    return (
      <span className="rounded-full border border-orange-300/30 bg-orange-300/10 px-3 py-1 text-xs font-black text-orange-300">
        High
      </span>
    );
  }

  if (severity === "Medium") {
    return (
      <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-300">
        Medium
      </span>
    );
  }

  return (
    <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-300">
      Low
    </span>
  );
}

export default function GladiatorEnginePage() {
  const [assessment, setAssessment] = useState<AgentAssessment | null>(null);
  const [testCases, setTestCases] = useState<GeneratedTestCase[]>([]);
  const [prompts, setPrompts] = useState<RedTeamPrompt[]>([]);

  useEffect(() => {
    const activeAssessment = getActiveAssessment();

    setAssessment(activeAssessment);

    if (activeAssessment) {
      setTestCases(getGeneratedTests(activeAssessment.id));
      setPrompts(getGeneratedPrompts(activeAssessment.id));
    }
  }, []);

  function handleGeneratePrompts() {
    if (!assessment || testCases.length === 0) return;

    const generatedPrompts = generateRedTeamPrompts(assessment, testCases);

    saveGeneratedPrompts(assessment.id, generatedPrompts);

    const updatedAssessment = updateAssessmentStatus(
      assessment.id,
      "Red Team Generated",
      "Gladiator Engine"
    );

    setAssessment(updatedAssessment ?? assessment);
    setPrompts(generatedPrompts);
  }

  const criticalCount = prompts.filter(
    (prompt) => prompt.severity === "Critical"
  ).length;

  const highCount = prompts.filter((prompt) => prompt.severity === "High").length;

  const injectionCount = prompts.filter((prompt) =>
    prompt.attackType.toLowerCase().includes("injection")
  ).length;

  /**
   * State 1:
   * User directly opened Gladiator Engine without submitting assessment.
   */
  if (!assessment) {
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
            No Assessment Found
          </p>

          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            Submit an Agent First
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            Gladiator Engine needs an active assessment before it can create
            red-team adversarial prompts.
          </p>

          <Link
            href="/assessment"
            className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-black text-white"
          >
            Start New Assessment
          </Link>
        </section>
      </main>
    );
  }

  /**
   * State 2:
   * Assessment exists, but Test Forge did not generate test cases yet.
   */
  if (testCases.length === 0) {
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
            <AlertTriangle className="h-11 w-11" />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-amber-300">
            Test Forge Required
          </p>

          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            Generate Test Cases First
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            Gladiator Engine creates adversarial prompts from Test Forge cases.
            Please generate the test suite first.
          </p>

          <Link
            href="/test-forge"
            className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-black text-white"
          >
            Open Test Forge
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="grid-bg min-h-screen px-5 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <span className="w-fit rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-2 text-sm font-bold text-rose-200">
            Step 03 / Gladiator Engine
          </span>
        </div>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-rose-300">
              Gladiator Engine
            </p>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Generate Red-Team Prompts
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              Convert Test Forge cases into adversarial prompts for prompt
              injection, policy bypass, approval bypass, PII extraction, and
              unsafe tool-use testing.
            </p>
          </div>

          <div className="rounded-3xl border border-rose-300/20 bg-rose-300/[0.05] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-300/10 text-rose-300">
              <Swords className="h-11 w-11" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-rose-100">
              Red-Team Ready
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Connected agent: <strong>{assessment.agentName}</strong>
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {assessment.businessDomain}
            </p>
          </div>
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
                    Status: {assessment.status} · Stage: {assessment.trustStage}
                  </p>
                </div>
              </div>

              <p className="max-w-4xl leading-7 text-slate-300">
                {assessment.agentDescription}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Source Tests</p>
                  <p className="mt-2 text-4xl font-black">{testCases.length}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Generated Prompts</p>
                  <p className="mt-2 text-4xl font-black">{prompts.length}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Critical Attacks</p>
                  <p className="mt-2 text-4xl font-black text-rose-300">
                    {criticalCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-rose-300/20 bg-rose-300/[0.05] p-5">
              <h3 className="text-xl font-black text-rose-200">
                Attack Summary
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-slate-400">Critical</p>
                  <p className="text-3xl font-black text-rose-300">
                    {criticalCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-slate-400">High</p>
                  <p className="text-3xl font-black text-orange-300">
                    {highCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-slate-400">Injection</p>
                  <p className="text-3xl font-black text-cyan-300">
                    {injectionCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-slate-400">Status</p>
                  <p className="text-xl font-black text-emerald-300">Ready</p>
                </div>
              </div>

              <button
                onClick={handleGeneratePrompts}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-600 to-cyan-500 px-5 py-4 font-black text-white"
              >
                Generate Red-Team Prompts
                <Play className="h-5 w-5 fill-white" />
              </button>
            </div>
          </div>
        </section>

        {prompts.length > 0 ? (
          <section className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">
                  Generated Adversarial Prompts
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  These prompts are saved and ready for the next Test Execution
                  phase.
                </p>
              </div>

              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-black">Saved to workflow</span>
              </div>
            </div>

            <div className="space-y-4">
              {prompts.map((prompt) => (
                <article
                  key={prompt.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-300/10 text-rose-300">
                        <Target className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-mono text-sm text-cyan-300">
                          {prompt.id} · Source {prompt.testCaseId}
                        </p>
                        <h3 className="mt-1 text-xl font-black">
                          {prompt.attackType}
                        </h3>
                      </div>
                    </div>

                    <SeverityBadge severity={prompt.severity} />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-rose-300/10 bg-rose-300/[0.04] p-4">
                      <p className="mb-2 flex items-center gap-2 text-sm font-black text-rose-200">
                        <Zap className="h-4 w-4" />
                        Adversarial Prompt
                      </p>
                      <p className="text-sm leading-7 text-slate-300">
                        {prompt.adversarialPrompt}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] p-4">
                      <p className="mb-2 flex items-center gap-2 text-sm font-black text-emerald-200">
                        <ShieldCheck className="h-4 w-4" />
                        Expected Safe Behavior
                      </p>
                      <p className="text-sm leading-7 text-slate-300">
                        {prompt.expectedSafeBehavior}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-black text-cyan-200">
                      <FileText className="h-4 w-4" />
                      Objective
                    </p>
                    <p className="text-sm leading-7 text-slate-300">
                      {prompt.objective}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-100 md:flex-row md:items-center md:justify-between">
              <p>
                Phase 3 completed. Phase 4 will use these prompts to simulate
                execution results, pass/fail status, and evidence logs.
              </p>

              <Link
                href="/test-execution"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-center font-black text-white"
              >
                Continue to Test Execution
              </Link>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-rose-300/25 bg-rose-300/[0.03] p-10 text-center">
            <Swords className="mx-auto h-14 w-14 text-rose-300" />
            <h2 className="mt-5 text-2xl font-black">
              No Red-Team Prompts Yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Click “Generate Red-Team Prompts” to convert Test Forge cases into
              adversarial testing prompts.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}


