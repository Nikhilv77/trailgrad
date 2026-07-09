import Link from "next/link";
import { Check, Eye, FileText, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/20">
        <ShieldCheck className="size-5" />
      </span>
      <span className="logo-script text-4xl font-semibold text-white">TraiGrad</span>
    </Link>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-white text-slate-950 lg:grid-cols-[0.82fr_1.18fr]">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_70%_40%,#213de8_0%,#101c84_38%,#07113d_82%)] px-10 py-14 text-white lg:px-16">
        <Brand />
        <div className="mt-16 max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">Your AI coach for resume, projects and interviews.</h1>
        </div>
        <div className="relative mx-auto mt-16 h-72 max-w-md">
          <div className="absolute left-10 top-10 grid size-16 rotate-[-8deg] place-items-center rounded-2xl bg-white/15 text-white shadow-2xl backdrop-blur">
            <FileText className="size-8" />
          </div>
          <div className="absolute right-16 top-2 grid size-12 place-items-center rounded-full bg-white/10 text-blue-100 ring-1 ring-white/15">
            <ShieldCheck className="size-6" />
          </div>
          <div className="absolute right-12 top-24 grid size-16 rotate-6 place-items-center rounded-2xl bg-blue-500/40 text-white shadow-2xl">
            <Check className="size-8" />
          </div>
          <div className="absolute bottom-14 right-20 grid size-16 place-items-center rounded-2xl bg-white/15 text-white">
            <MessageSquare className="size-8" />
          </div>
          <div className="absolute left-1/2 top-24 h-40 w-36 -translate-x-1/2 rounded-t-full bg-blue-300/20" />
          <div className="absolute left-1/2 top-20 size-20 -translate-x-1/2 rounded-full bg-[#ffc7ac]" />
          <div className="absolute left-1/2 top-40 h-24 w-40 -translate-x-1/2 rounded-[34px] bg-[#7aa7ff]" />
          <div className="absolute left-[46%] top-48 h-16 w-48 -translate-x-1/2 rotate-[-10deg] rounded-full bg-[#a9c3ff]" />
          <div className="absolute left-1/2 top-52 h-16 w-40 -translate-x-1/2 rounded-xl bg-slate-900/80 shadow-2xl" />
          <div className="absolute left-1/2 top-60 h-3 w-28 -translate-x-1/2 rounded-full bg-blue-200/60" />
        </div>
        <p className="absolute bottom-12 left-16 text-xs text-white/55">© 2024 TrailGrad. All rights reserved.</p>
      </section>
      <section className="grid place-items-center bg-[#fbfcff] px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-10 shadow-[0_24px_80px_rgba(15,23,42,0.09)]">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="mt-2 text-sm text-slate-500">Login to your account</p>
          <form className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label>Email address</Label>
              <Input placeholder="you@example.com" className="h-12 rounded-md" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input type="password" placeholder="••••••••" className="h-12 rounded-md pr-11" />
                <Eye className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              <div className="text-right">
                <a className="text-xs font-semibold text-blue-600" href="#">Forgot password?</a>
              </div>
            </div>
            <Link href="/dashboard" className={buttonVariants({ className: "h-12 w-full rounded-md bg-blue-700 hover:bg-blue-800" })}>Log in</Link>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or continue with
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <Button variant="outline" className="h-12 w-full rounded-md bg-white">
            <span className="mr-2 text-lg font-bold text-red-500">G</span>
            Continue with Google
          </Button>
          <p className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account? <Link className="font-semibold text-blue-600" href="/onboarding">Sign up</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
