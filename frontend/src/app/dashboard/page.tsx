"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight,
  Brain,
  Zap,
  Loader2,
  LogOut
} from "lucide-react";
import { API_BASE } from "@/lib/api";

import { AppShell } from "@/components/layout/AppShell";
import { useStudentData } from "@/hooks/useStudentData";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    }
  });
  const { profile, sessions, concepts, misconceptions, heatmap, loading, error } = useStudentData();
  const [activeTab, setActiveTab] = useState<"all" | string>("all");
  const [expandedMisconception, setExpandedMisconception] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isStartingSession, setIsStartingSession] = useState(false);

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !profile?.id) return;
    setIsStartingSession(true);
    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: profile?.id || (session?.user as any)?.studentProfileId,
          message: prompt
        })
      });
      if (!res.ok) throw new Error("Failed to start session");
      const data = await res.json();
      router.push(`/session/${data.session_id}?q=${encodeURIComponent(prompt)}`);
    } catch (err) {
      console.error(err);
      setIsStartingSession(false);
    }
  };

  // Compute subject breakdown from real concept mastery data
  const subjectMap: Record<string, { known: number; total: number }> = {};
  concepts.forEach((c) => {
    if (!subjectMap[c.subject]) subjectMap[c.subject] = { known: 0, total: 0 };
    subjectMap[c.subject].total++;
    if (c.status === "KNOWN") subjectMap[c.subject].known++;
  });
  const subjectProgress = Object.entries(subjectMap).map(([subject, { known, total }]) => ({
    subject,
    masteryPercent: total > 0 ? Math.round((known / total) * 100) : 0,
  }));

  const overallConfidence =
    subjectProgress.length > 0
      ? Math.round(subjectProgress.reduce((s, x) => s + x.masteryPercent, 0) / subjectProgress.length)
      : 0;

  // Heatmap — fetched from backend
  const heatmapData = heatmap.length > 0 ? heatmap : Array.from({ length: 154 }, (_, i) => ({ id: `mock-${i}`, date: "", level: 0 }));

  const userName = profile?.name || session?.user?.name || "Learner";

  if (loading) {
    return (
      <AppShell headerTitle="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell headerTitle="Student Dashboard" headerSubtitle={`Welcome back, ${userName}`} headerActions={
      <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition">
        <LogOut className="w-3.5 h-3.5" />
        Sign out
      </button>
    }>

      {/* DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pb-12">

        {/* LEFT / MAIN COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Welcome Back Card */}
          <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-6 md:p-8 text-[#ffffff] shadow-lg">
            {/* Visual backdrop grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-light tracking-tight md:text-4xl text-[#ffffff]" style={{ fontFamily: 'var(--font-serif-editorial)' }}>
                  A truly personalized learning journey
                </h1>
                <p className="text-sm text-purple-100 max-w-md leading-relaxed">
                  You&apos;re making great progress! Keep exploring and resolving your stuck points.
                </p>
              </div>

              {/* Dynamic Important Number */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1">Level</span>
                  <span className="text-3xl font-black text-white leading-none">
                    {profile ? Math.max(1, Math.floor((profile.xp || 0) / 500) + 1) : 1}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-pink-500/10 backdrop-blur-md border border-pink-500/20 shadow-xl">
                  <span className="text-[10px] font-bold text-pink-300 uppercase tracking-widest mb-1">Streak</span>
                  <span className="text-2xl font-black text-pink-100 leading-none flex items-center gap-1">
                    {profile?.streak || 0} <span className="text-xl">🔥</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Start New Session Card */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)] hover:shadow-[0_12px_36px_rgba(120,80,200,0.05)] transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Start a Socratic Session</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-800 mt-1">What are you struggling with?</h3>
                <p className="text-xs text-zinc-500">Enter a concept or problem. ScaffoldAI will guide you to the answer without giving it away.</p>
              </div>

              <form onSubmit={handleStartSession} className="flex gap-2.5 justify-center">
                <input
                  type="text"
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. I don't understand the components of a human heart..."
                  className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-zinc-800 placeholder-zinc-400"
                  disabled={isStartingSession}
                />
                <button
                  type="submit"
                  disabled={isStartingSession || !prompt.trim()}
                  className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-md shrink-0"
                >
                  {isStartingSession ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Session</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Concept Mastery Heatmap */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Concept Mastery Heatmap</h3>
                <p className="text-xs text-zinc-500">Visual mapping of daily concept repetitions, reviews, and study density.</p>
              </div>

              {/* Subject Tabs */}
              <div className="flex bg-zinc-100 p-0.5 rounded-lg text-xs font-medium shrink-0">
                {(["all", "math", "physics", "chemistry"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md transition-all uppercase text-[10px] tracking-wider ${activeTab === tab ? 'bg-white text-purple-700 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom 7 rows x 22 columns Heatmap Grid */}
            <div className="flex items-center gap-3 py-2 overflow-x-auto">
              <div className="flex flex-col justify-between text-[10px] text-zinc-400 h-20 font-semibold pr-1">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[340px]">
                {heatmapData.map((cell) => {
                  // Select shade depending on filter and cell level
                  const intensities = [
                    "bg-zinc-100",
                    "bg-purple-100/70",
                    "bg-purple-300/70",
                    "bg-purple-500",
                    "bg-pink-500"
                  ];
                  let colorClass = intensities[cell.level];
                  // If filter is specific subject, change colors to match subject theme
                  if (activeTab === "math" && cell.level > 0) {
                    colorClass = ["bg-zinc-100", "bg-purple-100", "bg-purple-300", "bg-purple-500", "bg-purple-600"][cell.level];
                  } else if (activeTab === "physics" && cell.level > 0) {
                    colorClass = ["bg-zinc-100", "bg-blue-100", "bg-blue-300", "bg-blue-500", "bg-blue-600"][cell.level];
                  } else if (activeTab === "chemistry" && cell.level > 0) {
                    colorClass = ["bg-zinc-100", "bg-emerald-100", "bg-emerald-300", "bg-emerald-500", "bg-emerald-600"][cell.level];
                  }

                  return (
                    <div
                      key={cell.id}
                      className={`w-2.5 h-2.5 rounded-[3px] ${colorClass} hover:scale-130 transition-transform duration-100 cursor-pointer`}
                      title={`Activity index: ${cell.level}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Grid legend */}
            <div className="flex items-center justify-end gap-1.5 text-[10px] text-zinc-400 mt-4 font-medium">
              <span>Less</span>
              <div className="w-2.5 h-2.5 bg-zinc-100 rounded-[2px]" />
              <div className="w-2.5 h-2.5 bg-purple-100/70 rounded-[2px]" />
              <div className="w-2.5 h-2.5 bg-purple-300/70 rounded-[2px]" />
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-[2px]" />
              <div className="w-2.5 h-2.5 bg-pink-500 rounded-[2px]" />
              <span>More repetitions</span>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Recent Sessions</h3>
                <p className="text-xs text-zinc-500">History of your Socratic focus worksheets and challenges.</p>
              </div>
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="overflow-x-auto">
              {sessions.length === 0 ? (
                <p className="text-sm text-zinc-400 py-4 text-center">No sessions yet. <Link href="/session" className="text-purple-600 font-semibold">Start your first session →</Link></p>
              ) : (
                <table className="w-full text-left text-xs text-zinc-600">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[9px] pb-2">
                      <th className="py-2">Subject / Topic</th>
                      <th className="py-2">Intent</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5">
                          <div className="font-semibold text-zinc-900">{s.topic || "General"}</div>
                          <div className="text-[10px] text-zinc-400 font-medium">{s.subject || "—"}</div>
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold capitalize border ${s.intent === "CONCEPT_UNDERSTANDING" ? "bg-purple-50 text-purple-700 border-purple-200/40" :
                            s.intent === "PROBLEM_SOLVING" ? "bg-blue-50 text-blue-700 border-blue-200/40" :
                              "bg-zinc-50 text-zinc-600 border-zinc-200/40"
                            }`}>
                            {s.intent === "CONCEPT_UNDERSTANDING" ? "Concept" : s.intent === "PROBLEM_SOLVING" ? "Problem" : "General"}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${s.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200/40" : "bg-amber-50 text-amber-700 border-amber-200/40"
                            }`}>{s.status}</span>
                        </td>
                        <td className="py-3.5 text-right text-zinc-400">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">

          {/* Confidence Score Dials */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Confidence Score</h3>
                <p className="text-[11px] text-zinc-500">Average syllabus mastery index</p>
              </div>
              <div className="flex items-center gap-1 font-bold text-emerald-500 text-xs">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+5.4%</span>
              </div>
            </div>

            {/* Large Radial Arc */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="62" className="stroke-zinc-100 fill-none" strokeWidth="9" />
                <circle cx="72" cy="72" r="62" className="stroke-purple-600 fill-none" strokeWidth="9" strokeDasharray="389" strokeDashoffset={389 - (389 * overallConfidence) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-zinc-850">{overallConfidence}%</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold mt-0.5">Overall</span>
              </div>
            </div>

            {/* Subject Breakdown Progress Lines */}
            <div className="space-y-3.5 mt-5">
              {subjectProgress.length === 0 ? (
                <p className="text-xs text-zinc-400">Complete a session to track subject mastery.</p>
              ) : subjectProgress.map((sub) => (
                <div key={sub.subject} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-700">{sub.subject}</span>
                    <span className="font-bold text-zinc-900">{sub.masteryPercent}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500 transition-all duration-500" style={{ width: `${sub.masteryPercent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Streak & Weekly Progress */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900">Daily Streak</h3>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/70 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Flame className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                <span>{profile?.streak ?? 0} Days active</span>
              </div>
            </div>

            {/* Streak Grid timeline */}
            <div className="grid grid-cols-7 gap-2">
              {heatmapData.slice(-7).map((dayData, idx) => {
                const isActive = dayData.level > 0;
                // Safely format date string "YYYY-MM-DD" to "M", "T", "W" etc.
                const dayStr = dayData.date ? new Date(dayData.date).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }).charAt(0) : ["M", "T", "W", "T", "F", "S", "S"][idx];

                return (
                  <div key={dayData.id || idx} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${isActive ? 'bg-amber-100/90 text-amber-800 border border-amber-300 shadow-xs' : 'bg-zinc-100 text-zinc-400'
                      }`}>
                      {isActive ? "🔥" : dayStr}
                    </div>
                    <span className="text-[9px] text-zinc-400 font-semibold">{dayStr}</span>
                  </div>
                );
              })}
            </div>

            {/* Weekly study subjects */}
            <div className="border-t border-zinc-100 mt-5 pt-4">
              <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Subject Mastery</h4>
              <div className="space-y-2.5">
                {subjectProgress.slice(0, 3).map((sub) => (
                  <div key={sub.subject} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-700">{sub.subject}</span>
                    <span className="font-bold text-zinc-800">{sub.masteryPercent}%</span>
                  </div>
                ))}
                {subjectProgress.length === 0 && (
                  <p className="text-xs text-zinc-400">Complete a session to see subject breakdown.</p>
                )}
              </div>
            </div>
          </div>

          {/* Misconception Tracker (Weak Topics) */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Weak Topics</h3>
                <p className="text-[11px] text-zinc-500">Misconceptions we are tracking in Socratic dialogs</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-pink-500" />
            </div>

            <div className="space-y-3">
              {misconceptions.length === 0 ? (
                <p className="text-xs text-zinc-400 py-2">No tracked misconceptions yet. Keep learning!</p>
              ) : misconceptions.map((m) => {
                const isExpanded = expandedMisconception === m.id;
                return (
                  <div
                    key={m.id}
                    className="border border-zinc-100 rounded-xl p-3 hover:border-purple-200/80 hover:bg-purple-50/10 transition-all cursor-pointer group"
                    onClick={() => setExpandedMisconception(isExpanded ? null : m.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <h4 className="text-xs font-bold text-zinc-800">{m.concept || m.misconceptionName || "Unknown"}</h4>
                      </div>
                      <span className="text-[9px] text-purple-600 font-bold">×{m.frequency}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 pl-3.5 line-clamp-1">{m.misconceptionDescription || "Identified during session"}</p>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-3.5 pt-3 mt-3 border-t border-zinc-100 text-[10px] text-zinc-600 overflow-hidden"
                        >
                          <Link href="/session" className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 hover:text-purple-900">
                            <span>Start a targeted session</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Learning Style Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-100/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.02)]">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4.5 h-4.5 text-purple-700" />
              <h3 className="text-sm font-bold text-purple-900">Cognitive Profile & Insights</h3>
            </div>
            <div className="space-y-3 text-[11px] text-zinc-600 leading-relaxed">
              <p>
                <b>Conceptual Explorer:</b> {profile?.name || userName} shows a growing pattern of concept exploration. Keep engaging with the Socratic tutor to unlock deeper insights.
              </p>
              <div className="flex items-start gap-2 bg-white/70 border border-purple-100 p-2.5 rounded-xl">
                <Zap className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-[10px]">
                  <b>Tip:</b> After each session your concept mastery map updates automatically. Visit the Stuck Map to see exactly where to focus next.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </AppShell>
  );
}
