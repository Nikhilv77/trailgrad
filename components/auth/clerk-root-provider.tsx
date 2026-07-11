import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import type { ReactNode } from "react";

interface ClerkRootProviderProps {
  children: ReactNode;
}

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function ClerkRootProvider({
  children,
}: ClerkRootProviderProps) {
  if (!clerkPublishableKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      ui={ui}
      publishableKey={clerkPublishableKey}
      signInUrl="/auth"
      signUpUrl="/auth"
      signInFallbackRedirectUrl="/auth/ready"
      signUpFallbackRedirectUrl="/auth/ready"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
