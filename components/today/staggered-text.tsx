"use client";

import { motion, type Variants } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const textVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.14,
      staggerChildren: 0.09,
    },
  },
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.68,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function StaggeredText({
  highlightWords = [],
  text,
}: {
  highlightWords?: string[];
  text: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const words = text.split(" ");

  if (reduceMotion) {
    return (
      <>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={highlightWords.includes(word) ? "text-[#078f7c]" : undefined}
          >
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </>
    );
  }

  return (
    <motion.span
      aria-label={text}
      className="inline-block"
      initial="hidden"
      animate="visible"
      variants={textVariants}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden="true"
          className={`inline-block ${highlightWords.includes(word) ? "text-[#078f7c]" : ""}`}
          variants={wordVariants}
        >
          {word}
          {index < words.length - 1 ? "\u00a0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
