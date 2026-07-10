import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, TrendingUp } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { SiteBrand } from "@/components/marketing/site-brand";

export const metadata: Metadata = {
  title: "Log in — TrailGrad",
  description: "Continue building your interview readiness plan.",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf9] text-[#143d39]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(111,219,198,0.28),transparent_26%),radial-gradient(circle_at_92%_88%,rgba(240,184,110,0.16),transparent_24%)]" />
      <div className="tg-grid absolute inset-0 opacity-35" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1360px] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden px-12 py-10 lg:flex lg:flex-col xl:px-18 xl:py-12">
          <SiteBrand />

          <div className="flex flex-1 flex-col justify-center pb-12 pt-16">
            <div className="max-w-[580px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#cce8e1] bg-white/65 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#35786f]">
                <Sparkles className="size-3.5" /> Your workspace remembers the context
              </div>
              <h1 className="mt-6 text-[52px] font-semibold leading-[0.98] tracking-[-0.058em] text-[#123f3a] xl:text-[60px]">
                Pick up exactly where your prep left off.
              </h1>
              <p className="mt-6 max-w-[510px] text-[16px] leading-7 text-[#617b76]">
                Your readiness score, saved practice, and next best action are waiting in one focused workspace.
              </p>
            </div>

            <div className="relative mt-12 max-w-[560px]">
              <div className="absolute -inset-10 rounded-full bg-[#7bdbc8]/18 blur-[50px]" />
              <div className="relative overflow-hidden rounded-[26px] border border-white/90 bg-white/82 p-3 shadow-[0_28px_75px_rgba(25,85,76,0.16)] backdrop-blur-lg">
                <div className="rounded-[19px] bg-[#123f3a] p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">Weekly readiness</p>
                      <p className="mt-2 text-lg font-semibold">You’re gaining momentum.</p>
                    </div>
                    <span className="grid size-10 place-items-center rounded-xl bg-[#79dbc8]/15 text-[#7cdfcb]">
                      <TrendingUp className="size-5" />
                    </span>
                  </div>
                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <span className="text-5xl font-semibold tracking-[-0.06em]">72</span>
                      <span className="ml-2 text-sm text-white/45">/ 100</span>
                    </div>
                    <span className="rounded-full bg-[#79dbc8]/15 px-3 py-1.5 text-xs font-semibold text-[#8be3d2]">+8 this week</span>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full w-[72%] rounded-full bg-[#78dbc8]" />
                  </div>
                </div>

                <div className="grid gap-2.5 pt-3 sm:grid-cols-2">
                  {["RAG story tightened", "Resume proof added"].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 rounded-xl bg-[#f2f8f6] p-3 text-[11px] font-medium text-[#3c625c]">
                      <span className="grid size-6 place-items-center rounded-full bg-[#daf3ed] text-[#168372]">
                        <Check className="size-3" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tg-float absolute -right-5 -top-5 rounded-2xl border border-white bg-[#fff9ee] px-4 py-3 shadow-[0_18px_45px_rgba(80,69,39,0.12)]">
                <p className="text-[9px] uppercase tracking-[0.12em] text-[#a18759]">Next action</p>
                <p className="mt-1 text-xs font-semibold text-[#5d4a2d]">12 min mock practice</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#809591]">© 2026 TrailGrad · Your career data stays private.</p>
        </section>

        <section className="relative flex items-center justify-center px-5 py-8 sm:px-8 lg:bg-white/48 lg:px-12">
          <div className="w-full max-w-[460px]">
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <SiteBrand compact />
              <Link href="/" className="text-xs font-semibold text-[#4a706a] hover:text-[#183f3a]">Back home</Link>
            </div>

            <div className="rounded-[28px] border border-white bg-white/88 p-6 shadow-[0_26px_80px_rgba(23,77,69,0.11)] backdrop-blur-xl sm:p-9 lg:border-[#e2ece9] lg:shadow-[0_24px_70px_rgba(23,77,69,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#239381]">Welcome back</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#153f3a] sm:text-[36px]">Continue your trail.</h2>
              <p className="mt-3 text-sm leading-6 text-[#758985]">Log in to see today’s highest-impact next step.</p>

              <LoginForm />

              <p className="mt-7 text-center text-sm text-[#718581]">
                New to TrailGrad?{" "}
                <Link className="font-semibold text-[#168573] hover:underline" href="/onboarding">
                  Create your workspace
                </Link>
              </p>
            </div>

            <p className="mx-auto mt-6 max-w-sm text-center text-[11px] leading-5 text-[#8b9d99]">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
