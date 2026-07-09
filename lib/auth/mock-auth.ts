import { mockProfile } from "@/lib/mock/profile";

// TODO: Replace mock-auth with Clerk later.
export async function getCurrentUser() {
  return mockProfile;
}
