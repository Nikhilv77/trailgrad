import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  AUTH_ROUTE,
  DEFAULT_AUTHENTICATED_ROUTE,
  ONBOARDING_ROUTE,
} from "@/lib/auth/routes";
import {
  getOrCreateTrailgradProfile,
  readTrailgradOnboardingStatus,
  type TrailgradOnboardingStatus,
  type TrailgradProfileRecord,
} from "@/lib/services/profile-service";

export {
  AUTH_READY_ROUTE,
  AUTH_ROUTE,
  DEFAULT_AUTHENTICATED_ROUTE,
  ONBOARDING_ROUTE,
  SIGN_OUT_REDIRECT_URL,
} from "@/lib/auth/routes";

const appRoutePrefixes = [
  "/today",
  "/readiness",
  "/projects",
  "/practice",
  "/profile",
] as const;

const hasClerkServerConfig = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export interface AuthenticatedTrailgradUser {
  userId: string;
  profile: TrailgradProfileRecord;
}

export function isProtectedAppPath(pathname: string) {
  return appRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function getSingleSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function getSafeReturnPath(
  value: string | undefined | null,
  allowedOrigin = "https://trailgrad.local",
) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value, allowedOrigin);

    if (url.origin !== allowedOrigin) {
      return null;
    }

    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) {
      return null;
    }

    if (url.pathname === AUTH_ROUTE || url.pathname.startsWith(`${AUTH_ROUTE}/`)) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function getSafeAppRedirectPath(
  value: string | undefined | null,
  allowedOrigin?: string,
) {
  const safeReturnPath = getSafeReturnPath(value, allowedOrigin);

  if (!safeReturnPath) {
    return null;
  }

  const url = new URL(safeReturnPath, "https://trailgrad.local");

  return isProtectedAppPath(url.pathname) ? safeReturnPath : null;
}

export function withRedirectParam(route: string, redirectPath?: string | null) {
  if (!redirectPath) {
    return route;
  }

  const params = new URLSearchParams({ redirect_url: redirectPath });
  return `${route}?${params.toString()}`;
}

export async function requireAuthenticatedUser(options?: {
  returnBackUrl?: string | null;
}): Promise<AuthenticatedTrailgradUser> {
  const returnBackUrl = getSafeReturnPath(options?.returnBackUrl);

  if (!hasClerkServerConfig) {
    redirect(withRedirectParam(AUTH_ROUTE, returnBackUrl));
  }

  const authObject = await auth();

  if (!authObject.userId) {
    authObject.redirectToSignIn({
      returnBackUrl: returnBackUrl ?? DEFAULT_AUTHENTICATED_ROUTE,
    });

    throw new Error("Authentication redirect did not complete.");
  }

  const userId = authObject.userId;
  const profile = await getOrCreateTrailgradProfile(userId);

  return {
    userId,
    profile,
  };
}

export async function readOnboardingStatus(
  userId: string,
): Promise<TrailgradOnboardingStatus> {
  return readTrailgradOnboardingStatus(userId);
}

export async function requireCompletedOnboarding(options: {
  currentPath: string;
}): Promise<AuthenticatedTrailgradUser> {
  const user = await requireAuthenticatedUser({
    returnBackUrl: options.currentPath,
  });
  const onboardingStatus = await readOnboardingStatus(user.userId);

  if (!onboardingStatus.completed) {
    redirect(
      withRedirectParam(
        ONBOARDING_ROUTE,
        getSafeAppRedirectPath(options.currentPath) ?? DEFAULT_AUTHENTICATED_ROUTE,
      ),
    );
  }

  return {
    ...user,
    profile: onboardingStatus.profile,
  };
}

export async function redirectAuthenticatedUserAppropriately(options?: {
  requestedRedirectUrl?: string | null;
  redirectSignedOut?: boolean;
}) {
  const requestedRedirectUrl = getSafeAppRedirectPath(
    options?.requestedRedirectUrl,
  );
  const redirectSignedOut = options?.redirectSignedOut ?? true;

  if (!hasClerkServerConfig) {
    if (redirectSignedOut) {
      redirect(withRedirectParam(AUTH_ROUTE, requestedRedirectUrl));
    }

    return null;
  }

  const authObject = await auth();

  if (!authObject.userId) {
    if (redirectSignedOut) {
      redirect(withRedirectParam(AUTH_ROUTE, requestedRedirectUrl));
    }

    return null;
  }

  const onboardingStatus = await readOnboardingStatus(authObject.userId);

  if (!onboardingStatus.completed) {
    redirect(withRedirectParam(ONBOARDING_ROUTE, requestedRedirectUrl));
  }

  redirect(requestedRedirectUrl ?? DEFAULT_AUTHENTICATED_ROUTE);
}
