import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";

import { SiteBrand } from "@/components/marketing/site-brand";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The Trailgrad page you are looking for does not exist.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fcfa] px-5 py-6 text-[#123f3a] sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#f7fcfa]" />
        <div className="tg-ambient-gradient absolute inset-[-18%]" />
        <div className="absolute inset-0 bg-white/28" />
        <div className="tg-grid absolute inset-0 opacity-[0.09]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1120px] flex-col">
        <header className="flex items-center justify-between">
          <SiteBrand compact iconFrame={false} />
        </header>

        <section className="flex flex-1 items-center justify-center py-14 text-center">
          <div className="max-w-[620px]">
            <div className="mx-auto grid size-16 place-items-center rounded-[18px] bg-white/82 text-[#159b89] shadow-[0_20px_55px_rgba(15,118,110,0.14)]">
              <Compass className="size-8" />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#159b89]">404</p>
            <h1 className="mt-4 text-[44px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#123f3a] sm:text-[64px]">
              This trail goes nowhere.
            </h1>
            <p className="mx-auto mt-5 max-w-[460px] text-sm leading-7 text-[#607a75] sm:text-base">
              The page may have moved, or the link is pointing to a route Trailgrad does not use.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#119684] px-5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(15,118,110,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#0d7f72]"
              >
                <Home className="size-4" />
                Back home
              </Link>
              <Link
                href="/auth"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#d8e8e4] bg-white/78 px-5 text-sm font-semibold text-[#244943] transition-colors hover:bg-white"
              >
                Start analysis
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
