"use client";

import Image from "next/image";
import Link from "next/link";
import { Lobster_Two } from "next/font/google";
import { useEffect, useState } from "react";

import { ClerkLoginCard } from "@/components/auth/clerk-login-card";
import { LoginShowcase } from "@/components/auth/login-showcase";

const lobsterTwo = Lobster_Two({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  display: "swap",
});

const loginHeadlines = [
  "Continue building your interview readiness.",
  "Turn your experience into stronger interview proof.",
  "Know exactly what to improve before you apply.",
];

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Trailgrad home"
      className="flex shrink-0 items-center transition-opacity duration-300 hover:opacity-80"
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

function AnimatedLoginHeading() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updateMotionPreference() {
      setReduceMotion(mediaQuery.matches);
    }

    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHeadlineIndex(
        (currentIndex) => (currentIndex + 1) % loginHeadlines.length,
      );
    }, 5600);

    return () => window.clearTimeout(timeoutId);
  }, [headlineIndex, reduceMotion]);

  const headline = loginHeadlines[headlineIndex];
  const words = headline.split(" ");

  return (
    <div className="mx-auto mb-7 max-w-[650px] text-center sm:mb-8">
      <h1
        key={headlineIndex}
        aria-label={headline}
        className={`${lobsterTwo.className} mx-auto min-h-[76px] max-w-[650px] text-[36px] font-normal leading-[1.02] tracking-normal text-[#082f35] sm:min-h-[98px] sm:text-[48px]`}
      >
        {reduceMotion
          ? headline
          : words.map((word, index) => {
              const normalizedWord = word.toLowerCase().replace(/[.,!?]/g, "");

              const isAccent = [
                "interview",
                "readiness",
                "proof",
                "improve",
                "apply",
              ].includes(normalizedWord);

              return (
                <span
                  key={`${headlineIndex}-${word}-${index}`}
                  aria-hidden="true"
                  className={`tg-login-heading-word inline-block ${
                    isAccent ? "text-[#159b89]" : ""
                  } ${index < words.length - 1 ? "mr-[0.22em]" : ""}`}
                  style={{
                    animationDelay: `${180 + index * 140}ms`,
                  }}
                >
                  {word}
                </span>
              );
            })}
      </h1>

      <p className="mx-auto mt-3 max-w-[470px] text-[14px] leading-6 text-[#61787d] sm:text-[15px]">
        Sign in to access your resume analysis, readiness map, project
        preparation, and AI feedback.
      </p>
    </div>
  );
}

interface LoginExperienceProps {
  redirectUrl?: string | null;
}

export function LoginExperience({ redirectUrl }: LoginExperienceProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fcfa] text-[#082f35]">
      <LoginShowcase />

      <div className="relative z-10 flex min-h-screen flex-col px-5 pb-5 pt-6 sm:px-8 sm:pb-7 sm:pt-7 lg:px-10">
        <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between">
          <Brand />
        </header>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full">
            <AnimatedLoginHeading />

           <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[26px] border border-[#0f766e]/10 bg-white/88 p-5 backdrop-blur-2xl sm:p-6">
              <ClerkLoginCard redirectUrl={redirectUrl} />
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        * {
          -webkit-font-smoothing: antialiased;
          text-rendering: geometricPrecision;
        }

        @keyframes tg-login-heading-word {
          from {
            opacity: 0;
            transform: translate3d(0, 18px, 0);
            filter: blur(3px);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: blur(0);
          }
        }

        .tg-login-heading-word {
          opacity: 0;
          animation: tg-login-heading-word 850ms cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
          will-change: opacity, transform, filter;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }

          .tg-login-heading-word {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}
