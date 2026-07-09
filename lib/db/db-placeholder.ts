// Future database adapter boundary.
// TODO: Replace mock-db with Supabase later.
// TODO: Add pgvector embeddings later for semantic resume/JD/project matching.
export function getDbPlaceholder() {
  return { mode: "mock" as const };
}
