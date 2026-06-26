import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  Check,
  ChevronDown,
  Database,
  FileCheck2,
  FlaskConical,
  Gauge,
  Hourglass,
  KeyRound,
  LockKeyhole,
  Play,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Swords,
  UserRound,
  Vault,
  Zap,
  type LucideIcon,
} from "lucide-react";

/*
  AgentSeal Dashboard
  -------------------
  This is a static Phase 1 UI prototype.
  Later, these arrays can be replaced with real API/database data.
*/

type Tone = "cyan" | "green" | "blue" | "red" | "amber";

type StatCard = {
  label: string;
  value: string;
  sub: string;
  tone: Tone;
  icon: LucideIcon;
};

const navItems = [
  { label: "Overview", href: "/", icon: ShieldCheck },
  { label: "New Assessment", href: "/assessment", icon: FileCheck2 },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Test Forge", href: "/test-forge", icon: FlaskConical },
  { label: "Gladiator Engine", href: "/gladiator-engine", icon: Swords },
  { label: "Test Execution", href: "/test-execution", icon: Activity },
  { label: "RiskSeal", href: "/riskseal", icon: Gauge },
  { label: "Human Seal Gate", href: "/human-seal-gate", icon: UserRound },
  { label: "Evidence Vault", href: "/evidence-vault", icon: Vault },
  { label: "Release Certificate", href: "/release-certificate", icon: ShieldCheck },
];

const stats: StatCard[] = [
  { label: "Total Agents", value: "128", sub: "↑ 12 this week", icon: Bot, tone: "cyan" },
  { label: "Seal Granted", value: "78", sub: "61% of total", icon: ShieldCheck, tone: "green" },
  { label: "Under Review", value: "24", sub: "19% of total", icon: Hourglass, tone: "blue" },
  { label: "Blocked", value: "9", sub: "7% of total", icon: ShieldAlert, tone: "red" },
];

const pipeline = [
  { step: "1", label: "Intake", status: "Submitted", icon: FileCheck2 },
  { step: "2", label: "Test Forge", status: "Configured", icon: Database },
  { step: "3", label: "Gladiator", status: "Adversarial Testing", icon: Swords },
  { step: "4", label: "Execution", status: "Running", icon: Activity },
  { step: "5", label: "Human Gate", status: "In Review", icon: UserRound },
  { step: "6", label: "Release", status: "Seal Granted", icon: Shield },
];

const findings = [
  { name: "Prompt Injection", level: "Medium", count: 12, icon: ShieldAlert, color: "text-amber-300" },
  { name: "Data Exposure Risk", level: "Medium", count: 7, icon: LockKeyhole, color: "text-amber-300" },
  { name: "Policy Violation", level: "Low", count: 4, icon: ShieldCheck, color: "text-emerald-300" },
  { name: "PII Leakage", level: "Low", count: 2, icon: KeyRound, color: "text-emerald-300" },
  { name: "Hallucination Risk", level: "Low", count: 2, icon: Zap, color: "text-emerald-300" },
];

const reviewQueue = [
  ["Invoice Reconciliation Agent", "Pending Review", "v1.4.0", "text-amber-300"],
  ["KYC Verification Agent", "Pending Review", "v2.1.0", "text-amber-300"],
  ["Loan Underwriting Agent", "Risk Assessment", "v3.0.0", "text-blue-300"],
  ["Policy Compliance Agent", "Risk Assessment", "v1.8.2", "text-blue-300"],
];

const recentActivity = [
  ["Customer Refund Agent", "Seal Granted", "2h ago", "text-emerald-300"],
  ["Red team test completed", "High severity blocked", "4h ago", "text-rose-300"],
  ["New agent submitted", "Invoice Reconciliation Agent", "6h ago", "text-blue-300"],
  ["Policy updated", "PII Handling Policy v2.1", "1d ago", "text-cyan-300"],
];

function toneClasses(tone: Tone) {
  const classes: Record<Tone, string> = {
    cyan: "from-cyan-400/25 to-blue-500/20 text-cyan-200",
    green: "from-emerald-400/25 to-cyan-500/15 text-emerald-200",
    blue: "from-blue-400/25 to-cyan-500/10 text-blue-200",
    red: "from-rose-400/25 to-red-500/20 text-rose-200",
    amber: "from-amber-400/25 to-orange-500/15 text-amber-200",
  };

  return classes[tone];
}

