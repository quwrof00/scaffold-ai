"use client";

import React from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  TrendingUp, 
  Map, 
  Activity, 
  BookOpen, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  Layers,
  ArrowUpRight
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { useStudentData } from "@/hooks/useStudentData";


export default function StuckMapPage() {
  const { concepts, misconceptions, profile, trajectory, loading } = useStudentData();

  // Group concepts by subject for relationship view
  const subjectGroups = concepts.reduce<Record<string, typeof concepts>>((acc, c) => {
    if (!acc[c.subject]) acc[c.subject] = [];
    acc[c.subject].push(c);
    return acc;
  }, {});

  return (
    <AppShell headerTitle="Stuck Map" headerSubtitle="Visualize your learning journey and bottlenecks">
      
      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pb-12">
        
        {/* LEFT / MAIN COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Description Section */}
          <div className="bg-white border border-zinc-200/50 rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgba(120,80,200,0.02)]">
            <div className="max-w-xl space-y-2">
              <h1 className="text-3xl font-light tracking-tight text-zinc-900" style={{ fontFamily: 'var(--font-serif-editorial)' }}>
                Conceptual Friction Points
              </h1>
              <p className="text-zinc-500 text-xs leading-relaxed">
                This map isolates concepts where {profile?.name || "you are"} repeatedly getting stuck during Socratic session dialogs. By resolving these primary friction points, we prevent systemic misconceptions in dependent topics.
              </p>
            </div>
          </div>

          {/* Top Learning Bottlenecks */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Top Learning Bottlenecks</h3>
                <p className="text-[11px] text-zinc-500">Repeated blockages tracked during learning worksheets</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-purple-600" />
            </div>

            <div className="space-y-4">
              {misconceptions.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-6">No misconceptions tracked yet. Start a Socratic session to build your map. <Link href="/dashboard" className="text-purple-600 font-semibold">Start now →</Link></p>
              ) : misconceptions.map((m) => (
                <div key={m.id} className="border border-zinc-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-200 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <h4 className="text-sm font-bold text-zinc-800">{m.concept || m.misconceptionName || "Unknown"}</h4>
                    </div>
                    <p className="text-xs text-zinc-500">{m.misconceptionDescription || "Identified during Socratic session"}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-zinc-800 block leading-tight">{m.frequency}</span>
                      <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">stuck events</span>
                    </div>
                    <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200/50">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Concept Relationship View (Notion/Linear style tree) */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)]">
            <div className="mb-6">
              <h3 className="text-base font-bold text-zinc-900">Concept Relationship View</h3>
              <p className="text-[11px] text-zinc-500">Structural mapping of downstream conceptual dependencies</p>
            </div>

            <div className="space-y-6 max-w-md">
              {Object.keys(subjectGroups).length === 0 ? (
                <p className="text-xs text-zinc-400">No concept data yet. Complete a session to build your concept map.</p>
              ) : Object.entries(subjectGroups).map(([subject, concepts]) => (
                <div key={subject} className="space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-zinc-800">
                    <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-[9px]">
                      {subject[0]}
                    </div>
                    <span>{subject}</span>
                  </div>
                  <div className="pl-4 border-l border-zinc-200 ml-2.5 space-y-2.5">
                    {concepts.map((c) => (
                      <div key={c.id} className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-4 before:h-px before:bg-zinc-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-700">{c.concept}</span>
                          {c.status === "MISCONCEPTION" && (
                            <span className="text-[8px] bg-red-100 text-red-800 px-1 rounded font-bold uppercase">Misconception</span>
                          )}
                          {c.status === "KNOWN" && (
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold uppercase">Known</span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium">{c.attempts} attempts</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">

          {/* Learning Trajectory */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900">Learning Trajectory</h3>
              <Award className="w-4.5 h-4.5 text-purple-600" />
            </div>

            <div className="space-y-3.5">
              {/* Mastery bar block */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Overall Concept Mastery</span>
                  <span className="font-extrabold text-zinc-800">
                    {concepts.length > 0 ? Math.round((concepts.filter(c => c.status === "KNOWN").length / concepts.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${concepts.length > 0 ? Math.round((concepts.filter(c => c.status === "KNOWN").length / concepts.length) * 100) : 0}%` }} 
                  />
                </div>
              </div>

              {trajectory && trajectory.length > 0 && (
                <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Recent Progress</span>
                  </div>
                  {trajectory.reduce((sum, t) => sum + t.sessions, 0) > 0 ? (
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      You have mastered <b>{trajectory[trajectory.length - 1].mastery} concepts</b> across <b>{trajectory.reduce((sum, t) => sum + t.sessions, 0)} sessions</b> in the last 30 days. Keep up the momentum!
                    </p>
                  ) : (
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Start your first Socratic session to begin tracking your mastery trajectory!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progress Over Time (Minimal trend timeline) */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900">Recent Activity Timeline</h3>
              <Clock className="w-4.5 h-4.5 text-purple-600" />
            </div>

            <p className="text-[10px] text-zinc-500">Your most recent active days over the last 30 days.</p>

            <div className="space-y-4 relative pl-3 border-l border-zinc-100 ml-1.5">
              {trajectory && trajectory.filter(t => t.sessions > 0).slice(-4).reverse().map((point, i) => (
                <div key={point.name} className="relative text-[11px] space-y-0.5">
                  <div className={`absolute -left-[16px] top-1 w-2 h-2 rounded-full ${i === 0 ? "bg-purple-600 ring-2 ring-purple-100" : "bg-zinc-300"}`} />
                  <div className={`flex items-center justify-between ${i === 0 ? "font-bold text-zinc-800" : "font-semibold text-zinc-700"}`}>
                    <span>{point.name} {i === 0 && "(Latest)"}</span>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase">{point.sessions} sessions</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Cumulative Mastery: {point.mastery} concepts</p>
                </div>
              ))}
              {(!trajectory || trajectory.filter(t => t.sessions > 0).length === 0) && (
                <div className="text-xs text-zinc-400 italic">No recent sessions found.</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </AppShell>
  );
}
