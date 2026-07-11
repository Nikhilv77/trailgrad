import Image from "next/image";
import Link from "next/link";

import { lobsterTwo } from "@/lib/fonts";

interface SiteBrandProps {
  tone?: "ink" | "light";
  compact?: boolean;
  iconFrame?: boolean;
}

export function SiteBrand({ tone = "ink", compact = false, iconFrame = true }: SiteBrandProps) {
  const textColor = tone === "light" ? "text-white" : "text-[#103b37]";

  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center gap-2 rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#22b8a5]/45 focus-visible:ring-offset-2"
      aria-label="Trailgrad home"
    >
      <span
        className={`grid place-items-center overflow-hidden ${
          iconFrame ? "rounded-[10px] bg-[#dff8f2] shadow-[inset_0_0_0_1px_rgba(15,118,110,0.09)]" : ""
        } ${
          compact ? "size-8" : "size-9"
        }`}
      >
        <Image
          src="/images/brand/trailgrad-logo.png"
          alt=""
          width={64}
          height={64}
          className={iconFrame ? "h-[120%] w-[120%] max-w-none object-cover" : "h-full w-auto object-contain"}
          priority
        />
      </span>
      <span
        className={`${lobsterTwo.className} ${textColor} ${
          compact ? "text-[24px]" : "text-[27px]"
        } font-normal leading-none tracking-[-0.02em]`}
      >
        Trailgrad
      </span>
    </Link>
  );
}
