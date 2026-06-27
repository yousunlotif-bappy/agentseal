"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Database,
  FileJson,
  Gauge,
  RefreshCcw,
  Server,
  ShieldCheck,
  Terminal,
  XCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * Backend Health Check Page
 * -------------------------
 * This page calls every mock API route and checks:
 * - API response status
 * - JSON response shape
 * - ok flag
 * - resource name
 * - approximate data count
 *
 * It is not a real backend server yet.
 * It is a Next.js mock backend layer inside the same app.
 */

type EndpointResult = {
  ok: boolean;
  status: number;
  resource?: string;
  count: number;
  error?: string;
};

type ApiResponse = {
  ok?: boolean;
  resource?: string;
  data?: unknown;
};

type EndpointConfig = {
  label: string;
  href: string;
  detail: string;
};

const endpoints: EndpointConfig[] = [
  {
    label: "Assessment",
    href: "/api/agentseal/assessment",
    detail: "Agent intake, policy, tools, reviewer, and endpoint",
  },
  {
    label: "Test Forge",
    href: "/api/agentseal/test-forge",
    detail: "Generated test cases from business rules",
  },
  {
    label: "Gladiator Engine",
    href: "/api/agentseal/red-team",
    detail: "Generated red-team adversarial prompts",
  },
  {
    label: "Test Execution",
    href: "/api/agentseal/execution",
    detail: "Pass, fail, blocked, and evidence results",
  },
  {
    label: "RiskSeal",
    href: "/api/agentseal/riskseal",
    detail: "Risk score, release decision, and route",
  },
  {
    label: "Human Review",
    href: "/api/agentseal/human-review",
    detail: "Reviewer decision and approval notes",
  },
  {
    label: "Evidence Vault",
    href: "/api/agentseal/evidence",
    detail: "Audit-ready evidence package metadata",
  },
  {
    label: "Release Certificate",
    href: "/api/agentseal/certificate",
    detail: "Production certificate and seal metadata",
  },
  {
    label: "LiveSeal Monitor",
    href: "/api/agentseal/liveseal",
    detail: "Runtime health, drift, and monitoring signals",
  },
  {
    label: "Full Story",
    href: "/api/agentseal/story",
    detail: "Complete mock backend payload",
  },
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Count helper.
 * This gives a useful number for the health page without needing exact schemas.
 */
function getPayloadCount(data: unknown): number {
  if (Array.isArray(data)) return data.length;

  if (!isObject(data)) return data ? 1 : 0;

  if (Array.isArray(data.cases)) return data.cases.length;
  if (Array.isArray(data.prompts)) return data.prompts.length;
  if (Array.isArray(data.results)) return data.results.length;
  if (Array.isArray(data.artifacts)) return data.artifacts.length;
  if (Array.isArray(data.signals)) return data.signals.length;
  if (Array.isArray(data.gates)) return data.gates.length;

  return Object.keys(data).length;
}

function toneClass(tone: "cyan" | "blue" | "green" | "rose") {
  const tones = {
    cyan: "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200",
    blue: "border-blue-300/20 bg-blue-300/[0.06] text-blue-200",
    green: "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200",
    rose: "border-rose-300/20 bg-rose-300/[0.06] text-rose-200",
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
  tone: "cyan" | "blue" | "green" | "rose";
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

export default function BackendHealthPage() {
  const [results, setResults] = useState<Record<string, EndpointResult>>({});
  const [loading, setLoading] = useState(false);

  async function checkEndpoints() {
    setLoading(true);

    const nextResults: Record<string, EndpointResult> = {};

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.href, {
          cache: "no-store",
        });

        const json = (await response.json()) as ApiResponse;

        nextResults[endpoint.label] = {
          ok: Boolean(json.ok) && response.ok,
          status: response.status,
          resource: json.resource,
          count: getPayloadCount(json.data),
        };
      } catch (error) {
        nextResults[endpoint.label] = {
          ok: false,
          status: 500,
          count: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    setResults(nextResults);
    setLoading(false);
  }

  useEffect(() => {
    checkEndpoints();
  }, []);

  const passed = Object.values(results).filter((item) => item.ok).length;
  const total = endpoints.length;
  const allPassed = passed === total && total > 0;

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
                AgentSeal Mock Backend
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
                Backend Data Health Check
              </h1>

              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                Validate that the AgentSeal demo now has working Next.js API
                routes, shared mock data, and a backend-style health check page.
              </p>
            </div>
          </div>

          <button
            onClick={checkEndpoints}
            className="flex w-fit items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-black text-white"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            Recheck APIs
          </button>
        </header>

        <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Server}
            label="API Routes"
            value={`${passed}/${total}`}
            note="Connected endpoints"
            tone={allPassed ? "green" : "cyan"}
          />

          <MetricCard
            icon={Database}
            label="Data Source"
            value="Mock"
            note="Shared TypeScript data"
            tone="blue"
          />

          <MetricCard
            icon={ShieldCheck}
            label="Backend Mode"
            value="Next API"
            note="App Router route handlers"
            tone="green"
          />

          <MetricCard
            icon={Gauge}
            label="Health"
            value={allPassed ? "Healthy" : "Checking"}
            note="Frontend + mock backend"
            tone={allPassed ? "green" : "rose"}
          />
        </section>

        <section className="glass-card mb-6 rounded-3xl p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">Mock API Endpoints</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                These routes make the demo more believable because the UI now
                has a backend-style data layer.
              </p>
            </div>

            <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-200">
              /api/agentseal/*
            </span>
          </div>

          <div className="grid gap-4">
            {endpoints.map((endpoint) => {
              const result = results[endpoint.label];

              return (
                <div
                  key={endpoint.href}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          result?.ok
                            ? "bg-emerald-300/10 text-emerald-300"
                            : "bg-slate-700/50 text-slate-300"
                        }`}
                      >
                        {result?.ok ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <XCircle className="h-6 w-6" />
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-white">
                          {endpoint.label}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {endpoint.detail}
                        </p>

                        <Link
                          href={endpoint.href}
                          target="_blank"
                          className="mt-2 inline-flex text-sm font-bold text-cyan-200 hover:text-cyan-100"
                        >
                          {endpoint.href}
                        </Link>

                        {result?.error && (
                          <p className="mt-2 text-sm text-rose-300">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center sm:min-w-[330px]">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                          Status
                        </p>
                        <p className="mt-1 font-black text-white">
                          {result ? result.status : "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                          Count
                        </p>
                        <p className="mt-1 font-black text-white">
                          {result ? result.count : "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                          OK
                        </p>
                        <p
                          className={`mt-1 font-black ${
                            result?.ok ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {result ? String(result.ok) : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <div className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <Terminal className="h-7 w-7 text-cyan-300" />
              <h2 className="text-2xl font-black">How to Test API Directly</h2>
            </div>

            <div className="space-y-3 text-sm leading-7 text-slate-300">
              <p>Open these URLs in browser:</p>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-cyan-100">
                http://localhost:3000/api/agentseal/story
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-cyan-100">
                http://localhost:3000/api/agentseal/liveseal
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="mb-5 flex items-center gap-3">
              <Cloud className="h-7 w-7 text-cyan-300" />
              <h2 className="text-2xl font-black">What This Phase Completes</h2>
            </div>

            <div className="space-y-4">
              {[
                "Mock backend API routes are created.",
                "Shared backend-style mock data is available.",
                "Backend Health Check page can validate all API routes.",
                "Full AgentSeal workflow can now be shown as API-backed demo.",
                "Future FastAPI or UiPath integration has clear route mapping.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.05] p-4"
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                  <p className="text-sm leading-6 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5 text-sm leading-6 text-emerald-100 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Activity className="mt-1 h-5 w-5 shrink-0" />
            <p>
              Mock Backend API phase completed. The AgentSeal frontend now has a
              backend-style API layer and health check page.
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
      </div>
    </main>
  );
}



