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
import type { AgentAssessment } from "../../lib/agentseal-types";
import { saveAssessment } from "../../lib/agentseal-storage";

/**
 * New Agent Assessment Page
 * -------------------------
 * Phase 2 upgrade:
 * - This form now saves submitted agent data into localStorage.
 * - Dashboard can read the submitted agent.
 * - Test Forge can generate test cases from this data.
 */

type FormFieldName =
  | "agentName"
  | "businessDomain"
  | "agentDescription"
  | "businessRules"
  | "sensitiveDataPolicy"
  | "allowedApis"
  | "forbiddenActions"
  | "humanApprovalRules"
  | "agentEndpoint"
  | "reviewerEmail";

type AssessmentFormState = Record<FormFieldName, string>;

type FormField = {
  name: FormFieldName;
  label: string;
  placeholder: string;
  type: "input" | "textarea";
  icon: LucideIcon;
};

const initialFormState: AssessmentFormState = {
  agentName: "",
  businessDomain: "",
  agentDescription: "",
  businessRules: "",
  sensitiveDataPolicy: "",
  allowedApis: "",
  forbiddenActions: "",
  humanApprovalRules: "",
  agentEndpoint: "",
  reviewerEmail: "",
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
    placeholder:
      "Explain what this AI agent does, who uses it, and what business problem it solves.",
    type: "textarea",
    icon: FileText,
  },
  {
    name: "businessRules",
    label: "Business Rules",
    placeholder:
      "Example: Refunds above $500 require manager approval. Refund reason must be recorded.",
    type: "textarea",
    icon: BadgeCheck,
  },
  {
    name: "sensitiveDataPolicy",
    label: "Sensitive Data Policy",
    placeholder:
      "Example: Never expose password, API key, card number, NID, or private customer data.",
    type: "textarea",
    icon: KeyRound,
  },
  {
    name: "allowedApis",
    label: "Allowed APIs / Tools",
    placeholder:
      "Example: CRM lookup, order status API, ticket creation tool.",
    type: "textarea",
    icon: Wrench,
  },
  {
    name: "forbiddenActions",
    label: "Forbidden Actions",
    placeholder:
      "Example: Cannot approve refunds directly, cannot delete accounts, cannot reveal secrets.",
    type: "textarea",
    icon: XOctagon,
  },
  {
    name: "humanApprovalRules",
    label: "Human Approval Rules",
    placeholder:
      "Example: Human approval is required for refunds above $500 or high-risk account changes.",
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

export default function AssessmentPage() {
  const [formData, setFormData] =
    useState<AssessmentFormState>(initialFormState);

  const [submittedAssessment, setSubmittedAssessment] =
    useState<AgentAssessment | null>(null);

  function updateField(name: FormFieldName, value: string) {
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const assessment: AgentAssessment = {
      id: `AS-${Date.now()}`,
      createdAt: new Date().toISOString(),

      ...formData,

      status: "Submitted",
      trustStage: "Intake",
    };

    /**
     * Phase 2 connection:
     * This single save makes the data available to:
     * - Dashboard
     * - Test Forge
     * - Future Gladiator Engine
     */
    saveAssessment(assessment);

    setSubmittedAssessment(assessment);
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

          <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-200">
            Step 01 / Maestro BPMN Start
          </span>
        </div>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              AgentSeal Intake
            </p>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
              New Agent Assessment
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              Submit an AI agent for governance, rule extraction, Test Forge
              generation, red-team testing, risk scoring, human review, and
              final production seal.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-300/10 text-emerald-300">
              <ShieldCheck className="h-11 w-11" />
            </div>

            <h2 className="mt-6 text-2xl font-black text-emerald-200">
              Phase 2 Connected
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              After submission, this form saves the agent data and sends the
              workflow toward Dashboard and Test Forge.
            </p>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-3xl p-5 md:p-6"
        >
          <div className="mb-6 flex flex-col justify-between gap-3 border-b border-white/10 pb-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">Agent Governance Details</h2>
              <p className="mt-2 text-sm text-slate-400">
                Fill these details to start the assessment pipeline.
              </p>
            </div>

            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-200">
              Data will connect to Test Forge
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
                      value={formData[field.name]}
                      onChange={(event) =>
                        updateField(field.name, event.target.value)
                      }
                      placeholder={field.placeholder}
                      rows={5}
                      required
                      className="focus-glow min-h-32 w-full rounded-2xl border border-cyan-300/10 bg-[#031124]/70 px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-600"
                    />
                  ) : (
                    <input
                      name={field.name}
                      value={formData[field.name]}
                      onChange={(event) =>
                        updateField(field.name, event.target.value)
                      }
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

            {submittedAssessment && (
              <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5 text-sm leading-7 text-emerald-100">
                <div className="mb-2 flex items-center gap-2 font-black">
                  <CheckCircle2 className="h-5 w-5" />
                  Assessment saved successfully.
                </div>

                <p>
                  Agent <strong>{submittedAssessment.agentName}</strong> is now
                  connected to Dashboard and Test Forge.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/"
                    className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-center font-bold text-cyan-100 hover:bg-cyan-300/15"
                  >
                    View on Dashboard
                  </Link>

                  <Link
                    href="/test-forge"
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-center font-bold text-white"
                  >
                    Continue to Test Forge
                  </Link>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}



