import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface PrimaryCtaProps {
  children: ReactNode;
  href: string;
  size?: "nav" | "hero";
  className?: string;
}

const sizeClasses = {
  nav: "h-10 rounded-xl px-4 text-[13px]",
  hero: "h-13 rounded-[14px] px-5 text-sm sm:h-14 sm:px-6",
};

export function PrimaryCta({
  children,
  href,
  size = "hero",
  className = "",
}: PrimaryCtaProps) {
  return (
    <Link
      href={href}
      className={`${sizeClasses[size]} ${className} group inline-flex shrink-0 items-center justify-center gap-2 bg-[#123f3a] font-semibold text-white shadow-[0_14px_34px_rgba(16,63,58,0.22)] outline-none transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#0d332f] hover:shadow-[0_18px_38px_rgba(16,63,58,0.25)] focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/60 focus-visible:ring-offset-2 active:translate-y-px`}
    >
      {children}
      <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
