import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Readiness workspace",
  description: "Track interview readiness, close rejection risks, and practice what matters next.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  redirect(DEFAULT_AUTHENTICATED_ROUTE);
}
