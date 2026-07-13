export const siteConfig = {
  name: "Trailgrad",
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://trailgrad.com",
  description:
    "Trailgrad turns your resume and target role into a personalized interview-readiness snapshot with resume review, risks, questions, and a focused action plan.",
  shortDescription:
    "AI interview readiness for resumes, target roles, and job descriptions.",
  keywords: [
    "AI interview preparation",
    "interview readiness",
    "resume review",
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
