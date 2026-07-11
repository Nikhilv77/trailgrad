import type { Metadata } from "next";
import { headers } from "next/headers";

import {
  getSafeAppRedirectPath,
  getSingleSearchParam,
  redirectAuthenticatedUserAppropriately,
} from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Preparing your workspace",
  description: "Trailgrad is preparing your interview-readiness workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

interface AuthReadyPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuthReadyPage({ searchParams }: AuthReadyPageProps) {
  const params = searchParams ? await searchParams : {};
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const requestOrigin = host ? `${protocol}://${host}` : undefined;
  const redirectUrl = getSafeAppRedirectPath(
    getSingleSearchParam(params.redirect_url),
    requestOrigin,
  );

  await redirectAuthenticatedUserAppropriately({
    requestedRedirectUrl: redirectUrl,
  });

  return null;
}
