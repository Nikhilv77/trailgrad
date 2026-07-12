"use client";

import Image from "next/image";
import Link from "next/link";
import { Lobster_Two } from "next/font/google";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useEffect, useState } from "react";

const lobsterTwo = Lobster_Two({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  display: "swap",
});

function Brand() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center"
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

      <span
        className={`${lobsterTwo.className} text-[27px] font-semibold leading-none text-[#082f35]`}
      >
        Trailgrad
      </span>
    </Link>
  );
}

function TealBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#f7fcfa]" />
      <div className="tg-ambient-gradient absolute inset-[-18%]" />
      <div className="absolute inset-0 bg-white/20" />
    </div>
  );
}

function IntroScreen({ scene }: { scene: number }) {
  const hidden = scene >= 3;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[#f7fcfa]/95 transition-opacity duration-500 ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(86,190,174,0.18),transparent_43%)]" />

      <div className="relative z-10 flex min-h-[150px] w-full items-center justify-center px-6 text-center">
        <IntroHeading
          active={scene === 1}
          label="Don't get rejected in interviews."
          chunks={[
            { text: "Don't" },
            { text: "get" },
            { text: "rejected" },
            { text: "in" },
            { text: "interviews." },
          ]}
          className="text-[34px] sm:text-[56px]"
        />

        <IntroHeading
          active={scene === 2}
          label="Try Trailgrad."
          chunks={[{ text: "Try" }, { text: "Trailgrad.", accent: true }]}
          className="text-[36px] sm:text-[60px]"
        />
      </div>
    </div>
  );
}

