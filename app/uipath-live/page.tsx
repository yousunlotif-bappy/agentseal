"use client";

import { useState } from "react";

type ResultState = {
  title: string;
  data: unknown;
};

const API_BASE =
  process.env.NEXT_PUBLIC_AGENTSEAL_API_URL || "http://127.0.0.1:8000";

export default function UiPathLivePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function callApi(
    title: string,
    path: string,
    method: "GET" | "POST" = "GET",
    body?: unknown
  ) {
    setLoading(title);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const text = await response.text();
      let data: unknown;

      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string" ? data : JSON.stringify(data, null, 2)
        );
      }

      setResult({ title, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            AgentSeal Live Proof
          </p>

          <h1 className="text-3xl font-bold md:text-5xl">
            UiPath Live Integration
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            This page connects the Vercel frontend to the Render FastAPI backend,
            then starts and verifies a real UiPath Orchestrator job.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              onClick={() =>
                callApi(
                  "Config Check",
                  "/api/uipath/live/config-check",
                  "GET"
                )
              }
              className="rounded-2xl bg-slate-800 px-5 py-4 text-left font-semibold hover:bg-slate-700"
            >
              1. Config Check
              <span className="block text-sm font-normal text-slate-400">
                Verify backend environment variables
              </span>
            </button>

            <button
              onClick={() =>
                callApi(
                  "OAuth Token Test",
                  "/api/uipath/live/token-test",
                  "POST"
                )
              }
              className="rounded-2xl bg-slate-800 px-5 py-4 text-left font-semibold hover:bg-slate-700"
            >
              2. Token Test
              <span className="block text-sm font-normal text-slate-400">
                Request UiPath OAuth access token
              </span>
            </button>

            <button
              onClick={() =>
                callApi(
                  "Start Release Gate",
                  "/api/uipath/live/start-release-gate",
                  "POST",
                  {}
                )
              }
              className="rounded-2xl bg-cyan-600 px-5 py-4 text-left font-semibold hover:bg-cyan-500"
            >
              3. Start UiPath Job
              <span className="block text-sm font-normal text-cyan-100">
                Start Maestro BPMN release gate
              </span>
            </button>

            <button
              onClick={() =>
                callApi(
                  "Latest Jobs",
                  "/api/uipath/live/jobs/latest",
                  "GET"
                )
              }
              className="rounded-2xl bg-slate-800 px-5 py-4 text-left font-semibold hover:bg-slate-700"
            >
              4. Latest Jobs
              <span className="block text-sm font-normal text-slate-400">
                Load recent UiPath Orchestrator jobs
              </span>
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-black/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {loading ? `Running: ${loading}` : result?.title || "Result"}
              </h2>
              <span className="text-xs text-slate-400">
                API: {API_BASE}
              </span>
            </div>

            {loading && (
              <p className="text-cyan-300">Please wait, request running...</p>
            )}

            {error && (
              <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-red-950/50 p-4 text-sm text-red-200">
                {error}
              </pre>
            )}

            {result && (
              <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm text-slate-200">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}

            {!loading && !error && !result && (
              <p className="text-slate-400">
                Click any button above to run a live integration test.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

