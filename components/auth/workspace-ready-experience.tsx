"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { lobsterTwo } from "@/lib/fonts";

const readyMessage = "Getting things ready for you...";

const accentWords = new Set(["ready"]);

export function WorkspaceReadyExperience() {
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const introDelay = reduceMotion ? 0 : 560;
    const redirectDelay = reduceMotion ? 1600 : 5200;

    const introId = window.setTimeout(() => {
      setIntroComplete(true);
    }, introDelay);

    const redirectId = window.setTimeout(() => {
      router.replace("/dashboard");
    }, redirectDelay);

    return () => {
      window.clearTimeout(introId);
      window.clearTimeout(redirectId);
    };
  }, [reduceMotion, router]);

  const words = readyMessage.split(" ");

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f4fffc] px-6 text-center text-[#082f35]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="tg-ready-gradient tg-ready-gradient-one" />
        <div className="tg-ready-gradient tg-ready-gradient-two" />
        <div className="tg-ready-gradient tg-ready-gradient-three" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.66),rgba(255,255,255,0.18)_48%,rgba(255,255,255,0.72))]" />
      </div>

      <div className="relative z-10 grid min-h-[118px] w-full place-items-center">
        {introComplete ? (
          <h1
            aria-label={readyMessage}
            className={`${lobsterTwo.className} tg-ready-copy mx-auto min-h-[86px] max-w-[340px] text-[34px] font-normal leading-[1.08] tracking-normal sm:min-h-[98px] sm:max-w-[640px] sm:text-[42px] lg:min-h-[118px] lg:text-[52px]`}
          >
            <span className="tg-ready-phrase relative inline-block" data-ready-text={readyMessage}>
              {reduceMotion
                ? readyMessage
                : words.map((word, index) => {
                    const normalizedWord = word.toLowerCase().replace(/[.,!?]/g, "");

                    return (
                      <span
                        key={`${word}-${index}`}
                        aria-hidden="true"
                        className={`tg-ready-fade-word inline-block ${
                          accentWords.has(normalizedWord) ? "text-[#159b89]" : ""
                        } ${index < words.length - 1 ? "mr-[0.22em]" : ""}`}
                        style={{ animationDelay: `${index * 140}ms` }}
                      >
                        {word}
                      </span>
                    );
                  })}
            </span>
          </h1>
        ) : (
          <div
            aria-hidden="true"
            className="h-[3px] w-[180px] overflow-hidden rounded-full bg-[#d8eee9]"
          >
            <span className="tg-ready-entry-loader block h-full w-1/2 rounded-full bg-[#159b89]" />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes tg-ready-copy-in {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes tg-ready-fade-word {
          from {
            opacity: 0.18;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes tg-ready-float-one {
          from {
            transform: translate3d(-2%, -1%, 0) scale(1);
          }

          to {
            transform: translate3d(5%, 4%, 0) scale(1.08);
          }
        }

        @keyframes tg-ready-float-two {
          from {
            transform: translate3d(3%, 2%, 0) scale(1);
          }

          to {
            transform: translate3d(-4%, 5%, 0) scale(1.06);
          }
        }

        @keyframes tg-ready-float-three {
          from {
            transform: translate3d(0, 4%, 0) scale(1);
          }

          to {
            transform: translate3d(4%, -3%, 0) scale(1.1);
          }
        }

        .tg-ready-fade-word {
          opacity: 0.18;
          animation: tg-ready-fade-word 900ms ease-out both;
          will-change: opacity;
        }

        @keyframes tg-ready-shimmer {
          0% {
            opacity: 0;
            background-position: 155% 0;
          }

          18% {
            opacity: 0.42;
          }

          56% {
            opacity: 0.36;
          }

          78%,
          100% {
            opacity: 0;
            background-position: -95% 0;
          }
        }

        .tg-ready-phrase::after {
          content: attr(data-ready-text);
          position: absolute;
          inset: 0;
          display: block;
          color: transparent;
          pointer-events: none;
          background: linear-gradient(
            100deg,
            transparent 0%,
            transparent 30%,
            rgba(255, 255, 255, 0.48) 44%,
            rgba(153, 246, 228, 0.52) 52%,
            rgba(255, 255, 255, 0.32) 58%,
            transparent 72%,
            transparent 100%
          );
          background-size: 250% 100%;
          background-position: 155% 0;
          background-clip: text;
          -webkit-background-clip: text;
          animation: tg-ready-shimmer 2.6s ease-in-out 1.05s infinite;
          will-change: opacity, background-position;
        }

        .tg-ready-copy {
          animation: tg-ready-copy-in 220ms ease-out both;
        }

        .tg-ready-entry-loader {
          animation: tg-route-loader 880ms ease-in-out infinite;
        }

        .tg-ready-gradient {
          position: absolute;
          border-radius: 9999px;
          filter: blur(68px);
          opacity: 0.82;
          will-change: transform;
        }

        .tg-ready-gradient-one {
          top: -20%;
          left: -14%;
          width: max(48vw, 420px);
          height: max(48vw, 420px);
          background: radial-gradient(
            circle at 42% 42%,
            rgba(20, 184, 166, 0.36),
            rgba(94, 234, 212, 0.22) 44%,
            transparent 72%
          );
          animation: tg-ready-float-one 12s ease-in-out infinite alternate;
        }

        .tg-ready-gradient-two {
          top: 8%;
          right: -18%;
          width: max(52vw, 460px);
          height: max(52vw, 460px);
          background: radial-gradient(
            circle at 54% 48%,
            rgba(15, 118, 110, 0.22),
            rgba(125, 232, 218, 0.2) 46%,
            transparent 74%
          );
          animation: tg-ready-float-two 14s ease-in-out infinite alternate;
        }

        .tg-ready-gradient-three {
          right: 14%;
          bottom: -30%;
          width: max(42vw, 360px);
          height: max(42vw, 360px);
          background: radial-gradient(
            circle at 48% 50%,
            rgba(45, 212, 191, 0.25),
            rgba(153, 246, 228, 0.18) 48%,
            transparent 76%
          );
          animation: tg-ready-float-three 13s ease-in-out infinite alternate;
        }

        @media (prefers-reduced-motion: reduce) {
          .tg-ready-fade-word,
          .tg-ready-gradient {
            animation: none !important;
          }

          .tg-ready-phrase::after {
            display: none;
          }

          .tg-ready-fade-word {
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}
