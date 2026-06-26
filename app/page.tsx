"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Bell,
  Bot,
  Database,
  FileCheck2,
  FileText,
  FlaskConical,
  Hourglass,
  Play,
  Shield,
  ShieldCheck,
  ShieldX,
  Swords,
  Trash2,
  UserCheck,
  Zap,
} from "lucide-react";
import type {
  AgentAssessment,
  GeneratedTestCase,
  RedTeamPrompt,
} from "../lib/agentseal-types";
import {
  clearAgentSealDemoData,
  getActiveAssessment,
  getGeneratedPrompts,
  getGeneratedTests,
} from "../lib/agentseal-storage";

/**
 * AgentSeal Dashboard
 * -------------------
 * Phase 3 fixed version:
 * - Reads active submitted assessment
 * - Reads generated Test Forge test cases
 * - Reads generated Gladiator Engine red-team prompts
 * - Shows dynamic workflow stage: 0 → 1 → 2 → 3
 * - Shows Critical Prompts count after Gladiator Engine generation
 */

const workflowSteps = [
  {
    title: "Intake",
    number: "1",
    status: "Submit agent",
    icon: FileText,
    href: "/assessment",
  },
  {
    title: "Test Forge",
    number: "2",
    status: "Generate tests",
    icon: FlaskConical,
    href: "/test-forge",
  },
  {
    title: "Gladiator",
    number: "3",
    status: "Red-team attacks",
    icon: Swords,
    href: "/gladiator-engine",
  },
  {
    title: "Execution",
    number: "4",
    status: "Run validation",
    icon: Activity,
    href: "/test-execution",
  },
  {
    title: "Human Gate",
    number: "5",
    status: "Reviewer approval",
    icon: UserCheck,
    href: "/human-seal-gate",
  },
  {
    title: "Release",
    number: "6",
    status: "Final seal",
    icon: Shield,
    href: "/release-certificate",
  },
];

const trustSignals = [
  "Security Hardened",
  "Data Privacy Protected",
  "Bias & Fairness Validated",
  "Robustness Verified",
  "Compliance Aligned",
  "Human Oversight Confirmed",
];

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Recently submitted";
  }
}