function IntroHeading({
  active,
  label,
  chunks,
  className,
}: {
  active: boolean;
  label: string;
  chunks: Array<{ text: string; accent?: boolean }>;
  className: string;
}) {
  return (
    <h2
      aria-label={label}
      className={`${lobsterTwo.className} absolute max-w-[820px] font-normal leading-[1.08] tracking-normal text-[#082f35] transition-opacity duration-200 ${
        active ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {chunks.map((chunk, index) => (
        <span
          key={`${label}-${chunk.text}-${index}`}
          aria-hidden="true"
          className={`tg-intro-word inline-block ${active ? "tg-intro-word-active" : ""} ${
            chunk.accent ? "text-[#159b89]" : ""
          } ${index < chunks.length - 1 ? "mr-[0.22em]" : ""}`}
          style={{ animationDelay: `${index * 75}ms` }}
        >
          {chunk.text}
        </span>
      ))}
    </h2>
  );
}

function HeroStackImages({ visible }: { visible: boolean }) {
  return (
    <div
      className={`relative isolate mx-auto h-[320px] w-full max-w-[660px] overflow-visible transition-opacity duration-500 ease-out sm:h-[455px] sm:max-w-[800px] lg:h-[500px] lg:max-w-[900px] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute right-[5%] top-[10%] z-0 w-[55%] rotate-[2.4deg] opacity-[0.74] sm:right-[8%] sm:top-[1%] sm:w-[50%] lg:right-[9%] lg:w-[49%]">
        <div className="tg-preview-float-delayed rounded-[16px] border border-white/90 bg-white/55 p-1 shadow-[0_18px_44px_rgba(15,118,110,0.10)] backdrop-blur-[2px] sm:rounded-[22px]">
          <Image
            src="/images/landing/profile-preview-20260710.webp"
            alt="Trailgrad profile preview"
            width={1200}
            height={904}
            priority
            sizes="(max-width: 640px) 340px, (max-width: 1024px) 400px, 445px"
            className="h-auto w-full rounded-[12px] object-contain sm:rounded-[18px]"
          />
        </div>
      </div>

      <div className="absolute left-[7%] top-[30%] z-10 w-[66%] -rotate-[1.6deg] sm:left-[12%] sm:top-[17%] sm:w-[56%] lg:left-[13%] lg:top-[16%] lg:w-[55%]">
        <div className="tg-preview-float rounded-[18px] border border-white bg-white/65 p-1 shadow-[0_24px_58px_rgba(15,118,110,0.15)] backdrop-blur-[2px] sm:rounded-[24px]">
          <Image
            src="/images/landing/interview-dashboard-20260710.webp"
            alt="Trailgrad interview readiness dashboard preview"
            width={1200}
            height={900}
            priority
            sizes="(max-width: 640px) 390px, (max-width: 1024px) 450px, 495px"
            className="h-auto w-full rounded-[14px] object-contain sm:rounded-[20px]"
          />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timeoutId = window.setTimeout(() => setScene(7), 0);

      return () => window.clearTimeout(timeoutId);
    }

    const timers = [
      window.setTimeout(() => setScene(1), 320),
      window.setTimeout(() => setScene(0), 1600),
      window.setTimeout(() => setScene(2), 1950),
      window.setTimeout(() => setScene(3), 3000),
      window.setTimeout(() => setScene(4), 3250),
      window.setTimeout(() => setScene(5), 3550),
      window.setTimeout(() => setScene(6), 3920),
      window.setTimeout(() => setScene(7), 4400),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fcfa] text-[#082f35]">
      <TealBackground />
      <IntroScreen scene={scene} />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-5 pb-8 pt-7 sm:px-8 lg:px-10">
        <nav
          className={`flex h-[52px] items-center justify-between transition-opacity duration-500 ease-out ${
            scene >= 4
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <Brand />

          <Link
            href="/auth"
            className={buttonVariants({
              className:
                "h-[44px] w-[138px] gap-2 rounded-[12px] border border-[#118b7b]/10 px-0 text-[14px] font-semibold text-white shadow-[0_14px_30px_rgba(15,118,110,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,118,110,0.26)]",
            })}
            style={{
              background:
                "linear-gradient(135deg, #0f8f7e 0%, #20a995 100%)",
            }}
          >
            Start
            <ArrowRight className="size-4" />
          </Link>
        </nav>

        <div className="flex flex-1 flex-col items-center justify-center pb-6 pt-2 text-center sm:pt-4">
          <HeroStackImages visible={scene >= 5} />

          <div
            className={`mt-1 transition-opacity duration-500 ease-out sm:mt-2 lg:mt-3 ${
              scene >= 6 ? "opacity-100" : "opacity-0"
            }`}
          >
            <h1
              className={`${lobsterTwo.className} mx-auto max-w-[720px] text-[38px] font-normal leading-[0.98] tracking-[-0.015em] text-[#082f35] sm:text-[56px] lg:text-[64px]`}
            >
              Interview-ready before{" "}
              <span className="text-[#159b89]">you apply.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-7 text-[#587076] sm:text-[17px]">
              Resume review, project prep, mock practice, and AI feedback —
              all in one place.
            </p>
          </div>

          <div
            className={`mt-7 transition-opacity duration-500 ease-out ${
              scene >= 7
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            <Link
              href="/auth"
              className={buttonVariants({
                className:
                  "h-[56px] w-[210px] gap-2 rounded-[14px] border border-[#118b7b]/10 px-0 text-[15px] font-semibold text-white shadow-[0_20px_40px_rgba(15,118,110,0.23)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(15,118,110,0.29)]",
              })}
              style={{
                background:
                  "linear-gradient(135deg, #0f8f7e 0%, #22ab97 100%)",
              }}
            >
              Start Free Analysis
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        * {
          -webkit-font-smoothing: antialiased;
          text-rendering: geometricPrecision;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            animation: none !important;
          }
        }

        .tg-intro-word {
          opacity: 0;
          transform: translate3d(0, 16px, 0);
        }

        .tg-intro-word-active {
          animation: tg-intro-word-in 480ms cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }

        @keyframes tg-intro-word-in {
          from {
            opacity: 0;
            transform: translate3d(0, 16px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </main>
  );
}
