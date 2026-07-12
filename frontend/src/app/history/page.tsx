"use client";

import React, { useState } from "react";
import { 
  Search, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Info,
  X
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import { AppShell } from "@/components/layout/AppShell";
import { useStudentData } from "@/hooks/useStudentData";

interface LearningSession {
  id: string;
  topic: string;
  subject: string;
  date: string;
  outcome: "Resolved" | "Partially Resolved" | "Needs Review";
  confidenceChange: string;
  masteryChange: string;
  originalQuestion: string;
  diagnosis: string;
  keyMisconception: string;
  reflectionSummary: string;
}

const HISTORICAL_SESSIONS: LearningSession[] = [
  {
    id: "hist-1",
    topic: "Factorisation",
    subject: "Mathematics",
    date: "2 days ago",
    outcome: "Resolved",
    confidenceChange: "+12%",
    masteryChange: "+8%",
    originalQuestion: "Solve x² - 5x + 6 = 0",
    diagnosis: "Possible struggle with trinomial factorization.",
    keyMisconception: "Sign alignment inside brackets when sum is negative but product is positive.",
    reflectionSummary: "I realized both factors must share the sign of the sum since the product is positive. Made factor listing easier."
  },
  {
    id: "hist-2",
    topic: "Unit Conversion",
    subject: "Physics",
    date: "5 days ago",
    outcome: "Partially Resolved",
    confidenceChange: "+4%",
    masteryChange: "+3%",
    originalQuestion: "Convert 72 km/h to m/s",
    diagnosis: "Multi-step conversion friction.",
    keyMisconception: "Bypassing metric factors of ten when dividing hourly scales.",
    reflectionSummary: "Needed a step-by-step reminder that 1 km = 1000m and 1 hr = 3600s. I should multiply by 5/18."
  },
  {
    id: "hist-3",
    topic: "Fractions",
    subject: "Mathematics",
    date: "1 week ago",
    outcome: "Needs Review",
    confidenceChange: "-2%",
    masteryChange: "+1%",
    originalQuestion: "Simplify (3x / 4) + (2x / 5)",
    diagnosis: "Fraction common denominator challenges.",
    keyMisconception: "Adding numerators directly without finding the Least Common Multiple (LCM) of denominators.",
    reflectionSummary: "I rushed the step and added numerators. ScaffoldAI prompted me to list factors of denominators first next time."
  },
  {
    id: "hist-4",
    topic: "Newton's Second Law",
    subject: "Physics",
    date: "1 week ago",
    outcome: "Resolved",
    confidenceChange: "+8%",
    masteryChange: "+6%",
    originalQuestion: "Calculate force for m = 12kg, a = 3m/s²",
    diagnosis: "Equation manipulation check.",
    keyMisconception: "Sign alignment of net force on free body diagram.",
    reflectionSummary: "Drawing the arrows helps verify that net force is mass times net acceleration."
  },
  {
    id: "hist-5",
    topic: "Periodic Trends",
    subject: "Chemistry",
    date: "2 weeks ago",
    outcome: "Resolved",
    confidenceChange: "+10%",
    masteryChange: "+5%",
    originalQuestion: "Which has a higher ionization energy: Nitrogen or Oxygen?",
    diagnosis: "Electron configuration exceptions.",
    keyMisconception: "Confusing atomic radius trends with half-filled p-orbital stability.",
    reflectionSummary: "Oxygen has a paired electron in the p-orbital which is easier to remove than half-filled Nitrogen."
  }
];

export default function HistoryPage() {
  const { sessions, loading } = useStudentData();
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Get active selected session
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  // Dynamic filter logic
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      (s.topic || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.subject || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "All" || s.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  // Get unique subjects for filter pills
  const subjects = ["All", ...Array.from(new Set(sessions.map((s) => s.subject).filter(Boolean) as string[]))];

  return (
    <AppShell headerTitle="Learning History" headerSubtitle="Your Past Socratic Explorations">
      
      {/* Main Page Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pb-12">
        
        {/* LEFT / MAIN COLUMN (2/3 width or full width when no panel selected) */}
        <div className={`space-y-6 transition-all duration-300 ${selectedSessionId ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          
          {/* Header Explanation */}
          <div className="bg-white border border-zinc-200/50 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.02)]">
            <h1 className="text-3xl font-light tracking-tight text-zinc-900 mb-2" style={{ fontFamily: 'var(--font-serif-editorial)' }}>
              Session History
            </h1>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xl">
              Review your past learning sessions and track how your understanding has improved over time. Click on any row to open the Socratic worksheet details.
            </p>
          </div>

          {/* Filter Bar Panel */}
          <div className="bg-white border border-zinc-200/50 rounded-2xl p-4.5 shadow-[0_8px_30px_rgba(120,80,200,0.02)] space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              
              {/* Search text input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search by topic or question..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-zinc-800 placeholder-zinc-400"
                />
              </div>

              {/* Subject Filters */}
              <div className="flex bg-zinc-100 p-0.5 rounded-lg text-xs font-semibold self-start md:self-auto overflow-x-auto">
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSubjectFilter(sub)}
                    className={`px-3 py-1 rounded-md transition-all text-[10px] uppercase tracking-wider whitespace-nowrap ${subjectFilter === sub ? 'bg-white text-purple-700 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>



          </div>

          {/* Sessions List Table Card */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-bold uppercase tracking-wider text-[9px] pb-2">
                    <th className="py-2.5">Topic / Subject</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Intent</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-55">
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedSessionId(s.id)}
                        className={`hover:bg-zinc-50/70 transition-colors cursor-pointer ${selectedSessionId === s.id ? 'bg-purple-50/20' : ''}`}
                      >
                        <td className="py-4">
                          <div className="font-semibold text-zinc-900">{s.topic || "General Session"}</div>
                          <div className="text-[10px] text-zinc-400 font-medium">{s.subject || "—"}</div>
                        </td>
                        <td className="py-4 text-zinc-500 font-medium">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                            s.intent === "CONCEPT_UNDERSTANDING" ? 'bg-purple-50 border-purple-200 text-purple-700' :
                            s.intent === "PROBLEM_SOLVING" ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            'bg-zinc-50 border-zinc-200 text-zinc-600'
                          }`}>
                            {s.intent === "CONCEPT_UNDERSTANDING" ? "Concept" : s.intent === "PROBLEM_SOLVING" ? "Problem" : "General"}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            s.status === "COMPLETED" ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          <ChevronRight className={`w-4 h-4 text-zinc-400 transform transition-transform ${selectedSessionId === s.id ? 'translate-x-1 text-purple-500' : ''}`} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400">
                        <p className="text-xs">{loading ? "Loading sessions…" : sessions.length === 0 ? "No sessions yet. Start learning!" : "No sessions match your filters."}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN DETAIL PANEL (1/3 width, conditional overlay/split) */}
        <AnimatePresence>
          {selectedSession && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="lg:col-span-1 bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(120,80,200,0.03)] space-y-6 h-fit relative"
            >
              <button
                onClick={() => setSelectedSessionId(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1 pr-6">
                <span className="text-[9px] font-bold text-purple-600 uppercase tracking-widest block">{selectedSession.subject} History</span>
                <h3 className="text-lg font-bold text-zinc-800 leading-tight">{selectedSession.topic || "Session"}</h3>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {selectedSession.createdAt ? new Date(selectedSession.createdAt).toLocaleDateString() : ""}
                </p>
              </div>

              <div className="border-t border-b border-zinc-100 py-3.5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Intent</span>
                  <span className="font-semibold text-zinc-800">{selectedSession.intent === "CONCEPT_UNDERSTANDING" ? "Concept Understanding" : selectedSession.intent || "General"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Status</span>
                  <span className="font-semibold text-emerald-700">{selectedSession.status}</span>
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs text-zinc-600 leading-relaxed">
                <Sparkles className="w-4 h-4 text-purple-500 mb-1" />
                <span>Session completed on {selectedSession.createdAt ? new Date(selectedSession.createdAt).toLocaleDateString("en-US", { dateStyle: "long" }) : "—"}. Visit the Stuck Map to see what concepts were explored.</span>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </AppShell>
  );
}
