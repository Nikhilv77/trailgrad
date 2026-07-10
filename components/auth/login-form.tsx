"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    router.push("/dashboard");
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[13px] font-semibold text-[#234943]">
          Work email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          className="h-12 rounded-xl border-[#d7e6e2] bg-[#fbfdfc] px-4 text-[#193f3a] placeholder:text-[#a0b0ad] focus-visible:border-[#49ad9f] focus-visible:ring-[#61c9b8]/18"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password" className="text-[13px] font-semibold text-[#234943]">
            Password
          </Label>
          <a href="#" className="text-[12px] font-semibold text-[#218b7c] hover:text-[#176e63] hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            className="h-12 rounded-xl border-[#d7e6e2] bg-[#fbfdfc] px-4 pr-12 text-[#193f3a] placeholder:text-[#a0b0ad] focus-visible:border-[#49ad9f] focus-visible:ring-[#61c9b8]/18"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[#78908b] outline-none transition-colors hover:bg-[#edf7f4] hover:text-[#205c54] focus-visible:ring-2 focus-visible:ring-[#49ad9f]/45"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-xl bg-[#123f3a] text-sm font-semibold text-white shadow-[0_14px_30px_rgba(18,63,58,0.18)] hover:bg-[#0d332f]"
      >
        {submitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" /> Opening workspace
          </>
        ) : (
          <>
            Continue to workspace <ArrowRight className="size-4" />
          </>
        )}
      </Button>

      <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[#99aaa7]">
        <span className="h-px flex-1 bg-[#e0ebe8]" />
        or
        <span className="h-px flex-1 bg-[#e0ebe8]" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full rounded-xl border-[#d7e6e2] bg-white text-sm font-semibold text-[#244943] hover:bg-[#f4faf8]"
      >
        <span className="grid size-5 place-items-center rounded-full bg-[conic-gradient(from_-45deg,#4285f4_0_25%,#34a853_0_50%,#fbbc05_0_75%,#ea4335_0)] text-[10px] font-bold text-white">
          G
        </span>
        Continue with Google
      </Button>
    </form>
  );
}
