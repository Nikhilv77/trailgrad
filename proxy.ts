import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const hasClerkServerConfig = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/today(.*)",
  "/readiness(.*)",
  "/projects(.*)",
  "/practice(.*)",
  "/profile(.*)",
]);

const maybeClerkMiddleware = hasClerkServerConfig
  ? clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request)) {
        await auth.protect();
      }
    }, {
      signInUrl: "/auth",
      signUpUrl: "/auth",
    })
  : () => NextResponse.next();

export default maybeClerkMiddleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
