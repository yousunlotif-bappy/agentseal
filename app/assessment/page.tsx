"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  Building2,
  CheckCircle2,
  FileText,
  KeyRound,
  Mail,
  Play,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Wrench,
  XOctagon,
  type LucideIcon,
} from "lucide-react";

/*
  New Agent Assessment Page
  -------------------------
  This page starts the AgentSeal workflow:
  Intake → Rules Extraction → Test Forge → Gladiator Engine → Test Execution
  → RiskSeal → Human Seal Gate → Evidence Vault → Release Certificate.
*/

type FormField = {
  name: string;
  label: string;
  placeholder: string;
  type: "input" | "textarea";
  icon: LucideIcon;
};

const formFields: FormField[] = [
  {
    name: "agentName",
    label: "Agent Name",
    placeholder: "Example: Customer Refund Agent",
    type: "input",
    icon: Bot,
  },
  {
    name: "businessDomain",
    label: "Business Domain",
    placeholder: "Example: E-commerce, Banking, Insurance, Healthcare",
    type: "input",
    icon: Building2,
  },
  {
    name: "agentDescription",
    label: "Agent Description",
    placeholder: "Explain what this AI agent does, who uses it, and what business problem it solves.",
    type: "textarea",
    icon: FileText,
  },
  {
    name: "businessRules",
    label: "Business Rules",
    placeholder: "Example: Refunds above $500 require manager approval. Refunds older than 30 days must be rejected.",
    type: "textarea",
    icon: BadgeCheck,
  },
  {
    name: "sensitiveDataPolicy",
    label: "Sensitive Data Policy",
    placeholder: "Example: Never expose password, API key, card number, NID, address, or private customer information.",
    type: "textarea",
    icon: KeyRound,
  },
  {
    name: "allowedApis",
    label: "Allowed APIs / Tools",
    placeholder: "Example: CRM lookup, order status API, ticket creation tool, policy knowledge base.",
    type: "textarea",
    icon: Wrench,
  },
  {
    name: "forbiddenActions",
    label: "Forbidden Actions",
    placeholder: "Example: Cannot approve refunds directly, cannot delete accounts, cannot reveal internal secrets.",
    type: "textarea",
    icon: XOctagon,
  },
  {
    name: "humanApprovalRules",
    label: "Human Approval Rules",
    placeholder: "Example: Human approval is required for refunds, legal decisions, high-risk actions, and policy exceptions.",
    type: "textarea",
    icon: UserCheck,
  },
  {
    name: "agentEndpoint",
    label: "Agent Endpoint",
    placeholder: "Example: https://api.company.com/agents/refund-support",
    type: "input",
    icon: ShieldAlert,
  },
  {
    name: "reviewerEmail",
    label: "Reviewer Email",
    placeholder: "Example: reviewer@company.com",
    type: "input",
    icon: Mail,
  },
];

const workflowSteps = [
  "Agent submitted",
  "Rules extracted",
  "Tests generated",
  "Red-team prompts generated",
  "UiPath Test Cloud executes",
  "Risk score calculated",
  "Human approval or Seal granted",
];

export default function AssessmentPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Phase 1 behavior: show a success message only.
    // Later, this function will call a backend API or UiPath workflow endpoint.
    setSubmitted(true);
  }

  return (
    <main className="grid-bg min-h-screen px-5 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-200">
            Step 01 / Maestro BPMN Start
          </span>
        </div>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">AgentSeal Intake</p>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">New Agent Assessment</h1>
            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              Submit an AI agent for governance, business-rule extraction, adversarial testing, UiPath execution,
              risk scoring, human review, and final production seal.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.slice(0, 4).map((step, index) => (
                <div key={step} className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-cyan-300/10 text-sm font-black text-cyan-200">
                    {index + 1}
                  </div>
                  <p className="text-sm font-semibold text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-300/10 text-emerald-300">
              <ShieldCheck className="h-11 w-11" />
            </div>
            <h2 className="mt-6 text-2xl font-black text-emerald-200">Trust Intake Ready</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This page starts the full AgentSeal lifecycle. For Phase 1, the form is a demo. In the next phase,
              we will save this data and pass it into workflow modules.
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-5 md:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 border-b border-white/10 pb-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">Agent Governance Details</h2>
              <p className="mt-2 text-sm text-slate-400">Fill these details to start the assessment pipeline.</p>
            </div>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-200">
              Required for Seal Decision
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {formFields.map((field) => {
              const Icon = field.icon;
              const isEmail = field.name === "reviewerEmail";

              return (
                <label key={field.name} className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
                    <Icon className="h-4 w-4 text-cyan-300" />
                    {field.label}
                  </span>

                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      placeholder={field.placeholder}
                      rows={5}
                      required
                      className="focus-glow min-h-32 w-full rounded-2xl border border-cyan-300/10 bg-[#031124]/70 px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-600"
                    />
                  ) : (
                    <input
                      name={field.name}
                      type={isEmail ? "email" : "text"}
                      placeholder={field.placeholder}
                      required
                      className="focus-glow w-full rounded-2xl border border-cyan-300/10 bg-[#031124]/70 px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-600"
                    />
                  )}
                </label>
              );
            })}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 text-base font-black text-white shadow-[0_0_32px_rgba(34,211,238,0.24)] hover:from-blue-500 hover:to-cyan-400"
            >
              Start AgentSeal Assessment
              <Play className="h-5 w-5 fill-white" />
            </button>

            {submitted && (
              <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5 text-sm leading-7 text-emerald-100">
                <div className="mb-2 flex items-center gap-2 font-black">
                  <CheckCircle2 className="h-5 w-5" />
                  Assessment started successfully.
                </div>
                Next flow: Rules Extraction → Test Forge → Gladiator Engine → UiPath Test Cloud → RiskSeal → Human Seal Gate → Evidence Vault → Release Certificate.
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
