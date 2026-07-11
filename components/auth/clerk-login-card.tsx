"use client";

import { SignIn } from "@clerk/nextjs";
import { CheckCircle2, KeyRound } from "lucide-react";
import { Lobster_Two } from "next/font/google";

const lobsterTwo = Lobster_Two({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  display: "swap",
});

const hasClerkPublishableKey = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

const clerkAppearance = {
  variables: {
    colorBackground: "transparent",
    colorDanger: "#dc5f54",
    colorInputBackground: "#ffffff",
    colorInputText: "#082f35",
    colorPrimary: "#159b89",
    colorText: "#082f35",
    colorTextSecondary: "#647b7f",
    fontFamily:
      "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif",
  },

  elements: {
    rootBox: "w-full",
    cardBox: "w-full bg-transparent shadow-none",
    card: "w-full bg-transparent p-0 shadow-none",
    header: "hidden",
    logoBox: "hidden",
    main: "p-0",
    footer: "hidden",
    footerPages: "hidden",

    socialButtonsRoot: "w-full",
    socialButtons: "w-full",
    socialButtonsBlockButton: "tg-google-button",
    socialButtonsBlockButtonText: "tg-google-button-text",

    lastAuthenticationStrategyBadge: {
      display: "none",
    },

    dividerRow: "tg-divider-row",
    dividerLine: "tg-divider-line",
    dividerText: "tg-divider-text",

    form: "w-full",
    formField: "tg-form-field",
    formFieldRow: "w-full",
    formFieldInputGroup: "w-full",
    formFieldLabel: "tg-form-label",
    formFieldInput: "tg-form-input",
    formButtonPrimary: "tg-continue-button",

    formFieldAction: "tg-form-action",
    formResendCodeLink: "tg-form-action",

    identityPreview: "tg-identity-preview",
    identityPreviewText: "text-[#082f35]",

    formFieldErrorText: "text-[12px]",
    alertText: "text-[12px]",
  },
};

