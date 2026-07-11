import type { Metadata } from "next";

import { LoginExperience } from "@/components/auth/login-experience";

export const metadata: Metadata = {
  title: "Auth",
  description: "Sign in or create an account to continue building your interview readiness.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPage() {
  return <LoginExperience />;
}
