import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { WorkspaceReadyExperience } from "@/components/auth/workspace-ready-experience";
import {
  getAuthenticatedUserAppEntryPath,
  getSafeAppRedirectPath,
  getSingleSearchParam,
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
  const entryPath = await getAuthenticatedUserAppEntryPath({
    requestedRedirectUrl: redirectUrl,
  });

  if (!entryPath.authenticated) {
    redirect(entryPath.redirectPath);
  }

  return <WorkspaceReadyExperience redirectPath={entryPath.redirectPath} />;
}
