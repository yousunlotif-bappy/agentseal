import Link from "next/link";

/**
 * AgentSeal Proof Pack Page
 * -------------------------
 * This page is not a random new feature.
 * It is a judge-facing technical proof page.
 *
 * Purpose:
 * - Explain the full AgentSeal story in one clean page.
 * - Show how frontend, backend, risk engine, evidence, and UiPath mapping connect.
 * - Help judges understand the project quickly without reading all code.
 */

type ProofCard = {
  title: string;
  label: string;
  description: string;
  proof: string;
};

type FlowStep = {
  step: string;
  title: string;
  detail: string;
};

const proofCards: ProofCard[] = [
  {
    title: "Next.js Frontend",
    label: "Interface Layer",
    description:
      "AgentSeal Trust Console provides the complete release workflow UI from assessment to runtime monitoring.",
    proof:
      "Dashboard, Assessment, Test Forge, Gladiator Engine, RiskSeal, Evidence Vault, Certificate, and LiveSeal pages.",
  },
  {
    title: "FastAPI Backend MVP",
    label: "Execution Layer",
    description:
      "Backend exposes executable API routes for assessment, tests, red-team prompts, execution, risk scoring, certificate, and monitoring.",
    proof:
      "FastAPI /docs, /health, /api/demo/run-full-flow, and assessment-specific API routes.",
  },
  {
    title: "RiskSeal Scoring",
    label: "Decision Engine",
    description:
      "Weighted scoring converts failures into release decisions such as Seal Ready, Human Review, or Block Release.",
    proof:
      "Before-fix risk is high, after-fix risk is low, showing clear remediation value.",
  },
  {
    title: "UiPath Integration Proof",
    label: "Automation Mapping",
    description:
      "AgentSeal maps to UiPath Test Cloud, Maestro BPMN, Action Center Human Task, Orchestrator, and Maestro Case.",
    proof:
      "/uipath-proof page and /api/uipath/proof backend endpoint show the integration model.",
  },
  {
    title: "Evidence Vault",
    label: "Audit Layer",
    description:
      "All workflow artifacts are packaged into an audit-ready evidence trail for reviewer and compliance use.",
    proof:
      "Assessment, tests, prompts, execution results, RiskSeal report, human review, and certificate metadata.",
  },
  {
    title: "LiveSeal Monitor",
    label: "Runtime Trust",
    description:
      "After release, LiveSeal continues monitoring health, drift, privacy signals, and incident readiness.",
    proof:
      "LiveSeal Monitor page simulates post-release trust monitoring and downloadable monitor artifacts.",
  },
];

const demoFlow: FlowStep[] = [
  {
    step: "01",
    title: "Customer Refund Agent submitted",
    detail:
      "A company wants to release an AI agent that checks refunds and creates support tickets.",
  },
  {
    step: "02",
    title: "Test Forge generates validation suite",
    detail:
      "Business rules, privacy policy, allowed tools, and forbidden actions are converted into test cases.",
  },
  {
    step: "03",
    title: "Gladiator Engine creates red-team prompts",
    detail:
      "Adversarial prompts test approval bypass, PII extraction, prompt injection, and unsafe tool use.",
  },
  {
    step: "04",
    title: "Test Execution shows before/after contrast",
    detail:
      "Before fix, dangerous failures are detected. After fix, the agent blocks unsafe behavior.",
  },
  {
    step: "05",
    title: "RiskSeal makes release decision",
    detail:
      "Risk score determines whether the agent is ready, needs human review, or must be blocked.",
  },
  {
    step: "06",
    title: "Human Seal Gate records reviewer control",
    detail:
      "Reviewer approves, rejects, or requests remediation before production release.",
  },
  {
    step: "07",
    title: "Evidence Vault packages proof",
    detail:
      "All artifacts are stored as an audit-ready evidence package.",
  },
  {
    step: "08",
    title: "Release Certificate and LiveSeal complete the story",
    detail:
      "A production-readiness certificate is issued and runtime monitoring continues after release.",
  },
];

const screenshotChecklist = [
  "Dashboard",
  "New Agent Assessment",
  "Test Forge",
  "Gladiator Engine",
  "Test Execution before/after result",
  "RiskSeal decision",
  "Human Seal Gate approval",
  "Evidence Vault package",
  "Release Certificate",
  "LiveSeal Monitor",
  "Backend Health",
  "FastAPI /docs",
  "FastAPI /api/demo/run-full-flow",
  "UiPath Proof page",
];

