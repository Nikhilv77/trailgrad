export const siteConfig = {
  name: "Trailgrad",
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://trailgrad.com",
  description:
    "Trailgrad turns your resume, projects, and target role into a personalized interview-readiness plan with resume review, project prep, mock practice, and AI feedback.",
  shortDescription:
    "AI interview readiness for resumes, projects, job descriptions, and mock practice.",
  keywords: [
    "AI interview preparation",
    "interview readiness",
    "resume review",
    "mock interview practice",
    "project interview prep",
    "job description match",
    "career readiness",
    "AI career coach",
  ],
};

export function getSiteUrl() {
  const url = siteConfig.url.startsWith("http")
    ? siteConfig.url
    : `https://${siteConfig.url}`;

  return new URL(url);
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}
