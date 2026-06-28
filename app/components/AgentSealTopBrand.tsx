import Image from "next/image";
import Link from "next/link";

/**
 * AgentSealTopBrand
 * -----------------
 * Premium global header for AgentSeal.
 *
 * Logo adjustment:
 * - Badge size is balanced, not too big.
 * - Logo image is centered and visible.
 * - Brand text stays aligned with the logo.
 * - Header looks professional for dashboard/demo presentation.
 */
export default function AgentSealTopBrand() {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-300/10 bg-[#061427]/95 px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5">
        <Link
          href="/"
          aria-label="Go to AgentSeal dashboard"
          className="group flex min-w-0 items-center gap-4 rounded-3xl outline-none transition focus:ring-2 focus:ring-cyan-300/40"
        >
          {/* Balanced premium logo badge */}
          <div className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-200/95 via-white to-slate-200 shadow-[0_0_28px_rgba(34,211,238,0.22)] transition duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_0_38px_rgba(34,211,238,0.34)]">
            <div className="absolute inset-0 rounded-2xl bg-cyan-300/10 blur-xl" />

            <Image
              src="/logo.png"
              alt="AgentSeal logo"
              width={46}
              height={46}
              priority
              className="relative z-10 h-[46px] w-[46px] object-contain"
            />
          </div>

          {/* Brand text */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[30px] font-black leading-none tracking-tight text-white">
                Agent<span className="text-cyan-300">Seal</span>
              </h1>

              <span className="hidden items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-200 md:inline-flex">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />
                Active
              </span>
            </div>

            <p className="mt-2 text-[12px] font-black uppercase tracking-[0.34em] text-slate-400">
              TrustOps Release Gate
            </p>

            <p className="mt-1 hidden max-w-[680px] truncate text-sm text-slate-500 lg:block">
              AI agent validation, evidence control, release certification, and runtime monitoring
            </p>
          </div>
        </Link>

        {/* Right status panel */}
        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] px-5 py-3 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">
              Console Status
            </p>
            <p className="mt-1 text-sm font-black text-white">
              Production Ready
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-3 text-sm font-black text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.12)]">
            Readiness Console
          </div>
        </div>
      </div>
    </header>
  );
}

