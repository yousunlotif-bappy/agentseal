import Link from "next/link";
import { ArrowLeft, Construction, type LucideIcon } from "lucide-react";

/*
  Reusable placeholder page
  -------------------------
  Phase 1 connects all routes so the project feels complete and no page shows 404.
  In later phases, each module will get its own full workflow screen.
*/

type ModuleTemplateProps = {
  title: string;
  uiPathRole: string;
  description: string;
  icon?: LucideIcon;
};

export default function ModuleTemplate({
  title,
  uiPathRole,
  description,
  icon: Icon = Construction,
}: ModuleTemplateProps) {
  return (
    <main className="grid-bg min-h-screen px-6 py-10 text-white">
      <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <section className="glass-card mx-auto mt-20 max-w-4xl rounded-3xl p-8 md:p-10">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
          <Icon className="h-11 w-11" />
        </div>

        <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">AgentSeal Module</p>
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">{description}</p>

        <div className="mt-8 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
          <p className="text-sm font-bold text-emerald-200">UiPath Mapping</p>
          <p className="mt-2 text-slate-300">{uiPathRole}</p>
        </div>
      </section>
    </main>
  );
}
