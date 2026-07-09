import Link from "next/link";
import { ArrowRight, BadgeInfo, FileText, GitBranch, Link2, ShieldCheck, UploadCloud } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const steps = ["Career Stage", "Target Role", "Experience Level", "Interview Timeline", "Upload Details"];
const uploadCards = [
  { title: "Resume (PDF)", detail: "Upload your resume", icon: UploadCloud },
  { title: "Job Description", detail: "Paste or upload JD", icon: UploadCloud },
  { title: "Projects / GitHub", detail: "Add your projects", icon: GitBranch },
  { title: "Portfolio Link", detail: "https://yourportfolio.com", icon: Link2 },
  { title: "LinkedIn Profile", detail: "https://linkedin.com/in/you", icon: BadgeInfo },
  { title: "Any Other Info", detail: "Certificates, etc.", icon: FileText },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="grid size-6 place-items-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <ShieldCheck className="size-4" />
      </span>
      <span className="logo-script text-2xl font-semibold text-slate-950">TraiGrad</span>
    </Link>
  );
}

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] px-6 py-6 text-slate-950">
      <Brand />
      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <span className={`grid size-7 place-items-center rounded-full text-xs font-bold text-white ${index === 4 ? "bg-blue-700" : "bg-emerald-500"}`}>
                    {index + 1}
                  </span>
                  <span className={`text-sm font-medium ${index === 4 ? "text-blue-700" : "text-slate-600"}`}>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-blue-50 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold">Why we need this?</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  This helps our AI understand your background and provide accurate rejection risk analysis.
                </p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700">
                <ShieldCheck className="size-6" />
              </span>
            </div>
          </div>
        </aside>
        <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:p-10">
          <p className="text-sm text-slate-500">Step 5 of 5</p>
          <h1 className="mt-2 text-3xl font-bold">Upload your details</h1>
          <p className="mt-3 text-sm text-slate-500">The more details you provide, the better our analysis will be.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {uploadCards.map((card) => (
              <button key={card.title} className="group flex min-h-36 items-start justify-between rounded-xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                <span>
                  <span className="block text-sm font-bold">{card.title}</span>
                  <span className="mt-4 block text-xs text-slate-500">{card.detail}</span>
                </span>
                <span className="grid size-10 place-items-center rounded-full text-blue-700 ring-1 ring-blue-100 group-hover:bg-blue-50">
                  <card.icon className="size-5" />
                </span>
              </button>
            ))}
          </div>
          <div className="mt-10 flex justify-end">
            <Link href="/dashboard" className={buttonVariants({ className: "h-12 rounded-md bg-blue-700 px-8 hover:bg-blue-800" })}>
              Generate My Risk Report <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
