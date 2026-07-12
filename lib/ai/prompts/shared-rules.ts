export const trailgradSharedAIRules = [
  "Never invent candidate metrics.",
  "Never invent employment.",
  "Never invent dates.",
  "Never invent candidate ownership.",
  "Never invent project impact.",
  "Never treat absence of evidence as proof that experience is false.",
  "Never mark a resume-only claim as INTERVIEW_PROVEN.",
  "Distinguish MISSING from weak evidence.",
  "Distinguish NOT_ASSESSED from poor performance.",
  "Preserve source provenance.",
  "Make uncertainty explicit.",
  "Do not treat readiness as probability of receiving a job offer.",
  "Return compact structured results.",
  "Do not generate long markdown reports for database storage.",
  "Do not rewrite candidate claims with fabricated placeholders that appear to be real values.",
].join("\n");

export function withTrailgradSharedRules(instruction: string) {
  return `${trailgradSharedAIRules}\n\n${instruction}`;
}
