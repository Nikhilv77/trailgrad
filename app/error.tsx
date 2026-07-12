"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Home, RotateCw } from "lucide-react";

import { lobsterTwo } from "@/lib/fonts";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#22b8a5]/45 focus-visible:ring-offset-2"
            aria-label="Trailgrad home"
          >
            <Image
              src="/images/brand/trailgrad-logo.png"
              alt=""
              width={172}
              height={194}
              className="h-[34px] w-auto"
              priority
            />
            <span className={`${lobsterTwo.className} text-[27px] font-normal leading-none tracking-[-0.02em] text-[#103b37]`}>
              Trailgrad
            </span>
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-14 text-center">
          <div className="max-w-[620px]">
            <div className="mx-auto grid size-16 place-items-center rounded-[18px] bg-white/82 text-[#159b89] shadow-[0_20px_55px_rgba(15,118,110,0.14)]">
              <AlertTriangle className="size-8" />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#159b89]">
              Error
            </p>
            <h1 className="mt-4 text-[44px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#123f3a] sm:text-[64px]">
              Something went wrong.
            </h1>
            <p className="mx-auto mt-5 max-w-[480px] text-sm leading-7 text-[#607a75] sm:text-base">
              Trailgrad hit an unexpected issue while loading this page. Your saved data is still safe.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#119684] px-5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(15,118,110,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#0d7f72]"
              >
                <RotateCw className="size-4" />
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#d8e8e4] bg-white/78 px-5 text-sm font-semibold text-[#244943] transition-colors hover:bg-white"
              >
                <Home className="size-4" />
                Back home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
