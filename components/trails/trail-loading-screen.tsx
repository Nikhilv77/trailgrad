import { lobsterTwo } from "@/lib/fonts";

interface TrailLoadingScreenProps {
  message: string;
}

export function TrailLoadingScreen({ message }: TrailLoadingScreenProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fcfa] text-[#082f35]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#f7fcfa]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(86,190,174,0.16),transparent_43%)]" />
        <div className="tg-grid absolute inset-0 opacity-[0.045]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 text-center">
        <h1
          aria-live="polite"
          className={`${lobsterTwo.className} tg-analysis-copy tg-analysis-shine max-w-[860px] px-2 pb-8 pt-6 text-[42px] font-normal leading-[1.32] tracking-normal text-[#082f35] sm:text-[64px] sm:leading-[1.28]`}
        >
          {message}
        </h1>
      </section>

      <style jsx global>{`
        @keyframes tg-analysis-shine {
          0% {
            background-position: 140% 50%;
          }
          100% {
            background-position: -140% 50%;
          }
        }

        .tg-analysis-copy {
          display: block;
          overflow: visible;
          text-rendering: geometricPrecision;
        }

        @supports ((background-clip: text) or (-webkit-background-clip: text)) {
          .tg-analysis-shine {
            color: transparent;
            -webkit-text-fill-color: transparent;
            background-image: linear-gradient(
              100deg,
              #082f35 0%,
              #082f35 34%,
              #159b89 46%,
              #b7f4e9 50%,
              #159b89 54%,
              #082f35 66%,
              #082f35 100%
            );
            background-size: 260% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            animation: tg-analysis-shine 2.2s ease-in-out infinite;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tg-analysis-shine {
            animation: none !important;
            color: #082f35;
            -webkit-text-fill-color: #082f35;
          }
        }
      `}</style>
    </main>
  );
}
