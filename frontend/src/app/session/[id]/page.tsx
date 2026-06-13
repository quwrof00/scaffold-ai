"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Target,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { useStudentData } from "@/hooks/useStudentData";
import { API_BASE } from "@/lib/api";

interface DiagnosisData {
  requiredConcept?: string;
  possibleMisconceptions?: string[];
  question?: string;
}

interface InteractionStep {
  id: string;
  aiQuestion: string;
  studentAnswer: string | null; // null if this is the active, unanswered step
  diagnosis: DiagnosisData | null;
  isInitialPrompt?: boolean;
}

export default function SessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;
  const initialPrompt = searchParams.get("q");

  const { data: session } = useSession();
  const studentId = (session?.user as any)?.studentProfileId;
  const { concepts } = useStudentData();

  const [steps, setSteps] = useState<InteractionStep[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [steps, isLoading]);

  const initialized = useRef(false);
  const lastSessionId = useRef<string | null>(null);

  if (lastSessionId.current !== sessionId) {
    initialized.current = false;
    lastSessionId.current = sessionId;
  }

  // Handle Initial Prompt Auto-Start
  useEffect(() => {
    if (initialPrompt && !initialized.current && studentId) {
      initialized.current = true;
      startSession(initialPrompt);
    }
  }, [initialPrompt, studentId, sessionId]);

  const startSession = async (promptText: string) => {
    setIsLoading(true);
    // Add the student's initial prompt as the zero-th step
    setSteps([{
      id: "step-0",
      aiQuestion: "Session started.",
      studentAnswer: promptText,
      diagnosis: null,
      isInitialPrompt: true
    }]);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          session_id: sessionId,
          message: promptText
        })
      });
      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();

      // The API returns the FIRST guided question and any diagnosis.
      // We push this as the new ACTIVE step (studentAnswer = null)
      setSteps(prev => [...prev, {
        id: `step-${Date.now()}`,
        aiQuestion: data.response,
        studentAnswer: null,
        diagnosis: data.diagnosis || null
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent, stepId: string) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !studentId) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    // 1. Lock in the answer for the current active step
    setSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, studentAnswer: userMsg } : s
    ));

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          session_id: sessionId,
          message: userMsg
        })
      });
      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();

      // 2. Create the next active step
      setSteps(prev => [...prev, {
        id: `step-${Date.now()}`,
        aiQuestion: data.response,
        studentAnswer: null,
        diagnosis: data.diagnosis || null
      }]);

    } catch (err) {
      console.error(err);
      // Fallback if network fails
      setSteps(prev => [...prev, {
        id: `step-error-${Date.now()}`,
        aiQuestion: "I encountered an error connecting to the server. Please try again.",
        studentAnswer: null,
        diagnosis: null
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell headerTitle="Socratic Workspace" headerSubtitle="Interactive Flow" fullBleed={true}>
      <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row relative z-10 max-w-6xl mx-auto w-full overflow-hidden">

        {/* MAIN WORKSHEET COLUMN */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col space-y-6 scrollbar-hide pb-32">

          <div className="flex items-center justify-between mb-2 shrink-0">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-950 text-xs font-medium group transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </Link>

            <Link href="/dashboard" className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide uppercase transition-colors">
              <span>End Session</span>
            </Link>
          </div>

          <div className="space-y-12 pb-24">
            {steps.length === 0 && !isLoading && (
              <div className="text-center py-20 text-zinc-400">
                <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Initializing your personalized Socratic sequence...</p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {steps.map((step, index) => {
                // The Initial Prompt has a special "Header" look
                if (step.isInitialPrompt) {
                  return (
                    <motion.div key={step.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pb-8 border-b border-zinc-200/50">
                      <h2 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-3">Target Objective</h2>
                      <p className="text-2xl font-black text-zinc-800 leading-tight">"{step.studentAnswer}"</p>
                    </motion.div>
                  );
                }

                const isActive = step.studentAnswer === null;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                  >
                    {/* Left connection line for completed steps */}
                    {!isActive && (
                      <div className="absolute left-6 top-24 bottom-[-3rem] w-[2px] bg-purple-100" />
                    )}

                    <div className="flex gap-4">
                      {/* Step Number Badge */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors z-10 ${isActive ? 'bg-zinc-900 text-white shadow-md' : 'bg-zinc-100 text-zinc-400'
                        }`}>
                        {index}
                      </div>

                      <div className="flex-1 space-y-3 pt-1">

                        {/* 1. Diagnosis Callout (if any) */}
                        {step.diagnosis && step.diagnosis.possibleMisconceptions && step.diagnosis.possibleMisconceptions.length > 0 && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100/50">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <p className="text-[11px] font-medium text-amber-700">
                              Misconception detected: <span className="font-semibold">{step.diagnosis.possibleMisconceptions[0]}</span>
                            </p>
                          </div>
                        )}

                        {/* 2. Socratic Question */}
                        <div className={`transition-all ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>
                          <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">{step.aiQuestion || "Let's explore this further. What are your thoughts?"}</p>
                        </div>

                        {/* 3. Student Response Area */}
                        {isActive ? (
                          <form onSubmit={(e) => handleStudentSubmit(e, step.id)} className="pt-3">
                            <div className="flex gap-2">
                              <input
                                autoFocus
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Your reasoning..."
                                className="flex-1 bg-white border border-zinc-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all shadow-sm"
                                disabled={isLoading}
                              />
                              <button
                                type="submit"
                                disabled={isLoading || !inputValue.trim()}
                                className="bg-zinc-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                              >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit</span>}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="pt-2">
                            <div className="inline-block bg-zinc-50 border border-zinc-100 rounded-lg px-4 py-2">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">Your Answer</span>
                              <p className="text-sm text-zinc-700 font-medium">{step.studentAnswer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Global Loading state for the next step */}
              {isLoading && steps.length > 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5 mt-8">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 z-10 shrink-0">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="flex-1 bg-white/50 border border-zinc-100 rounded-2xl p-6 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    <span className="text-sm font-medium text-zinc-500">Evaluating your response and formulating next step...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        </div>

        {/* RIGHT SIDEBAR (Concept States Tracking) */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-zinc-100 bg-white p-6 shrink-0 relative z-20 overflow-y-auto">
          <div className="space-y-6">

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Live Tracking</span>
              <h3 className="text-sm font-bold text-zinc-800">Memory Model</h3>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider pl-1">Concept Mastery</h4>
              {concepts.length === 0 ? (
                <div className="text-[11px] text-zinc-400 italic pl-1">No concepts mapped yet...</div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {Object.entries(concepts.reduce((acc, c) => {
                    (acc[c.subject] = acc[c.subject] || []).push(c);
                    return acc;
                  }, {} as Record<string, typeof concepts>)).map(([subject, subjectConcepts]) => (
                    <details key={subject} className="group bg-white border border-zinc-100 rounded-xl shadow-sm overflow-hidden" open>
                      <summary className="text-xs font-semibold text-zinc-700 p-3 cursor-pointer hover:bg-zinc-50 flex items-center justify-between outline-none">
                        <span>{subject}</span>
                        <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 pt-0 border-t border-zinc-50 space-y-2 bg-zinc-50/50">
                        {subjectConcepts.map(c => (
                          <div key={c.id} className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-zinc-600 line-clamp-1 mr-2" title={c.concept}>{c.concept}</span>
                            {c.status === "KNOWN" && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded shrink-0">KNOWN</span>}
                            {c.status === "PARTIAL" && <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded shrink-0">PARTIAL</span>}
                            {c.status === "UNKNOWN" && <span className="text-[9px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded shrink-0">UNKNOWN</span>}
                            {c.status === "MISCONCEPTION" && <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded shrink-0">MISCONCEPTION</span>}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </AppShell>
  );
}
