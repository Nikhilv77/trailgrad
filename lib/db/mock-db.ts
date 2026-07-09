import { mockDashboard } from "@/lib/mock/dashboard";
import { mockPracticePlan } from "@/lib/mock/practice";
import { mockProfile } from "@/lib/mock/profile";
import { mockProgress } from "@/lib/mock/progress";
import { mockProjects } from "@/lib/mock/projects";

// TODO: Replace mock-db with Supabase later.
// TODO: Add Supabase Storage for file uploads later.
// TODO: Add pgvector embeddings later.
export const mockDb = {
  dashboard: mockDashboard,
  projects: mockProjects,
  profile: mockProfile,
  progress: mockProgress,
  practicePlan: mockPracticePlan,
};
