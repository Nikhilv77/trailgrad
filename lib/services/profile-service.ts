import { getCurrentUser } from "@/lib/auth/mock-auth";
import { mockDb } from "@/lib/db/mock-db";

// TODO: Replace mock-auth with Clerk later.
export async function getProfile() {
  return getCurrentUser();
}

export async function getDashboard() {
  return mockDb.dashboard;
}
