const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g;
const STREET_ADDRESS_PATTERN =
  /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Boulevard|Blvd|Way|Court|Ct)\b/gi;
const SENSITIVE_URL_PATTERN = /\bhttps?:\/\/[^\s)]+/gi;
const SENSITIVE_QUERY_KEYS = new Set([
  "token",
  "key",
  "secret",
  "signature",
  "password",
  "auth",
  "code",
]);

export function redactModelBoundText(text: string) {
  return text
    .replace(EMAIL_PATTERN, "[REDACTED_EMAIL]")
    .replace(PHONE_PATTERN, "[REDACTED_PHONE]")
    .replace(STREET_ADDRESS_PATTERN, "[REDACTED_ADDRESS]")
    .replace(SENSITIVE_URL_PATTERN, redactSensitiveUrl);
}

function redactSensitiveUrl(value: string) {
  try {
    const url = new URL(value);
    let redacted = false;

    for (const key of Array.from(url.searchParams.keys())) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
        url.searchParams.set(key, "[REDACTED]");
        redacted = true;
      }
    }

    return redacted ? url.toString() : value;
  } catch {
    return value;
  }
}
