export function sanitizeFilename(fileName: string) {
  const fallback = "resume";
  const normalized = fileName
    .normalize("NFKD")
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 120)
    .toLowerCase();

  return normalized || fallback;
}
