"use client";

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import TextareaAutosize from 'react-textarea-autosize';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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
  ChevronDown,
  Network
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
  conceptGraph: any | null;
  isInitialPrompt?: boolean;
  isCompletionCheck?: boolean;
}

export default function SessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const initialPrompt = searchParams.get("q");

  const { data: session } = useSession();
  const studentId = (session?.user as any)?.studentProfileId;
  const { concepts } = useStudentData();

  const [steps, setSteps] = useState<InteractionStep[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMemoryModelOpen, setIsMemoryModelOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [steps, isLoading]);

  const initialized = useRef(false);
  const lastSessionId = useRef<string | null>(null);

  // Extract the latest concept graph to display in the sidebar instead of polluting the chat
  const latestConceptGraph = steps.slice().reverse().find(s => s.conceptGraph && Object.keys(s.conceptGraph).length > 0)?.conceptGraph;


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

  const sendMessage = async (message: string) => {
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          session_id: sessionId,
          message,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      
      // Append the new AI step with a null studentAnswer to activate it for the user
      setSteps(prev => [...prev, {
        id: `step-${Date.now()}`,
        aiQuestion: data.response || "Could you walk me through your thinking?",
        studentAnswer: null,
        diagnosis: data.diagnosis || null,
        conceptGraph: data.concept_graph || null,
        isCompletionCheck: data.is_completion_check || false,
      }]);
    } catch (err) {
      console.error("[chat] fetch failed:", err);
      // Append an error step
      setSteps(prev => [...prev, {
        id: `step-${Date.now()}`,
        aiQuestion: "Connection error — please try again.",
        studentAnswer: null,
        diagnosis: null,
        conceptGraph: null,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async (promptText: string) => {
    setIsLoading(true);
    setSteps([{
      id: "step-0",
      aiQuestion: "Session started.",
      studentAnswer: promptText,
      diagnosis: null,
      conceptGraph: null,
      isInitialPrompt: true,
    }]);

    await sendMessage(promptText);
  };

  const handleStudentSubmit = async (e: React.FormEvent | any, stepId: string, overrideValue?: string) => {
    if (e && e.preventDefault) e.preventDefault();
    const val = overrideValue !== undefined ? overrideValue : inputValue;
    if (!val.trim() || isLoading || !studentId) return;

    const userMsg = val.trim();
    if (overrideValue === undefined) setInputValue("");
    setIsLoading(true);

    // Lock in the student's answer on the current step
    setSteps(prev => prev.map(s =>
      s.id === stepId ? { ...s, studentAnswer: userMsg } : s
    ));

    await sendMessage(userMsg);
  };

  return (
    <AppShell headerTitle="Socratic Workspace" headerSubtitle="Interactive Flow" fullBleed={true}>
      <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row relative z-10 max-w-6xl mx-auto w-full overflow-hidden">

        {/* MAIN WORKSHEET COLUMN */}
        <div className="flex-1 relative bg-zinc-50/40 flex flex-col overflow-hidden">
          {/* Subtle Dot Pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #d4d4d8 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col space-y-6 scrollbar-hide pb-32 relative z-10">

          <div className="flex items-center justify-between mb-2 shrink-0">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-950 text-xs font-medium group transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </Link>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMemoryModelOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100 px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide uppercase transition-colors"
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Memory</span>
              </button>
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide uppercase transition-colors">
                <span>End Session</span>
              </Link>
            </div>
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
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100/50 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <p className="text-[11px] font-medium text-amber-700">
                              Misconception detected: <span className="font-semibold">{step.diagnosis.possibleMisconceptions[0]}</span>
                            </p>
                          </div>
                        )}



                        {/* 2. Socratic Question */}
                        <div className={`transition-all ${isActive ? 'text-zinc-900' : 'text-zinc-700'}`}>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                            <div className="prose prose-zinc prose-sm sm:prose-base max-w-none prose-p:leading-relaxed prose-p:font-medium prose-pre:bg-zinc-900 prose-pre:text-zinc-50 prose-code:text-purple-700 prose-code:bg-purple-50 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                              <ReactMarkdown 
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                              >
                                {step.aiQuestion || "Let's explore this further. What are your thoughts?"}
                              </ReactMarkdown>
                            </div>
                          </motion.div>
                        </div>

                        {/* 3. Student Response Area */}
                        {isActive ? (
                          step.isCompletionCheck ? (
                            <div className="pt-3 flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => router.push("/history")}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                🎓 Yes, End Session & View Summary
                              </button>
                              <button
                                onClick={(e) => handleStudentSubmit(e, step.id, "I still have some questions.")}
                                className="flex-1 bg-white text-zinc-600 border border-zinc-200 px-6 py-4 rounded-xl text-sm font-semibold hover:bg-zinc-50 transition-all shadow-sm flex items-center justify-center gap-2"
                              >
                                💬 No, I still have questions
                              </button>
                            </div>
                          ) : (
                            <form onSubmit={(e) => handleStudentSubmit(e, step.id)} className="pt-3">
                            <div className="flex gap-2">
                              <TextareaAutosize
                                autoFocus
                                minRows={1}
                                maxRows={6}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleStudentSubmit(e as any, step.id);
                                  }
                                }}
                                placeholder="Your reasoning (Shift+Enter for new line)..."
                                className="flex-1 bg-white border border-zinc-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all shadow-sm resize-none scrollbar-hide leading-relaxed"
                                disabled={isLoading}
                              />
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={isLoading || !inputValue.trim()}
                                className="bg-zinc-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 h-fit"
                              >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit</span>}
                              </motion.button>
                            </div>
                          </form>
                          )
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
        </div>

        {/* Mobile overlay */}
        <AnimatePresence>
          {isMemoryModelOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMemoryModelOpen(false)}
              className="lg:hidden fixed inset-0 bg-zinc-900/40 z-40" 
            />
          )}
        </AnimatePresence>

        {/* RIGHT SIDEBAR (Concept States Tracking) */}
        <div className={`fixed inset-y-0 right-0 z-50 w-[280px] bg-white border-l border-zinc-100 p-6 shadow-2xl transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-72 lg:shadow-none lg:z-20 overflow-y-auto ${isMemoryModelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h3 className="text-sm font-bold text-zinc-800">Memory Model</h3>
            <button onClick={() => setIsMemoryModelOpen(false)} className="text-zinc-400 hover:text-zinc-800 text-[11px] uppercase tracking-wider font-bold">
               Close
            </button>
          </div>
          <div className="space-y-6">

            <div className="space-y-1 hidden lg:block">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Live Tracking</span>
              <h3 className="text-sm font-bold text-zinc-800">Memory Model</h3>
            </div>

            {/* NEW: Knowledge Map in the Sidebar */}
            {latestConceptGraph && (
              <div className="space-y-3 pb-6 border-b border-zinc-100">
                <div className="flex items-center gap-2 pl-1 mb-1">
                  <Network className="w-3.5 h-3.5 text-purple-500" />
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Knowledge Map</h4>
                </div>
                <div className="bg-gradient-to-br from-purple-50/50 to-white border border-purple-100/60 rounded-xl p-3 shadow-sm flex flex-col gap-2.5">
                  {Object.entries(latestConceptGraph).map(([concept, data]: [string, any]) => (
                    <div key={concept} className="bg-white border border-purple-100/40 rounded-lg p-2.5 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[11.5px] font-bold text-zinc-800 leading-tight pl-1">{concept}</span>
                      {data.prerequisites && data.prerequisites.length > 0 && (
                        <div className="text-[9.5px] text-zinc-500 flex items-start gap-1.5 leading-tight mt-1 pt-1.5 border-t border-purple-50/50 pl-1">
                          <span className="font-medium text-purple-600/70 mt-0.5 uppercase tracking-wide text-[8px]">Requires</span>
                          <span className="flex-1 font-medium">{data.prerequisites.join("  →  ")}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