export default function DashboardPage() {
  const [assessment, setAssessment] = useState<AgentAssessment | null>(null);
  const [testCases, setTestCases] = useState<GeneratedTestCase[]>([]);
  const [redTeamPrompts, setRedTeamPrompts] = useState<RedTeamPrompt[]>([]);

  /**
   * Loads workflow data from localStorage.
   * This keeps Dashboard connected with Assessment, Test Forge, and Gladiator.
   */
  function loadWorkflowData() {
    const activeAssessment = getActiveAssessment();

    setAssessment(activeAssessment);

    if (activeAssessment) {
      setTestCases(getGeneratedTests(activeAssessment.id));
      setRedTeamPrompts(getGeneratedPrompts(activeAssessment.id));
    } else {
      setTestCases([]);
      setRedTeamPrompts([]);
    }
  }

  useEffect(() => {
    loadWorkflowData();
  }, []);

  /**
   * Clears all local demo workflow data.
   * Useful when you want to test the full flow again from zero.
   */
  function handleClearDemoData() {
    clearAgentSealDemoData();
    loadWorkflowData();
  }

  const activeAgentName = assessment?.agentName ?? "No Agent Submitted Yet";
  const activeDomain = assessment?.businessDomain ?? "Waiting for assessment";
  const activeStatus = assessment?.status ?? "Not Started";
  const activeStage = assessment?.trustStage ?? "Intake";

  const generatedTestCount = testCases.length;
  const highRiskTests = testCases.filter((test) => test.risk === "High").length;

  const redTeamPromptCount = redTeamPrompts.length;
  const criticalPromptCount = redTeamPrompts.filter(
    (prompt) => prompt.severity === "Critical"
  ).length;

  /**
   * Dynamic workflow stage number:
   * 0 = nothing submitted
   * 1 = assessment submitted
   * 2 = test cases generated
   * 3 = red-team prompts generated
   */
  const workflowStageNumber =
    redTeamPromptCount > 0
      ? "3"
      : generatedTestCount > 0
        ? "2"
        : assessment
          ? "1"
          : "0";

  const stats = [
    {
      label: "Submitted Agents",
      value: assessment ? "1" : "0",
      note: assessment ? "Active assessment ready" : "Submit your first agent",
      icon: Bot,
      color: "text-cyan-200 bg-cyan-400/10",
    },
    {
      label: "Generated Tests",
      value: String(generatedTestCount),
      note:
        generatedTestCount > 0
          ? "Created by Test Forge"
          : "Waiting for Test Forge",
      icon: FlaskConical,
      color: "text-blue-200 bg-blue-400/10",
    },
    {
      label: "High Risk Tests",
      value: String(highRiskTests),
      note: highRiskTests > 0 ? "Needs red-team attention" : "No high risk yet",
      icon: ShieldX,
      color: "text-orange-200 bg-orange-400/10",
    },
    {
      label: "Critical Prompts",
      value: String(criticalPromptCount),
      note:
        criticalPromptCount > 0
          ? "Needs execution validation"
          : "Waiting for Gladiator",
      icon: Swords,
      color: "text-rose-200 bg-rose-400/10",
    },
    {
      label: "Workflow Stage",
      value: workflowStageNumber,
      note: activeStage,
      icon: Hourglass,
      color: "text-emerald-200 bg-emerald-400/10",
    },
  ];

  return (
    <main className="grid-bg min-h-screen px-5 py-7 text-white lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Top bar */}
        <header className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="glass-card flex max-w-3xl items-center gap-3 rounded-2xl px-5 py-4">
              <Zap className="h-5 w-5 text-cyan-300" />
              <input
                aria-label="Search"
                placeholder="Search agents, tests, policies, evidence..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500 md:text-base"
              />
              <span className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button className="glass-card relative rounded-2xl p-4 text-slate-200">
              <Bell className="h-5 w-5" />
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-400" />
            </button>

            <Link
              href="/assessment"
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-black text-white shadow-[0_0_30px_rgba(34,211,238,0.22)] hover:from-blue-500 hover:to-cyan-400"
            >
              Run Validation
              <Play className="h-5 w-5 fill-white" />
            </Link>

            <button
              onClick={handleClearDemoData}
              className="flex items-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-4 text-sm font-bold text-rose-200 hover:bg-rose-300/15"
            >
              <Trash2 className="h-4 w-4" />
              Clear Demo
            </button>
          </div>
        </header>

        {/* Page intro */}
        <section className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
            AgentSeal Trust Console
          </p>

          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            AI Agent Governance Center
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            Phase 3 connects Assessment, Test Forge, and Gladiator Engine.
            Submit an agent, generate test cases, then create red-team
            adversarial prompts.
          </p>
        </section>

        {/* Dynamic stats */}
        <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-5">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.color}`}
                  >
                    <Icon className="h-9 w-9" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-300">
                      {item.label}
                    </p>
                    <p className="mt-2 text-4xl font-black">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.note}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Workflow stage cards */}
        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">AgentSeal Workflow</h2>
              <p className="mt-2 text-sm text-slate-400">
                Click each stage to open its module.
              </p>
            </div>

            <span className="w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
              Current Stage: {activeStage}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {workflowSteps.map((step) => {
              const Icon = step.icon;

              return (
                <Link
                  key={step.title}
                  href={step.href}
                  className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.08]"
                >
                  <Icon className="mb-4 h-8 w-8 text-cyan-200" />
                  <p className="text-sm font-bold">{step.title}</p>
                  <p className="mt-4 text-4xl font-black">{step.number}</p>
                  <p className="mt-1 text-sm text-slate-400">{step.status}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Active agent card */}
        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-center">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <Bot className="h-14 w-14" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black">{activeAgentName}</h2>

                  <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-1 text-sm font-bold text-emerald-200">
                    {activeStatus}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-slate-500">Business Domain</p>
                    <p className="mt-1 text-slate-200">{activeDomain}</p>
                  </div>

                  <div>
                    <p className="text-slate-500">Reviewer</p>
                    <p className="mt-1 text-slate-200">
                      {assessment?.reviewerEmail ?? "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Submitted</p>
                    <p className="mt-1 text-slate-200">
                      {assessment
                        ? formatDate(assessment.createdAt)
                        : "Not submitted yet"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Evidence</p>
                    <p className="mt-1 text-slate-200">
                      {generatedTestCount} tests · {redTeamPromptCount} prompts
                    </p>
                  </div>
                </div>

                <p className="mt-5 max-w-4xl text-sm leading-6 text-slate-400">
                  {assessment?.agentDescription ??
                    "Submit a New Agent Assessment to replace this empty state with your own workflow data."}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-300/10 bg-[#041024]/80 p-6">
              <h3 className="font-black">Next Best Action</h3>

              <p className="mt-4 leading-7 text-slate-300">
                {!assessment
                  ? "Start by submitting your first AI agent assessment."
                  : generatedTestCount === 0
                    ? "Assessment submitted. Continue to Test Forge and generate test cases."
                    : redTeamPromptCount === 0
                      ? "Test cases are ready. Continue to Gladiator Engine and generate red-team prompts."
                      : "Red-team prompts are ready. Next phase will simulate test execution and evidence logs."}
              </p>

              <Link
                href={
                  !assessment
                    ? "/assessment"
                    : generatedTestCount === 0
                      ? "/test-forge"
                      : redTeamPromptCount === 0
                        ? "/gladiator-engine"
                        : "/test-execution"
                }
                className="mt-6 block rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-center font-black text-cyan-100 hover:bg-cyan-300/15"
              >
                {!assessment
                  ? "Start Assessment"
                  : generatedTestCount === 0
                    ? "Open Test Forge"
                    : redTeamPromptCount === 0
                      ? "Open Gladiator Engine"
                      : "Continue to Test Execution"}
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom overview */}
        <section className="mb-6 grid gap-5 xl:grid-cols-3">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="mb-5 text-xl font-black">Generated Test Overview</h2>

            {testCases.length > 0 ? (
              <div className="space-y-4">
                {testCases.slice(0, 5).map((testCase) => (
                  <div
                    key={testCase.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-slate-200">
                        {testCase.title}
                      </p>

                      <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-200">
                        {testCase.risk}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {testCase.category}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="leading-7 text-slate-400">
                No test cases generated yet. Submit an assessment and open Test
                Forge to create tests.
              </p>
            )}
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h2 className="mb-5 text-xl font-black">Red-Team Overview</h2>

            {redTeamPrompts.length > 0 ? (
              <div className="space-y-4">
                {redTeamPrompts.slice(0, 5).map((prompt) => (
                  <div
                    key={prompt.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-slate-200">
                        {prompt.attackType}
                      </p>

                      <span className="rounded-full bg-rose-300/10 px-3 py-1 text-xs font-black text-rose-200">
                        {prompt.severity}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Source: {prompt.testCaseId}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="leading-7 text-slate-400">
                No red-team prompts generated yet. Open Gladiator Engine after
                Test Forge.
              </p>
            )}
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h2 className="mb-5 text-xl font-black">Evidence Summary</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <FileCheck2 className="mb-4 h-6 w-6 text-cyan-200" />
                <p className="text-sm text-slate-400">Assessments</p>
                <p className="mt-2 text-3xl font-black">
                  {assessment ? "1" : "0"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Database className="mb-4 h-6 w-6 text-cyan-200" />
                <p className="text-sm text-slate-400">Tests</p>
                <p className="mt-2 text-3xl font-black">
                  {generatedTestCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Swords className="mb-4 h-6 w-6 text-rose-200" />
                <p className="text-sm text-slate-400">Prompts</p>
                <p className="mt-2 text-3xl font-black">
                  {redTeamPromptCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <ShieldX className="mb-4 h-6 w-6 text-rose-200" />
                <p className="text-sm text-slate-400">Critical</p>
                <p className="mt-2 text-3xl font-black">
                  {criticalPromptCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {trustSignals.map((signal) => (
              <div key={signal} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-300">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-300">{signal}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-amber-100">
          ⚠️ Phase 3 uses browser localStorage for demo data. Real backend,
          database, UiPath Test Cloud, and evidence execution will be added in
          later phases.
        </div>
      </div>
    </main>
  );
}