export function ClerkLoginCard() {
  return (
    <div className="w-full" data-testid="clerk-auth-surface">
      <div className="mb-5 text-center">
        <h2
          className={`${lobsterTwo.className} text-[30px] font-normal leading-none tracking-normal text-[#082f35]`}
        >
          Continue to <span className="text-[#159b89]">Trailgrad</span>
        </h2>

        <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-5 text-[#71868a]">
          Continue building your interview readiness.
        </p>
      </div>

      {hasClerkPublishableKey ? (
        <SignIn
          routing="hash"
          withSignUp
          signUpUrl="/onboarding"
          fallbackRedirectUrl="/auth/ready"
          forceRedirectUrl="/auth/ready"
          signUpFallbackRedirectUrl="/auth/ready"
          signUpForceRedirectUrl="/auth/ready"
          appearance={clerkAppearance}
          fallback={<ClerkLoadingState />}
        />
      ) : (
        <ClerkSetupState />
      )}

      <style jsx global>{`
        [data-testid="clerk-auth-surface"] .cl-rootBox,
        [data-testid="clerk-auth-surface"] .cl-cardBox,
        [data-testid="clerk-auth-surface"] .cl-card,
        [data-testid="clerk-auth-surface"] .cl-main {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        [data-testid="clerk-auth-surface"] .cl-header,
        [data-testid="clerk-auth-surface"] .cl-footer,
        [data-testid="clerk-auth-surface"]
          [data-clerk-dev-mode-notice] {
          display: none !important;
        }

        /* Google button */

        [data-testid="clerk-auth-surface"] button.tg-google-button {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          width: 100% !important;
          height: 44px !important;
          min-height: 44px !important;
          padding: 0 16px !important;

          border: 0 !important;
          border-radius: 12px !important;

          background: #f7fcfa !important;
          color: #163f44 !important;
          overflow: hidden !important;

          box-shadow:
            inset 0 0 0 1px #c7e1dc,
            0 4px 12px rgba(15, 118, 110, 0.05) !important;

          transform: none !important;
          transition: none !important;
        }

        [data-testid="clerk-auth-surface"]
          button.tg-google-button:hover,
        [data-testid="clerk-auth-surface"]
          button.tg-google-button:active,
        [data-testid="clerk-auth-surface"]
          button.tg-google-button:focus {
          background: #f7fcfa !important;

          box-shadow:
            inset 0 0 0 1px #c7e1dc,
            0 4px 12px rgba(15, 118, 110, 0.05) !important;

          transform: none !important;
        }

        [data-testid="clerk-auth-surface"] .tg-google-button-text {
          color: #163f44 !important;
          font-size: 13px !important;
          font-weight: 600 !important;
        }

        [data-testid="clerk-auth-surface"]
          .cl-socialButtonsProviderIcon {
          width: 17px !important;
          height: 17px !important;
        }

        [data-testid="clerk-auth-surface"]
          .cl-lastAuthenticationStrategyBadge {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Divider */

        [data-testid="clerk-auth-surface"] .tg-divider-row {
          margin: 16px 0 !important;
        }

        [data-testid="clerk-auth-surface"] .tg-divider-line {
          height: 1px !important;
          background: #dce9e6 !important;
        }

        [data-testid="clerk-auth-surface"] .tg-divider-text {
          color: #71878a !important;
          font-size: 10px !important;
          font-weight: 600 !important;
          letter-spacing: 0.14em !important;
          text-transform: uppercase !important;
        }

        /* Form */

        [data-testid="clerk-auth-surface"] .tg-form-field {
          width: 100% !important;
          margin-bottom: 12px !important;
        }

        [data-testid="clerk-auth-surface"] .tg-form-label {
          display: block !important;
          margin-bottom: 6px !important;

          color: #244b50 !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }

        [data-testid="clerk-auth-surface"] .tg-form-input {
          width: 100% !important;
          height: 44px !important;
          min-height: 44px !important;
          padding: 0 14px !important;

          border: 1px solid #c9dfda !important;
          background: #ffffff !important;
          color: #082f35 !important;

          outline: none !important;
          box-shadow: none !important;

          transition:
            border-color 220ms ease,
            box-shadow 220ms ease !important;
        }

        [data-testid="clerk-auth-surface"] .tg-form-input:hover {
          border-color: #a5d0c9 !important;
        }

        [data-testid="clerk-auth-surface"] .tg-form-input:focus {
          border-color: #159b89 !important;
          box-shadow: 0 0 0 4px rgba(21, 155, 137, 0.09) !important;
        }

        [data-testid="clerk-auth-surface"]
          .tg-form-input::placeholder {
          color: #91a2a4 !important;
        }

        /* Continue button */

        [data-testid="clerk-auth-surface"]
          button.tg-continue-button {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          width: 100% !important;
          height: 44px !important;
          min-height: 44px !important;
          padding: 0 18px !important;

          border: 1px solid #0f8f7e !important;

          background: linear-gradient(
            135deg,
            #0f8f7e 0%,
            #20a995 100%
          ) !important;

          color: #ffffff !important;
          font-size: 13px !important;
          font-weight: 650 !important;
          line-height: 1 !important;

          appearance: none !important;
          overflow: hidden !important;

          box-shadow: 0 9px 20px rgba(15, 118, 110, 0.18) !important;

          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            filter 220ms ease !important;
        }

        [data-testid="clerk-auth-surface"]
          button.tg-continue-button:hover {
          transform: translateY(-1px);
          filter: brightness(1.025);

          box-shadow: 0 13px 26px rgba(15, 118, 110, 0.23) !important;
        }

        [data-testid="clerk-auth-surface"]
          button.tg-continue-button:active {
          transform: translateY(0);
        }

        [data-testid="clerk-auth-surface"]
          button.tg-continue-button span,
        [data-testid="clerk-auth-surface"]
          button.tg-continue-button svg {
          position: relative !important;
          z-index: 1 !important;

          color: #ffffff !important;
          opacity: 1 !important;
        }

        [data-testid="clerk-auth-surface"] .tg-form-action {
          color: #128b7c !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }

        [data-testid="clerk-auth-surface"] .tg-identity-preview {
          border: 1px solid #c9dfda !important;
          background: #ffffff !important;
        }
      `}</style>
    </div>
  );
}

function ClerkLoadingState() {
  return (
    <div className="space-y-3">
      <div className="h-11 animate-pulse rounded-xl bg-[#159b89]/8" />
      <div className="h-11 animate-pulse rounded-xl bg-[#159b89]/6" />
      <div className="h-11 animate-pulse rounded-xl bg-[#159b89]/10" />
    </div>
  );
}

function ClerkSetupState() {
  return (
    <div className="rounded-[16px] border border-[#0f766e]/10 bg-white/70 p-4">
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e1f5f1] text-[#159b89]">
          <KeyRound className="size-5" />
        </span>

        <div>
          <h3 className="text-sm font-semibold text-[#082f35]">
            Clerk is wired in
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-[#71868a]">
            Add your Clerk environment keys to enable the live sign-in flow.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-[#edf8f5] p-3 font-mono text-[10px] leading-5 text-[#177f73] ring-1 ring-[#0f766e]/8">
        <p>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...</p>
        <p>CLERK_SECRET_KEY=...</p>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#6e8588]">
        <CheckCircle2 className="size-4 text-[#159b89]" />
        Successful sign-ins redirect to the dashboard.
      </div>
    </div>
  );
}
