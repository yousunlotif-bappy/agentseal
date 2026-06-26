"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileText,
  FlaskConical,
  Play,
  ShieldAlert,
} from "lucide-react";
import type {
  AgentAssessment,
  GeneratedTestCase,
  RiskLevel,
} from "../../lib/agentseal-types";
import { generateTestCases } from "../../lib/agentseal-demo-generator";
import {
  getActiveAssessment,
  getGeneratedTests,
  saveGeneratedTests,
  updateAssessmentStatus,
} from "../../lib/agentseal-storage";

/**
 * Test Forge Page
 * ----------------
 * Purpose:
 * - Reads the active submitted assessment from localStorage
 * - Generates test cases from business rules, privacy policies, tools, and approval rules
 * - Saves generated test cases to localStorage
 * - Updates workflow status to "Tests Generated"
 * - Provides next-step button to Gladiator Engine
 *
 * Phase 3 ready:
 * After test generation, the user can continue to Gladiator Engine,
 * where these test cases become red-team adversarial prompts.
 */

function RiskBadge({ risk }: { risk: RiskLevel }) {
  if (risk === "High") {
    return (
      <span className="rounded-full bg-rose-400/10 px-3 py-1 text-xs font-black text-rose-300">
        High
      </span>
    );
  }

  if (risk === "Medium") {
    return (
      <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-black text-amber-300">
        Medium
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
      Low
    </span>
  );
}

export default function TestForgePage() {
  const [assessment, setAssessment] = useState<AgentAssessment | null>(null);
  const [testCases, setTestCases] = useState<GeneratedTestCase[]>([]);

  /**
   * Load active assessment and any previously generated tests.
   * This runs once when the page opens.
   */
  useEffect(() => {
    const activeAssessment = getActiveAssessment();

    setAssessment(activeAssessment);

    if (activeAssessment) {
      setTestCases(getGeneratedTests(activeAssessment.id));
    }
  }, []);

  /**
   * Generates the test suite from the active assessment.
   * Then saves it and updates the workflow stage.
   */
  function handleGenerateTests() {
    if (!assessment) return;

    const generatedTests = generateTestCases(assessment);

    saveGeneratedTests(assessment.id, generatedTests);

    const updatedAssessment = updateAssessmentStatus(
      assessment.id,
      "Tests Generated",
      "Test Forge"
    );

    setAssessment(updatedAssessment ?? assessment);
    setTestCases(generatedTests);
  }

  const highRiskCount = testCases.filter((test) => test.risk === "High").length;
  const mediumRiskCount = testCases.filter(
    (test) => test.risk === "Medium"
  ).length;
  const lowRiskCount = testCases.filter((test) => test.risk === "Low").length;

  /**
   * Empty state:
   * If the user opens Test Forge before submitting an assessment,
   * we guide them back to the assessment page.
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
            Test Forge needs assessment data before it can generate test cases.
            Please submit a New Agent Assessment first.
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

  return (
    <main className="grid-bg min-h-screen px-5 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top navigation */}
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <span className="w-fit rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
            Step 02 / Test Forge
          </span>
        </div>

        {/* Page hero */}
        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Test Forge
            </p>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              Generate Test Cases
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              Convert submitted business rules, privacy policies, allowed tools,
              forbidden actions, and human approval rules into test cases.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-300/10 text-cyan-300">
              <FlaskConical className="h-11 w-11" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-cyan-100">
              Connected Agent
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {assessment.agentName}
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {assessment.businessDomain}
            </p>
          </div>
        </section>

        {/* Active assessment summary + generate button */}
        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_320px] xl:items-start">
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

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-2 text-sm font-black text-cyan-200">
                    Business Rules
                  </p>
                  <p className="text-sm leading-6 text-slate-300">
                    {assessment.businessRules}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="mb-2 text-sm font-black text-cyan-200">
                    Sensitive Data Policy
                  </p>
                  <p className="text-sm leading-6 text-slate-300">
                    {assessment.sensitiveDataPolicy}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5">
              <h3 className="text-xl font-black text-emerald-200">
                Test Summary
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="text-3xl font-black">{testCases.length}</p>
                </div>

                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-slate-400">High Risk</p>
                  <p className="text-3xl font-black text-rose-300">
                    {highRiskCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-slate-400">Medium</p>
                  <p className="text-3xl font-black text-amber-300">
                    {mediumRiskCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-slate-400">Low</p>
                  <p className="text-3xl font-black text-emerald-300">
                    {lowRiskCount}
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateTests}
                className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 font-black text-white"
              >
                Generate Test Suite
                <Play className="h-5 w-5 fill-white" />
              </button>
            </div>
          </div>
        </section>

        {/* Generated test cases list */}
        {testCases.length > 0 ? (
          <section className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black">Generated Test Cases</h2>
                <p className="mt-2 text-sm text-slate-400">
                  These test cases are now saved and connected to the current
                  assessment.
                </p>
              </div>

              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-black">Saved to workflow</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="hidden grid-cols-[130px_1fr_180px_120px] bg-white/[0.04] p-4 text-sm font-black text-slate-300 md:grid">
                <div>ID</div>
                <div>Test Case</div>
                <div>Category</div>
                <div>Risk</div>
              </div>

              {testCases.map((testCase) => (
                <div
                  key={testCase.id}
                  className="grid gap-3 border-t border-white/10 p-4 md:grid-cols-[130px_1fr_180px_120px] md:items-center"
                >
                  <div className="font-mono text-sm text-cyan-300">
                    {testCase.id}
                  </div>

                  <div>
                    <div className="flex items-start gap-2">
                      <FileText className="mt-1 h-4 w-4 text-cyan-200" />
                      <div>
                        <p className="font-bold text-white">{testCase.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {testCase.expectedResult}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-300">
                    {testCase.category}
                  </div>

                  <RiskBadge risk={testCase.risk} />
                </div>
              ))}
            </div>

            {/* Phase 3 next-step button */}
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-amber-100 md:flex-row md:items-center md:justify-between">
              <p>
                Phase 2 uses demo generation. In Phase 3, Gladiator Engine will
                use these test cases to create adversarial prompts and red-team
                attacks.
              </p>

              <Link
                href="/gladiator-engine"
                className="rounded-xl bg-gradient-to-r from-rose-600 to-cyan-500 px-5 py-3 text-center font-black text-white"
              >
                Continue to Gladiator Engine
              </Link>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-cyan-300/25 bg-cyan-300/[0.03] p-10 text-center">
            <FlaskConical className="mx-auto h-14 w-14 text-cyan-300" />
            <h2 className="mt-5 text-2xl font-black">No Tests Generated Yet</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">
              Click “Generate Test Suite” to create test cases from the submitted
              assessment.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}