function Ring({ type, value, label }: { type: "trust" | "policy" | "redteam"; value: string; label: string }) {
  const ringClass = type === "trust" ? "trust-ring" : type === "policy" ? "policy-ring" : "redteam-ring";

  return (
    <div className={`relative h-32 w-32 rounded-full ${ringClass} p-3 shadow-[0_0_42px_rgba(34,211,238,0.12)]`}>
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#06152b] text-center">
        <div className="text-3xl font-black text-white">{value}</div>
        <div className="text-[11px] text-slate-400">{label}</div>
      </div>
    </div>
  );
}

function CardTitle({ title, action = "View All" }: { title: string; action?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-black text-white">{title}</h2>
      <button className="text-xs font-semibold text-cyan-200 hover:text-cyan-100">{action}</button>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="grid-bg min-h-screen overflow-hidden">
      <div className="flex min-h-screen">
        {/* Sidebar navigation: every item is already connected to a route. */}
        <aside className="hidden w-72 shrink-0 border-r border-cyan-300/10 bg-[#031124]/85 p-5 backdrop-blur-xl xl:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/25 bg-cyan-300/10">
              <img src="/agentseal-logo.png" alt="AgentSeal logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight">
                Agent<span className="text-cyan-300">Seal</span>
              </div>
              <div className="text-xs text-slate-400">Proof before production</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = index === 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "border border-cyan-300/20 bg-cyan-300/10 text-white shadow-[0_0_24px_rgba(34,211,238,0.1)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-20 flex items-center gap-3 text-sm text-slate-400">
            <ChevronDown className="h-4 w-4 rotate-90" />
            Collapse
          </div>
        </aside>

        <section className="flex-1 p-5 lg:p-8">
          {/* Top bar: search, user, notification, and primary CTA. */}
          <header className="mb-7 flex items-center justify-between gap-6">
            <div className="relative hidden flex-1 md:block">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                className="glass-card focus-glow h-12 w-full max-w-3xl rounded-xl px-12 text-sm outline-none placeholder:text-slate-500"
                placeholder="Search agents, tests, policies, evidence..."
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-white/10 px-2 py-1 text-xs text-slate-500">⌘K</span>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <button className="relative rounded-xl border border-white/10 p-3 text-slate-300 hover:bg-white/5" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-400" />
              </button>

              <div className="hidden items-center gap-3 border-l border-white/10 pl-4 sm:flex">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-700 font-bold">AM</div>
                <div>
                  <div className="text-sm font-semibold">Alex Morgan</div>
                  <div className="text-xs text-slate-400">Platform Admin</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <Link href="/assessment" className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-[0_0_32px_rgba(34,211,238,0.24)] hover:from-blue-500 hover:to-cyan-400">
                Run Validation
                <Play className="h-4 w-4 fill-white" />
              </Link>
            </div>
          </header>

          <div className="mb-6">
            <h1 className="text-4xl font-black tracking-tight text-white">AgentSeal Trust Console</h1>
            <p className="mt-2 text-slate-300">Enterprise AI Agent Testing, Risk Governance, and Release Control</p>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-5">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div key={stat.label} className="glass-card rounded-2xl p-5">
                      <div className="flex items-center gap-5">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClasses(stat.tone)}`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-300">{stat.label}</div>
                          <div className="mt-1 text-3xl font-black text-white">{stat.value}</div>
                          <div className="mt-1 text-xs text-slate-400">{stat.sub}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-4">
                    <Ring type="trust" value="87" label="/100" />
                    <div>
                      <div className="text-sm font-bold text-slate-300">Trust Score</div>
                      <div className="mt-1 text-sm text-cyan-200">↑ 8 pts this week</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow pipeline shows the business flow from intake to seal. */}
              <div className="glass-card rounded-2xl p-5">
                <div className="grid gap-3 lg:grid-cols-6">
                  {pipeline.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.step} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4">
                        <div className="mb-3 flex items-center gap-3">
                          <Icon className="h-6 w-6 text-cyan-200" />
                          <div className="text-xs font-bold text-slate-300">{item.label}</div>
                        </div>
                        <div className="text-2xl font-black text-white">{item.step}</div>
                        <div className="text-xs text-slate-400">{item.status}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="grid gap-5 lg:grid-cols-[96px_1fr_260px] lg:items-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10">
                    <Bot className="h-14 w-14 text-cyan-200" />
                  </div>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-black">Customer Refund Agent</h2>
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                        Seal Granted
                      </span>
                    </div>
                    <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-5">
                      <div><span className="block text-slate-500">Owner</span>Support Automation</div>
                      <div><span className="block text-slate-500">Model</span>GPT-4o</div>
                      <div><span className="block text-slate-500">Version</span>v2.3.1</div>
                      <div><span className="block text-slate-500">Last Tested</span>May 16, 2025</div>
                      <div><span className="block text-slate-500">Environment</span>Production</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/10 bg-[#031124]/60 p-4">
                    <div className="text-sm font-bold text-slate-300">Primary Use Case</div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">Automates refund eligibility checks and creates customer service tickets.</p>
                    <Link href="/agents" className="mt-4 inline-flex w-full justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/15">
                      View Agent Profile
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-4">
                <div className="glass-card rounded-2xl p-5">
                  <CardTitle title="Overall Risk Score" action="" />
                  <div className="relative mx-auto mt-4 h-44 w-44 rounded-full risk-arc p-4">
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#06152b]">
                      <div className="text-5xl font-black">23</div>
                      <div className="text-xs text-slate-400">/100</div>
                      <div className="mt-1 text-sm font-bold text-emerald-300">Low Risk</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <CardTitle title="Top Findings" />
                  <div className="space-y-3">
                    {findings.map((finding) => {
                      const Icon = finding.icon;
                      return (
                        <div key={finding.name} className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-cyan-200" />
                            <span className="text-slate-300">{finding.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-bold ${finding.color}`}>{finding.level}</span>
                            <span className="text-slate-400">{finding.count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <CardTitle title="Policy Compliance" />
                  <div className="flex items-center gap-6">
                    <Ring type="policy" value="92%" label="Compliant" />
                    <div className="space-y-3 text-sm text-slate-300">
                      <div><span className="text-cyan-300">●</span> Compliant 92%</div>
                      <div><span className="text-amber-300">●</span> Partial 6%</div>
                      <div><span className="text-rose-300">●</span> Failed 2%</div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <CardTitle title="Red Team Outcomes" />
                  <div className="flex items-center gap-6">
                    <Ring type="redteam" value="78%" label="Resilient" />
                    <div className="space-y-3 text-sm text-slate-300">
                      <div><span className="text-cyan-300">●</span> Resilient 78%</div>
                      <div><span className="text-blue-300">●</span> Degraded 16%</div>
                      <div><span className="text-rose-300">●</span> Failed 6%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                  {[
                    "Security Hardened",
                    "Data Privacy Protected",
                    "Bias & Fairness Validated",
                    "Robustness Verified",
                    "Compliance Aligned",
                    "Human Oversight Confirmed",
                  ].map((signal) => (
                    <div key={signal} className="flex items-center gap-3 text-sm text-slate-300">
                      <Check className="h-5 w-5 rounded-full bg-emerald-300/10 p-1 text-emerald-300" />
                      {signal}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: release decision, queue, activity, evidence summary. */}
            <aside className="space-y-5">
              <div className="rounded-2xl border border-cyan-300/35 bg-gradient-to-br from-cyan-300/12 to-blue-600/10 p-6 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
                <h2 className="text-lg font-black">Release Decision</h2>
                <div className="mt-8 flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
                    <ShieldCheck className="h-12 w-12" />
                  </div>
                  <div>
                    <div className="text-3xl font-black text-emerald-300">Seal Granted</div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">This agent meets all trust and safety requirements.</p>
                  </div>
                </div>
                <Link href="/release-certificate" className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-4 text-sm font-black text-white hover:from-cyan-500 hover:to-blue-500">
                  View Release Certificate
                </Link>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <CardTitle title="Review Queue" />
                <div className="space-y-4">
                  {reviewQueue.map(([agent, status, version, color]) => (
                    <div key={agent} className="grid grid-cols-[1fr_auto_auto] gap-3 text-sm">
                      <span className="text-slate-200">{agent}</span>
                      <span className={color}>● {status}</span>
                      <span className="text-slate-400">{version}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <CardTitle title="Recent Activity" />
                <div className="space-y-4">
                  {recentActivity.map(([title, detail, time, color]) => (
                    <div key={`${title}-${time}`} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
                      <div>
                        <div className="text-slate-200">{title}</div>
                        <div className={color}>{detail}</div>
                      </div>
                      <span className="text-slate-400">{time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <CardTitle title="Evidence Summary" action="View Vault" />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Total Evidence", "1,248"],
                    ["Test Reports", "312"],
                    ["Screenshots", "523"],
                    ["Logs", "413"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-cyan-300/10 bg-[#031124]/55 p-4">
                      <FileCheck2 className="mb-5 h-5 w-5 text-cyan-200" />
                      <div className="text-xs text-slate-400">{label}</div>
                      <div className="mt-1 text-2xl font-black text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />
                  <p className="text-sm leading-6 text-amber-100">
                    Phase 1 is a front-end demo. Real UiPath workflow, backend, and database connection will be added in later phases.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
