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
      aria-label="TrailGrad home"
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fcfb_0%,#f4faf8_45%,#fbfdfc_100%)]" />

      <div className="absolute left-[-190px] top-[-180px] h-[480px] w-[480px] rounded-full bg-[#91d9cf]/25 blur-[90px]" />

      <div className="absolute right-[-190px] top-[30px] h-[440px] w-[440px] rounded-full bg-[#bce9e2]/30 blur-[90px]" />

      <div className="absolute bottom-[-240px] left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[#d7f2ed]/55 blur-[100px]" />

      <div className="absolute left-[10%] top-[40%] h-[180px] w-[180px] rounded-full bg-white/70 blur-[70px]" />
    </div>
  );
}

function IntroScreen({ scene }: { scene: number }) {
  const hidden = scene >= 3;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 grid place-items-center bg-[#f7fcfa]/95 transition-opacity duration-700 ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(86,190,174,0.18),transparent_43%)]" />

      <div className="relative z-10 flex min-h-[150px] w-full items-center justify-center px-6 text-center">
        <h2
          className={`absolute max-w-[820px] text-[34px] font-semibold leading-[1.1] tracking-[-0.035em] text-[#082f35] transition-opacity duration-700 sm:text-[56px] ${
            scene === 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          Don&apos;t get rejected in interviews.
        </h2>

        <h2
          className={`absolute max-w-[820px] text-[36px] font-semibold leading-[1.1] tracking-[-0.035em] text-[#082f35] transition-opacity duration-700 sm:text-[60px] ${
            scene === 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          Try <span className="text-[#159b89]">Trailgrad.</span>
        </h2>
      </div>
    </div>
  );
}

function HeroStackImages({ visible }: { visible: boolean }) {
  return (
    <div
      className={`relative isolate mx-auto h-[350px] w-full max-w-[660px] overflow-visible transition-opacity duration-700 ease-out sm:h-[455px] sm:max-w-[800px] lg:h-[500px] lg:max-w-[900px] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute left-1/2 top-[48%] h-[58%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#bfe8e1]/30 blur-[65px]" />

      <div className="absolute bottom-[6%] left-[20%] h-[30%] w-[44%] rounded-full bg-white/70 blur-[55px]" />

      <div className="absolute right-[7%] top-[1%] z-0 w-[51%] rotate-[2.4deg] opacity-[0.74] sm:right-[8%] sm:w-[50%] lg:right-[9%] lg:w-[49%]">
        <div className="rounded-[16px] border border-white/90 bg-white/55 p-1 shadow-[0_18px_44px_rgba(15,118,110,0.10)] backdrop-blur-[2px] sm:rounded-[22px]">
          <Image
            src="/images/landing/profile-preview-20260710.webp"
            alt="TrailGrad profile preview"
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 640px) 340px, (max-width: 1024px) 400px, 445px"
            className="h-auto w-full rounded-[12px] object-contain sm:rounded-[18px]"
          />
        </div>
      </div>

      <div className="absolute left-[10%] top-[18%] z-10 w-[58%] -rotate-[1.6deg] sm:left-[12%] sm:top-[17%] sm:w-[56%] lg:left-[13%] lg:top-[16%] lg:w-[55%]">
        <div className="rounded-[18px] border border-white bg-white/65 p-1 shadow-[0_24px_58px_rgba(15,118,110,0.15)] backdrop-blur-[2px] sm:rounded-[24px]">
          <Image
            src="/images/landing/interview-dashboard-20260710.webp"
            alt="TrailGrad interview readiness dashboard preview"
            width={1536}
            height={1024}
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
    const timers = [
      window.setTimeout(() => setScene(1), 900),
      window.setTimeout(() => setScene(0), 3100),
      window.setTimeout(() => setScene(2), 4200),
      window.setTimeout(() => setScene(3), 5850),
      window.setTimeout(() => setScene(4), 6400),
      window.setTimeout(() => setScene(5), 7100),
      window.setTimeout(() => setScene(6), 8050),
      window.setTimeout(() => setScene(7), 9000),
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
          className={`flex h-[52px] items-center justify-between transition-opacity duration-700 ease-out ${
            scene >= 4
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <Brand />

          <Link
            href="/onboarding"
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
            className={`mt-1 transition-opacity duration-700 ease-out sm:mt-2 lg:mt-3 ${
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
            className={`mt-7 transition-opacity duration-700 ease-out ${
              scene >= 7
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            <Link
              href="/onboarding"
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
      `}</style>
    </main>
  );
}