import type { Metadata } from "next";
import { headers } from "next/headers";

import { LoginExperience } from "@/components/auth/login-experience";
import {
  getSafeAppRedirectPath,
  getSingleSearchParam,
  redirectAuthenticatedUserAppropriately,
} from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Auth",
  description: "Sign in or create an account to continue building your interview readiness.",
  robots: {
    index: false,
    follow: false,
  },
};

interface AuthPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
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
    redirectSignedOut: false,
  });

  return <LoginExperience redirectUrl={redirectUrl} />;
}