const winningPitch =
  "We are not building another AI agent. We are building the trust layer that decides whether enterprise AI agents are safe enough for production.";

export default function ProofPackPage() {
  return (
    <main className="min-h-screen bg-[#020817] bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:72px_72px] px-5 py-8 text-white">
      <div className="mx-auto max-w-[1500px] space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="inline-flex w-fit rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 font-black text-cyan-100 transition hover:bg-cyan-300/15"
          >
            ← Back to Dashboard
          </Link>

          <div className="w-fit rounded-full border border-emerald-300/20 bg-emerald-300/10 px-5 py-3 text-sm font-black text-emerald-200">
            Judge-Ready Proof Pack
          </div>
        </div>

        <section className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/70 p-8 shadow-[0_0_70px_rgba(8,145,178,0.14)] md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.4em] text-cyan-300">
            AgentSeal Submission Proof
          </p>

          <h1 className="mt-5 max-w-5xl text-5xl font-black tracking-tight md:text-7xl">
            Enterprise AI Agent Release Gate
          </h1>

          <p className="mt-6 max-w-5xl text-xl leading-9 text-slate-300">
            {winningPitch}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.06] p-6">
              <p className="text-sm text-slate-400">Frontend</p>
              <p className="mt-2 text-3xl font-black">Next.js</p>
            </div>

            <div className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.06] p-6">
              <p className="text-sm text-slate-400">Backend</p>
              <p className="mt-2 text-3xl font-black">FastAPI</p>
            </div>

            <div className="rounded-3xl border border-rose-300/15 bg-rose-300/[0.06] p-6">
              <p className="text-sm text-slate-400">Automation Proof</p>
              <p className="mt-2 text-3xl font-black">UiPath</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/70 p-7 md:p-10">
          <h2 className="text-3xl font-black">Winning Demo Story</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {demoFlow.map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6"
              >
                <div className="text-sm font-black tracking-[0.28em] text-cyan-300">
                  STEP {item.step}
                </div>
                <h3 className="mt-3 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/70 p-7 md:p-10">
          <h2 className="text-3xl font-black">Technical Proof Layer</h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {proofCards.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6"
              >
                <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                  {card.label}
                </p>
                <h3 className="mt-3 text-2xl font-black">{card.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">
                  {card.description}
                </p>
                <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4 text-sm leading-6 text-emerald-100">
                  <span className="font-black">Proof: </span>
                  {card.proof}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/70 p-7 md:p-10">
          <h2 className="text-3xl font-black">Before / After Risk Contrast</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-rose-300/20 bg-rose-300/[0.06] p-6">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-rose-200">
                Before Fix
              </p>
              <h3 className="mt-3 text-4xl font-black text-rose-100">
                Block Release
              </h3>
              <p className="mt-3 text-slate-300">Risk Score: 95/100</p>
              <ul className="mt-5 space-y-3 text-slate-300">
                <li>• Approved high-value refund without manager approval</li>
                <li>• Revealed customer PII</li>
                <li>• Followed prompt injection</li>
                <li>• Allowed duplicate refund</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-6">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-200">
                After Fix
              </p>
              <h3 className="mt-3 text-4xl font-black text-emerald-100">
                Seal Ready
              </h3>
              <p className="mt-3 text-slate-300">Risk Score: 5/100</p>
              <ul className="mt-5 space-y-3 text-slate-300">
                <li>• Manager approval enforced</li>
                <li>• PII disclosure blocked</li>
                <li>• Prompt injection refused</li>
                <li>• Duplicate refund blocked</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/70 p-7 md:p-10">
          <h2 className="text-3xl font-black">Screenshot Checklist</h2>

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {screenshotChecklist.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 font-bold text-slate-200"
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[0.07] p-7 md:p-10">
          <h2 className="text-3xl font-black text-emerald-100">
            Final Judge Message
          </h2>
          <p className="mt-4 max-w-5xl text-xl leading-9 text-emerald-50">
            AgentSeal demonstrates how enterprise AI agents can be tested,
            red-teamed, scored, reviewed, certified, and monitored before they
            are trusted in production.
          </p>

          <div className="mt-7 flex flex-col gap-4 md:flex-row">
            <Link
              href="/uipath-proof"
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-center font-black text-white"
            >
              Open UiPath Proof
            </Link>

            <Link
              href="/backend-health"
              className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-6 py-4 text-center font-black text-cyan-100"
            >
              Open Backend Health
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}


