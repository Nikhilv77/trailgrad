"use client";

import { type MouseEvent as ReactMouseEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { HashLoader } from "react-spinners";

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const pathRef = useRef(pathname);
  const hideTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const navigateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }

      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
      }

      if (navigateTimerRef.current !== null) {
        window.clearTimeout(navigateTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const handleTransitionStart = () => setActive(true);

    window.addEventListener("trailgrad:route-transition-start", handleTransitionStart);

    return () => {
      window.removeEventListener("trailgrad:route-transition-start", handleTransitionStart);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    if (pathRef.current === pathname) {
      return;
    }

    pathRef.current = pathname;

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = window.setTimeout(() => setActive(false), 220);
  }, [pathname, reduceMotion]);

  function handleClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (reduceMotion || event.defaultPrevented || event.button !== 0) {
      return;
    }

    if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    const anchor = (event.target as Element | null)?.closest("a[href]");

    if (!anchor) {
      return;
    }

    const target = anchor.getAttribute("target");
    const href = anchor.getAttribute("href");

    if (!href || target === "_blank" || anchor.hasAttribute("download")) {
      return;
    }

    const url = new URL(href, window.location.href);

    if (
      url.origin !== window.location.origin ||
      (url.pathname === window.location.pathname && url.search === window.location.search)
    ) {
      return;
    }

    event.preventDefault();
    setActive(true);

    if (navigateTimerRef.current !== null) {
      window.clearTimeout(navigateTimerRef.current);
    }

    navigateTimerRef.current = window.setTimeout(() => {
      router.push(`${url.pathname}${url.search}${url.hash}`);
    }, 160);

    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
    }

    fallbackTimerRef.current = window.setTimeout(() => setActive(false), 1800);
  }

  return (
    <div onClickCapture={handleClick} className="min-h-full flex-1">
      {children}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[9999] overflow-hidden bg-[#f7fcfa] transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          active && !reduceMotion ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-[-12%] bg-[radial-gradient(circle_at_28%_28%,rgba(20,184,166,0.18),transparent_34%),radial-gradient(circle_at_74%_68%,rgba(15,118,110,0.12),transparent_38%),linear-gradient(135deg,#fbfefd_0%,#eff8f5_52%,#f9fcfb_100%)]" />
        <div className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center">
          <HashLoader
            color="#159b89"
            loading={active && !reduceMotion}
            size={54}
            speedMultiplier={0.9}
            cssOverride={{
              filter: "drop-shadow(0 16px 34px rgba(15, 118, 110, 0.16))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
