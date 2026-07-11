"use client";

import Image from "next/image";

export function LoginShowcase() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#f7fcfa]" />

      <div className="tg-login-ambient absolute inset-[-20%]" />

      <div className="absolute inset-0 bg-white/12" />

      <div className="absolute inset-0 opacity-[0.42] [background-image:linear-gradient(rgba(15,118,110,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.035)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <div className="absolute left-[-110px] top-[19%] size-[320px] rounded-full bg-[#8de2d3]/20 blur-[95px] sm:left-[-80px] sm:size-[430px]" />

      <div className="absolute right-[-120px] top-[7%] size-[360px] rounded-full bg-[#71d7c7]/18 blur-[110px] sm:right-[-80px] sm:size-[480px]" />

      <div className="absolute bottom-[-190px] left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-[#b7eee5]/30 blur-[120px]" />

      <div className="tg-login-preview-left absolute left-[-7%] top-[27%] hidden w-[390px] -rotate-[4deg] opacity-[0.42] lg:block xl:left-[-2%] xl:w-[430px]">
        <div className="rounded-[24px] border border-white/80 bg-white/48 p-1.5 shadow-[0_28px_70px_rgba(15,118,110,0.11)] backdrop-blur-[2px]">
          <Image
            src="/images/landing/profile-preview-20260710.webp"
            alt=""
            width={1200}
            height={904}
            sizes="440px"
            className="h-auto w-full rounded-[20px]"
            loading="eager"
          />
        </div>
      </div>

      <div className="tg-login-preview-right absolute right-[-7%] top-[35%] hidden w-[420px] rotate-[4deg] opacity-[0.4] lg:block xl:right-[-2%] xl:w-[470px]">
        <div className="rounded-[24px] border border-white/80 bg-white/48 p-1.5 shadow-[0_28px_70px_rgba(15,118,110,0.11)] backdrop-blur-[2px]">
          <Image
            src="/images/landing/interview-dashboard-20260710.webp"
            alt=""
            width={1200}
            height={900}
            sizes="500px"
            className="h-auto w-full rounded-[20px]"
            loading="eager"
          />
        </div>
      </div>

      <div className="absolute left-[8%] top-[14%] hidden size-2 rounded-full bg-[#159b89]/30 lg:block" />
      <div className="absolute left-[14%] top-[65%] hidden size-3 rounded-full border border-[#159b89]/25 lg:block" />
      <div className="absolute right-[12%] top-[24%] hidden size-2 rounded-full bg-[#159b89]/24 lg:block" />
      <div className="absolute bottom-[17%] right-[18%] hidden size-4 rounded-full border border-[#159b89]/20 lg:block" />

      <style jsx global>{`
        .tg-login-ambient {
          background:
            radial-gradient(
              circle at 50% 38%,
              rgba(255, 255, 255, 0.9),
              transparent 28%
            ),
            radial-gradient(
              circle at 20% 35%,
              rgba(83, 195, 178, 0.25),
              transparent 31%
            ),
            radial-gradient(
              circle at 82% 48%,
              rgba(105, 214, 200, 0.27),
              transparent 32%
            ),
            radial-gradient(
              circle at 50% 94%,
              rgba(199, 241, 234, 0.55),
              transparent 34%
            );
          animation: tg-login-ambient-move 12s ease-in-out infinite alternate;
          will-change: transform;
        }

        .tg-login-preview-left {
          animation: tg-login-preview-left 8s ease-in-out infinite alternate;
          will-change: transform;
        }

        .tg-login-preview-right {
          animation: tg-login-preview-right 9s ease-in-out infinite alternate;
          will-change: transform;
        }

        @keyframes tg-login-ambient-move {
          from {
            transform: translate3d(-1%, -1%, 0) scale(1);
          }

          to {
            transform: translate3d(1%, 1%, 0) scale(1.025);
          }
        }

        @keyframes tg-login-preview-left {
          from {
            transform: translate3d(0, -6px, 0) rotate(-7deg);
          }

          to {
            transform: translate3d(10px, 9px, 0) rotate(-5.8deg);
          }
        }

        @keyframes tg-login-preview-right {
          from {
            transform: translate3d(0, 7px, 0) rotate(6deg);
          }

          to {
            transform: translate3d(-10px, -8px, 0) rotate(4.8deg);
          }
        }
      `}</style>
    </div>
  );
}