"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function ReadinessRing({
  score,
  size = "default",
}: {
  score: number;
  size?: "compact" | "default";
}) {
  const reduceMotion = usePrefersReducedMotion();
  const animatedScore = useMotionValue(reduceMotion ? score : 0);
  const [displayScore, setDisplayScore] = useState(reduceMotion ? score : 0);
  const outerSize = size === "compact" ? "size-[112px]" : "size-[126px]";
  const innerSize = size === "compact" ? "size-[82px]" : "size-[92px]";
  const scoreText = size === "compact" ? "text-[27px]" : "text-[32px]";
  const ringInset = size === "compact" ? "inset-1.5" : "inset-2";
  const visibleScore = reduceMotion ? score : displayScore;
  const ringBackground = useTransform(
    animatedScore,
    (value) =>
      `conic-gradient(from -90deg, #079985 0deg, #13b49f ${value * 3.6}deg, #e2f1ee ${value * 3.6}deg, #eef7f5 360deg)`,
  );

  useMotionValueEvent(animatedScore, "change", (latest) => {
    setDisplayScore(Math.round(latest));
  });

  useEffect(() => {
    if (reduceMotion) {
      animatedScore.set(score);
      return;
    }

    const controls = animate(animatedScore, score, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [animatedScore, reduceMotion, score]);

  return (
    <div className={`relative grid ${outerSize} shrink-0 place-items-center rounded-full bg-white`}>
      <motion.span
        className={`absolute ${ringInset} rounded-full`}
        style={{ background: ringBackground }}
      />
      <div className={`relative grid ${innerSize} place-items-center rounded-full bg-white text-center`}>
        <span>
          <strong className={`block ${scoreText} font-extrabold leading-none tracking-[-0.04em] text-[#10213e]`}>{visibleScore}%</strong>
          <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#66758f]">Ready</span>
        </span>
      </div>
    </div>
  );
}
