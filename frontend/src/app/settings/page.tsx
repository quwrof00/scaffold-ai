"use client";

import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import { useStudentData } from "@/hooks/useStudentData";
import { apiUpdateStudentProfile } from "@/lib/api";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/lib/theme";

const learningStyles = [
  "Visual Examples",
  "Step-by-Step Reasoning",
  "Analogies",
  "Practice First",
];

const tutoringPace = ["Relaxed", "Balanced", "Fast"];

export default function Page() {
  const { profile, loading, mutateProfile } = useStudentData();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const paceMap: Record<string, string> = { "Relaxed": "SLOW", "Balanced": "MEDIUM", "Fast": "FAST" };
      const updates = {
        learningPace: paceMap[formData.get("pace") as string] || "MEDIUM",
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        parentEmails: formData.get("parentEmails") as string,
      };
      
      const themePref = formData.get("theme") as string;
      if (themePref) {
        setTheme(themePref.toLowerCase() as "light" | "dark" | "system");
      }

      await apiUpdateStudentProfile(profile.id, updates);
      mutateProfile(updates);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell headerTitle="Settings">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell headerTitle="Settings" headerSubtitle="Customize preferences">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Appearance Preferences */}
          <SectionCard title="Appearance">
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-zinc-700 mb-3">
                Theme
              </legend>
              <SegmentedRadio
                name="theme"
                options={["Light", "Dark", "System"]}
                defaultValue={theme.charAt(0).toUpperCase() + theme.slice(1)}
              />
              <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                Choose the visual style of your workspace.
              </p>
            </fieldset>
          </SectionCard>

          {/* Learning Preferences */}
          <SectionCard title="Learning Preferences">
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-zinc-700 mb-3">
                Preferred Learning Style
              </legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {learningStyles.map((style, index) => (
                  <CheckOption key={style} label={style} defaultChecked={index < 2} />
                ))}
              </div>
            </fieldset>

            <div className="mt-8 pt-6 border-t border-zinc-100">
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-zinc-700 mb-3">
                  Tutoring Pace
                </legend>
                <SegmentedRadio
                  name="pace"
                  options={tutoringPace}
                  defaultValue={
                    { "SLOW": "Relaxed", "MEDIUM": "Balanced", "FAST": "Fast" }[profile?.learningPace || "MEDIUM"] || "Balanced"
                  }
                />
                <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                  Controls how quickly the tutor introduces new concepts and moves through topics.
                </p>
              </fieldset>
            </div>
          </SectionCard>

          {/* Account */}
          <SectionCard title="Account">
            <div className="space-y-5">
              <TextField label="Name" name="name" id="name" defaultValue={profile?.name || ""} />
              <TextField label="Email" name="email" id="email" defaultValue={profile?.email || ""} type="email" />

              <div className="pt-5 border-t border-zinc-100">
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  <span className="font-semibold text-zinc-600">Parent Access —</span>{" "}
                  Grant parents read-only access to your dashboard by entering their registered email addresses below.
                </p>
                <TextField
                  label="Parent Emails (comma separated)"
                  name="parentEmails"
                  id="parentEmails"
                  defaultValue={profile?.parentEmails || ""}
                  placeholder="parent1@example.com, parent2@example.com"
                />
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-zinc-100">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-60"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </SectionCard>

        </form>
      </div>
    </AppShell>
  );
}

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-white border border-zinc-100 shadow-sm", className)}>
      <div className="px-6 pt-5 pb-4 border-b border-zinc-100">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-purple-500">
          {title}
        </p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function TextField({
  label,
  name,
  id,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  id: string;
  defaultValue: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <input
        type={type}
        name={name}
        id={id}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:bg-white"
      />
    </label>
  );
}

function SegmentedRadio({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: string[];
  defaultValue: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 p-1">
      {options.map((option) => (
        <label key={option} className="relative">
          <input
            type="radio"
            name={name}
            value={option}
            defaultChecked={option === defaultValue}
            className="peer sr-only"
          />
          <span className="flex h-9 cursor-pointer items-center justify-center rounded-lg text-sm font-medium text-zinc-500 transition-all peer-checked:bg-white peer-checked:text-purple-700 peer-checked:shadow-sm peer-checked:font-semibold">
            {option}
          </span>
        </label>
      ))}
    </div>
  );
}

function CheckOption({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-700 font-medium transition-colors hover:bg-zinc-100">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-zinc-300 accent-purple-600"
      />
      <span>{label}</span>
    </label>
  );
}
