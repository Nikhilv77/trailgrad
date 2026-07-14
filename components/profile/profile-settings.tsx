"use client";

import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LoaderCircle,
  UploadCloud,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

const roleOptions = [
  { id: "ai-engineer", label: "AI Engineer" },
  { id: "ml-engineer", label: "ML Engineer" },
  { id: "software-engineer", label: "Software Engineer" },
  { id: "frontend-engineer", label: "Frontend Engineer" },
  { id: "backend-engineer", label: "Backend Engineer" },
  { id: "full-stack-engineer", label: "Full Stack Engineer" },
  { id: "data-scientist", label: "Data Scientist" },
  { id: "data-analyst", label: "Data Analyst" },
  { id: "data-engineer", label: "Data Engineer" },
  { id: "product", label: "Product" },
] as const;

const experienceOptions = [
  { id: "student-new-graduate", label: "Student / New grad" },
  { id: "junior", label: "Junior" },
  { id: "mid-level", label: "Mid-level" },
  { id: "senior", label: "Senior" },
] as const;

interface ProfileSettingsProps {
  initialExperienceLevel: string;
  initialResumeName?: string;
  initialTargetRole: string;
}

export function ProfileSettings({
  initialExperienceLevel,
  initialResumeName,
  initialTargetRole,
}: ProfileSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetRole, setTargetRole] = useState(initialTargetRole);
  const [experienceLevel, setExperienceLevel] = useState(initialExperienceLevel);
  const [resumeName, setResumeName] = useState(initialResumeName ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveProfile() {
    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experienceLevel,
          targetRole,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to update profile.");
      }

      setMessage("Profile defaults updated.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadResume(file: File) {
    if (uploading) return;

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("resume", file);

      const response = await fetch("/api/profile/onboarding/resume", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as
        | { duplicate?: boolean; error?: string; fileName?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to upload resume.");
      }

      setResumeName(payload?.fileName ?? file.name);
      setMessage(
        payload?.duplicate
          ? "Resume already exists. Trailgrad made it active."
          : "Resume updated.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to upload resume.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbf9] px-4 py-5 text-[#111827] sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(45,212,191,0.13),transparent_34%),radial-gradient(circle_at_84%_8%,rgba(125,232,218,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.45),rgba(244,251,249,0.8))]"
      />
      <section className="relative mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/today"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#d7ebe6] bg-white/80 px-3 text-sm font-semibold text-[#0f766e] shadow-[0_10px_24px_rgba(15,118,110,0.06)] transition-colors hover:border-[#b9ddd5] hover:bg-white"
          >
            <ArrowLeft className="size-4" />
            Today
          </Link>
        </header>

        <div className="mt-5 rounded-[30px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,118,110,0.08)] backdrop-blur-xl sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f8f7e]">
            Profile
          </p>
          <h1 className="mt-2 text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#111827] sm:text-[48px]">
            Keep your basics current.
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#5f6f6b]">
            These defaults are used when you create new trails. Existing trail
            snapshots stay tied to the details they were created with.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-[28px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,118,110,0.08)] sm:p-6">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-[#effbf8] text-[#0f8f7e]">
                <UserRound className="size-4" />
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0f8f7e]">
                Role and experience
              </h2>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7d78]">
                Role
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {roleOptions.map((option) => (
                  <OptionButton
                    key={option.id}
                    active={targetRole === option.id}
                    label={option.label}
                    onClick={() => setTargetRole(option.id)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7d78]">
                Experience
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {experienceOptions.map((option) => (
                  <OptionButton
                    key={option.id}
                    active={experienceLevel === option.id}
                    label={option.label}
                    onClick={() => setExperienceLevel(option.id)}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0f9f8d] px-4 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,159,141,0.24)] transition-colors hover:bg-[#0d8d7d] disabled:opacity-70 sm:w-auto sm:min-w-[180px]"
            >
              {saving ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save profile"
              )}
            </button>
          </section>

          <aside className="rounded-[28px] border border-[#d7ebe6] bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,118,110,0.08)] sm:p-6 lg:self-start">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-[#effbf8] text-[#0f8f7e]">
                <FileText className="size-4" />
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0f8f7e]">
                Resume
              </h2>
            </div>
            <div className="mt-5 rounded-2xl border border-[#dcefeb] bg-[#f6fbfa] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7d78]">
                Active resume
              </p>
              <p className="mt-2 break-words text-sm font-semibold leading-6 text-[#111827]">
                {resumeName || "No resume found"}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  void uploadResume(file);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#d7ebe6] bg-white px-4 text-sm font-semibold text-[#0f766e] shadow-[0_12px_28px_rgba(15,118,110,0.06)] transition-colors hover:border-[#b9ddd5] disabled:opacity-70"
            >
              {uploading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <UploadCloud className="size-4" />
                  Update resume
                </>
              )}
            </button>
          </aside>
        </div>

        {message ? (
          <p className="mt-5 flex items-center gap-2 rounded-2xl border border-[#c4ebe3] bg-[#effbf8] px-4 py-3 text-sm font-semibold text-[#0f766e]">
            <CheckCircle2 className="size-4" />
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-5 rounded-2xl border border-[#f1cdbf] bg-[#fff9f6] px-4 py-3 text-sm font-semibold text-[#9a4f3a]">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}

function OptionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${
        active
          ? "border-[#0f9f8d] bg-[#effbf8] text-[#0f766e]"
          : "border-[#dcefeb] bg-white text-[#111827] hover:border-[#a7dcd4]"
      }`}
    >
      {label}
    </button>
  );
}
