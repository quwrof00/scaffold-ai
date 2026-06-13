"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ChevronRight, 
  Flame, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Check,
  GraduationCap,
  Layers,
  BookOpen,
  Users,
  Compass,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Calendar
} from "lucide-react";

import { 
  MOCK_STUDENT, 
  MOCK_STUCK_POINTS, 
  MOCK_SUBJECT_PROGRESS 
} from "@/mock-data";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedStuckPoint, setExpandedStuckPoint] = useState<string | null>("stuck-1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
      }, 3000);
    }
  };

  // Generate 7x15 heatmap cells with mock activity levels
  const heatmapData = Array.from({ length: 105 }, (_, i) => {
    const values = [0, 1, 2, 3, 4];
    // Weight it so there are more active days in specific areas to simulate real studying
    let level = 0;
    if (i % 7 === 0 || i % 7 === 2 || i % 7 === 4) {
      level = values[(i + 2) % 5];
    } else if (i % 3 === 0) {
      level = values[i % 3];
    }
    return { id: i, level };
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden text-zinc-900 bg-gradient-to-br from-[#f3f0ff] via-[#fae8ff] to-[#fdf2f8]">
      
      {/* BACKGROUND ACCENTS matching the reference soft blur glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-300/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-1/4 w-[400px] h-[400px] bg-pink-300/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* NAVBAR */}
      <header className="w-full py-6 px-6 md:px-12 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Navigation placement matching reference: left links, center logo, right CTA */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-zinc-600/90 w-1/3">
            <Link href="#about" className="hover:text-zinc-950 transition-colors">About</Link>
            <Link href="#features" className="hover:text-zinc-950 transition-colors">Features</Link>
            <Link href="/teacher" className="hover:text-zinc-950 transition-colors">For Teachers</Link>
            <Link href="/parent" className="hover:text-zinc-950 transition-colors">For Parents</Link>
          </nav>

          {/* Logo center */}
          <div className="flex items-center justify-center w-full md:w-1/3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 shadow-md transform group-hover:rotate-6 transition-transform">
                {/* SVG double arrow representing ScaffoldAI */}
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 bg-gradient-to-r from-purple-800 to-pink-700 bg-clip-text text-transparent">ScaffoldAI</span>
            </Link>
          </div>

          {/* CTA Right */}
          <div className="flex justify-end w-1/3 items-center">
            {/* Small mobile nav trigger */}
            <div className="md:hidden mr-4">
              <button className="text-zinc-600 hover:text-zinc-900 text-sm font-medium">Menu</button>
            </div>
            
            <Link href="/dashboard" className="bg-white hover:bg-zinc-50 border border-zinc-200/80 text-zinc-900 px-5 py-2 rounded-full text-sm font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 md:pt-24 pb-20 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        
        {/* Announcement Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/60 border border-purple-200/50 text-[13px] font-medium text-purple-700 hover:bg-purple-100/80 transition-all cursor-pointer shadow-sm mb-8 hover:scale-[1.01]"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
          <span>Now helping students learn without answer dependency</span>
          <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
        </motion.div>

        {/* Hero Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-[46px] sm:text-6xl md:text-8xl font-light tracking-tight leading-[1.05] text-[#2c2235] max-w-4xl"
          style={{ fontFamily: 'var(--font-serif-editorial)' }}
        >
          A truly <span className="italic font-normal text-purple-600">personalized</span> <br />
          learning companion
        </motion.h1>

        {/* Hero Description */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-zinc-600 text-lg md:text-[20px] font-normal leading-relaxed mt-7 mb-9 max-w-2xl text-center px-4"
        >
          ScaffoldAI helps students arrive at answers themselves through personalized Socratic tutoring, misconception tracking, and adaptive guidance.
        </motion.p>

        {/* Primary CTA (Email Input Pill Row matching reference style) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-md px-4"
        >
          <form onSubmit={handleSubmit} className="relative flex items-center p-1.5 rounded-full bg-white border border-zinc-200/80 shadow-[0_12px_32px_rgba(120,80,200,0.06)] hover:border-purple-300/80 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-100 transition-all">
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-5 pr-4 py-2.5 bg-transparent text-zinc-800 placeholder-zinc-400 focus:outline-none text-sm font-medium"
              required
            />
            <button 
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-sm px-6 py-2.5 rounded-full hover:opacity-95 active:scale-[0.98] transition-all whitespace-nowrap shadow-[0_2px_8px_rgba(168,85,247,0.3)] flex items-center gap-1.5"
            >
              {isSubmitted ? (
                <>
                  <Check className="w-4 h-4" />
                  Joined!
                </>
              ) : (
                "Get Started"
              )}
            </button>
          </form>

          {/* Secondary Text */}
          <div className="text-zinc-500 text-xs mt-4 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Free for students during beta.</span>
          </div>
        </motion.div>

      </section>

      {/* MOCKUP SHOWCASE SECTION (Laptop and iPhone composition matching reference) */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pb-32">
        <div className="relative flex justify-center items-center w-full">
          
          {/* LAPTOP FRAME MOCKUP (MacBook center) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 50 }}
            className="w-full max-w-[960px] aspect-[16/10] bg-zinc-950 rounded-2xl md:rounded-[24px] border-4 border-zinc-800 shadow-[0_32px_64px_rgba(0,0,0,0.18),0_16px_32px_rgba(120,80,200,0.06)] overflow-hidden relative"
          >
            
            {/* Laptop Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-4 bg-zinc-950 rounded-b-xl z-50 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="w-1 h-1 rounded-full bg-blue-900" />
            </div>

            {/* Laptop Window Shell */}
            <div className="w-full h-full bg-[#fbfbfe] flex flex-col pt-4">
              
              {/* Browser Address Bar / Header */}
              <div className="w-full h-10 border-b border-zinc-200/60 px-4 flex items-center justify-between bg-zinc-50/80">
                {/* Red, Yellow, Green Buttons */}
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                {/* URL Bar */}
                <div className="bg-zinc-200/50 text-[11px] text-zinc-500 px-12 py-1 rounded-md max-w-md w-full text-center truncate flex items-center justify-center gap-1">
                  <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>app.scaffoldai.com/dashboard/aria-chen</span>
                </div>
                {/* Spacing alignment */}
                <div className="w-12" />
              </div>

              {/* Application Area */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* Left Dashboard Sidebar */}
                <aside className="w-48 border-r border-zinc-200/60 bg-zinc-50/50 flex flex-col p-4 justify-between select-none">
                  <div className="space-y-6">
                    {/* User Profile */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                        AC
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-semibold text-zinc-800 truncate">{MOCK_STUDENT.name}</h4>
                        <p className="text-[10px] text-zinc-500">{MOCK_STUDENT.grade}</p>
                      </div>
                    </div>

                    {/* Nav Items */}
                    <div className="space-y-1">
                      <div 
                        onClick={() => setActiveTab("dashboard")}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${activeTab === 'dashboard' ? 'bg-purple-50 text-purple-700' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                      </div>
                      <div 
                        onClick={() => setActiveTab("tutoring")}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${activeTab === 'tutoring' ? 'bg-purple-50 text-purple-700' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Socratic Tutor</span>
                        <div className="ml-auto w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                      </div>
                      <div 
                        onClick={() => setActiveTab("heatmap")}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${activeTab === 'heatmap' ? 'bg-purple-50 text-purple-700' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Mastery Heatmap</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Badge Preview */}
                    <div className="p-2.5 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-lg border border-amber-200/50 text-[10px]">
                      <div className="flex items-center gap-1 font-semibold text-amber-800">
                        <span>🔥</span>
                        <span>{MOCK_STUDENT.streak} Days Streak</span>
                      </div>
                      <p className="text-amber-700/80 mt-0.5">Keep it up! Next badge in 3 days.</p>
                    </div>

                    <div className="text-[10px] text-zinc-400 text-center font-medium">
                      Level {MOCK_STUDENT.level} • {MOCK_STUDENT.xp} XP
                    </div>
                  </div>
                </aside>

                {/* Dashboard Main Panel */}
                <main className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                  <AnimatePresence mode="wait">
                    {activeTab === "dashboard" && (
                      <motion.div 
                        key="dashboard-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        {/* Welcome Heading */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-bold text-zinc-800">Student Dashboard</h2>
                            <p className="text-xs text-zinc-500">Track and refine your concept mastery with Socratic guidance.</p>
                          </div>
                          <span className="text-[10px] bg-purple-100/60 border border-purple-200/50 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                            ✨ Active Session
                          </span>
                        </div>

                        {/* Top Widgets Grid: Confidence & Streak */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Confidence Score Card */}
                          <div className="bg-white border border-zinc-200/50 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
                            <div className="space-y-2">
                              <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Confidence Score</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-zinc-800">64%</span>
                                <span className="text-xs text-emerald-500 font-bold flex items-center">
                                  <TrendingUp className="w-3 h-3 mr-0.5" />
                                  +5.4%
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500">Overall confidence across 4 subjects this week.</p>
                            </div>
                            
                            {/* Circular Progress Gauge */}
                            <div className="relative w-16 h-16 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" className="stroke-zinc-100 fill-none" strokeWidth="4.5" />
                                <circle cx="32" cy="32" r="28" className="stroke-purple-600 fill-none" strokeWidth="4.5" strokeDasharray="176" strokeDashoffset={176 - (176 * 64) / 100} strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Target className="w-5 h-5 text-purple-500" />
                              </div>
                            </div>
                          </div>

                          {/* Streak Details Card */}
                          <div className="bg-white border border-zinc-200/50 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Learning Streak</span>
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                                <Flame className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                                <span>{MOCK_STUDENT.streak} Days</span>
                              </div>
                            </div>
                            
                            {/* Streak Row Timeline */}
                            <div className="grid grid-cols-7 gap-1.5 mt-3">
                              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
                                const activeDays = [true, false, true, true, true, true, false];
                                const isActive = activeDays[idx];
                                return (
                                  <div key={idx} className="flex flex-col items-center gap-1">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-amber-100/80 text-amber-700 border border-amber-300' : 'bg-zinc-100 text-zinc-400 border border-transparent'}`}>
                                      {isActive ? "🔥" : day}
                                    </div>
                                    <span className="text-[9px] text-zinc-400 font-medium">{day}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Middle Section: Weak Topics Tracking */}
                        <div className="bg-white border border-zinc-200/50 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-pink-500" />
                              <span className="text-xs font-bold text-zinc-800">Misconceptions & Stuck Points (Misconception Tracking)</span>
                            </div>
                            <span className="text-[10px] text-zinc-400">Review recommendations below</span>
                          </div>

                          <div className="space-y-2.5">
                            {MOCK_STUCK_POINTS.map((sp) => {
                              const isExpanded = expandedStuckPoint === sp.id;
                              return (
                                <div 
                                  key={sp.id} 
                                  className="group border border-zinc-100 rounded-lg p-2.5 hover:border-purple-200 hover:bg-purple-50/20 transition-all cursor-pointer"
                                  onClick={() => setExpandedStuckPoint(isExpanded ? null : sp.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${sp.severity === 'deep' ? 'bg-red-500' : sp.severity === 'moderate' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                      <h5 className="text-xs font-semibold text-zinc-700">{sp.concept}</h5>
                                      <span className="text-[9px] px-1.5 py-0.2 bg-zinc-100 text-zinc-500 rounded font-medium">{sp.subject}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span>{isExpanded ? "Collapse" : "Ask Socratic Tutor"}</span>
                                      <ChevronRight className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-zinc-500 mt-1 pl-4 line-clamp-1">{sp.description}</p>
                                  
                                  {/* Expand Socratic Tutoring Interaction inside Mockup! */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 pl-4 pt-3 border-t border-zinc-100 overflow-hidden space-y-2 text-[10px]"
                                      >
                                        <div className="bg-purple-50 border border-purple-100 rounded-lg p-2">
                                          <div className="font-semibold text-purple-800 mb-0.5">🤖 Socratic Guide:</div>
                                          <p className="text-purple-950 font-normal italic">
                                            "Let's look at the formula ax² + bx + c. When the coefficient a is not 1, say 3x² + 6x + 2 = 0, what is the easiest first step to isolate x²?"
                                          </p>
                                        </div>
                                        <div className="bg-zinc-100 rounded-lg p-2 text-right text-zinc-700 max-w-[80%] ml-auto">
                                          <span>"Maybe we divide all the terms in the equation by 3?"</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold pl-1">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                          <span>Awesome deduction! Let's do that together.</span>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottom Heatmap Grid Preview */}
                        <div className="bg-white border border-zinc-200/50 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-zinc-800">Concept Mastery Heatmap</span>
                            <span className="text-[10px] text-zinc-400">Concept repetitions & practice density</span>
                          </div>
                          
                          {/* 7 rows x 15 columns Grid */}
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col justify-between text-[9px] text-zinc-400 h-16 font-medium">
                              <span>Mon</span>
                              <span>Wed</span>
                              <span>Fri</span>
                            </div>
                            <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1 max-w-full overflow-x-auto">
                              {heatmapData.slice(0, 105).map((cell) => {
                                const colors = [
                                  "bg-zinc-100", // 0
                                  "bg-purple-100/80", // 1
                                  "bg-purple-300/80", // 2
                                  "bg-purple-500", // 3
                                  "bg-pink-500" // 4
                                ];
                                return (
                                  <div 
                                    key={cell.id} 
                                    className={`w-2 h-2 rounded-sm ${colors[cell.level]} transition-colors hover:scale-125 duration-100 cursor-pointer`}
                                    title={`Level: ${cell.level}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "tutoring" && (
                      <motion.div 
                        key="tutoring-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-bold text-zinc-800">Socratic Chat Session</h2>
                            <p className="text-xs text-zinc-500">Solve equations step-by-step without answer lookup dependency.</p>
                          </div>
                        </div>

                        <div className="border border-zinc-200/60 bg-white rounded-xl p-4 h-80 flex flex-col justify-between shadow-sm">
                          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            <div className="flex gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center font-bold text-[10px]">S</div>
                              <div className="bg-purple-50 rounded-lg p-3 text-xs max-w-[85%] text-zinc-800">
                                Let's investigate <b>x² - 4x - 5 = 0</b>. Instead of solving it for you, let's explore: if we want to factor this quadratic, what two numbers multiply to -5 and add to -4?
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <div className="bg-zinc-100 rounded-lg p-3 text-xs max-w-[85%] text-zinc-800">
                                How about -5 and +1?
                              </div>
                              <div className="w-6 h-6 rounded-full bg-pink-100 border border-pink-200 text-pink-600 flex items-center justify-center font-bold text-[10px]">A</div>
                            </div>
                            <div className="flex gap-2">
                              <div className="w-6 h-6 rounded-full bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center font-bold text-[10px]">S</div>
                              <div className="bg-purple-50 rounded-lg p-3 text-xs max-w-[85%] text-zinc-800">
                                Brilliant! You found them. Now write the equation in its factored form.
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-zinc-100 flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Type your mathematical reasoning..." 
                              className="flex-1 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-zinc-50"
                              disabled
                            />
                            <button className="bg-purple-600 text-white text-xs px-4 py-1.5 rounded-lg font-semibold hover:bg-purple-700 active:scale-[0.98] transition-all" disabled>
                              Send
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "heatmap" && (
                      <motion.div 
                        key="heatmap-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div>
                          <h2 className="text-lg font-bold text-zinc-800">Interactive Mastery Matrix</h2>
                          <p className="text-xs text-zinc-500">Every grid point is a concept lesson. Click nodes to practice.</p>
                        </div>

                        <div className="bg-white border border-zinc-200/50 rounded-xl p-5 shadow-sm space-y-4">
                          <div className="grid grid-cols-5 gap-3">
                            {MOCK_SUBJECT_PROGRESS.map((sub) => (
                              <div key={sub.subject} className="border border-zinc-100 rounded-lg p-3 text-center space-y-1 hover:border-purple-200 transition-colors">
                                <div className="text-[10px] text-zinc-400 font-semibold uppercase">{sub.subject}</div>
                                <div className="text-base font-extrabold text-zinc-800">{sub.masteryPercent}%</div>
                                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-500" style={{ width: `${sub.masteryPercent}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="border border-zinc-100 rounded-xl p-4 bg-slate-50/50">
                            <h4 className="text-xs font-bold text-zinc-700 mb-2.5">Detailed Mastery Heatmap Timeline</h4>
                            <div className="grid grid-cols-12 gap-1.5">
                              {Array.from({ length: 120 }).map((_, i) => {
                                const activeLevels = [
                                  "bg-zinc-100", 
                                  "bg-purple-100", 
                                  "bg-purple-200", 
                                  "bg-purple-300", 
                                  "bg-purple-400", 
                                  "bg-purple-500", 
                                  "bg-purple-600",
                                  "bg-pink-400",
                                  "bg-pink-500",
                                  "bg-pink-600"
                                ];
                                const levelIndex = (i * 7 + 13) % 10;
                                return (
                                  <div 
                                    key={i} 
                                    className={`aspect-square w-full rounded-md ${activeLevels[levelIndex]} border border-white hover:scale-110 transition-transform cursor-pointer`}
                                    title={`Topic ${i + 1} Mastery`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </main>
              </div>

            </div>

          </motion.div>

          {/* IPHONE MOCKUP FRAME (Bottom right overlapping, matching reference) */}
          <motion.div
            initial={{ opacity: 0, x: 50, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.1, delay: 0.6, type: "spring", stiffness: 45 }}
            className="absolute -bottom-12 right-0 md:right-8 w-60 aspect-[9/18.5] bg-zinc-950 rounded-[44px] border-4 border-zinc-800 shadow-[0_24px_50px_rgba(0,0,0,0.22),0_8px_24px_rgba(120,80,200,0.08)] ring-8 ring-zinc-900 overflow-hidden hidden sm:block z-40 hover:scale-[1.03] transition-transform"
          >
            {/* Dynamic Island Screen notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-950 rounded-full z-50 flex items-center justify-center">
              <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-900/40" />
            </div>

            {/* Mobile Interface Container */}
            <div className="w-full h-full bg-[#fbfbfe] pt-10 px-3 pb-3 flex flex-col justify-between">
              
              {/* Top User Pill */}
              <div className="flex items-center justify-between bg-white border border-zinc-200/50 p-2 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-[9px]">
                    AC
                  </div>
                  <div>
                    <h5 className="text-[9px] font-bold text-zinc-800">Aria Chen</h5>
                    <p className="text-[7px] text-zinc-400">Level {MOCK_STUDENT.level} • {MOCK_STUDENT.grade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-600 text-[8px] font-extrabold bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                  <span>🔥</span>
                  <span>{MOCK_STUDENT.streak}</span>
                </div>
              </div>

              {/* Mobile Stats list */}
              <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-0.5 scrollbar-none">
                
                {/* Confidence radial pill card */}
                <div className="bg-white border border-zinc-200/50 p-2.5 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[7px] font-bold uppercase text-zinc-400 tracking-wider">Confidence</span>
                      <h4 className="text-base font-extrabold text-zinc-800 mt-0.5">64%</h4>
                    </div>
                    {/* Circle */}
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="16" cy="16" r="13" className="stroke-zinc-100 fill-none" strokeWidth="2.5" />
                        <circle cx="16" cy="16" r="13" className="stroke-purple-600 fill-none" strokeWidth="2.5" strokeDasharray="81" strokeDashoffset={81 - (81 * 64) / 100} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Target className="w-2.5 h-2.5 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stuck Moment Alert */}
                <div className="bg-pink-50/50 border border-pink-100 p-2.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-pink-500" />
                    <span className="text-[8px] font-extrabold text-pink-800">Tracked Stuck Topic</span>
                  </div>
                  <h6 className="text-[9px] font-bold text-zinc-800">Completing the Square</h6>
                  <p className="text-[7.5px] text-zinc-500 leading-normal line-clamp-2">"Confused about how to rearrange terms when leading coefficient ≠ 1"</p>
                </div>

                {/* Subject Mastery checklist */}
                <div className="bg-white border border-zinc-200/50 p-2.5 rounded-xl space-y-1.5">
                  <span className="text-[7px] font-bold uppercase text-zinc-400 tracking-wider block">Subject Mastery</span>
                  <div className="space-y-1">
                    {MOCK_SUBJECT_PROGRESS.map((sub) => (
                      <div key={sub.subject} className="flex items-center justify-between text-[8px]">
                        <span className="text-zinc-600 font-medium">{sub.subject}</span>
                        <div className="flex items-center gap-1.5 w-1/2">
                          <div className="flex-1 bg-zinc-100 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${sub.masteryPercent}%` }} />
                          </div>
                          <span className="text-zinc-800 font-bold">{sub.masteryPercent}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom Socratic Prompt Button */}
              <button 
                onClick={() => {
                  setActiveTab("tutoring");
                  const mainSection = document.querySelector('section');
                  if (mainSection) mainSection.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-[9.5px] py-2 rounded-xl text-center shadow-md active:scale-95 transition-all mt-1 hover:opacity-95"
              >
                Launch Socratic Helper
              </button>

            </div>
          </motion.div>

        </div>
      </section>

      {/* DETAILED FEATURES (Avoiding generic sections, prioritizing visual fidelity) */}
      <section id="features" className="w-full max-w-6xl mx-auto px-6 py-20 relative z-20 border-t border-purple-100/60">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h3 className="text-3xl md:text-5xl font-light tracking-tight text-[#2c2235] mb-4" style={{ fontFamily: 'var(--font-serif-editorial)' }}>
            Learn dynamically, arrive at answers naturally
          </h3>
          <p className="text-zinc-600 text-sm md:text-base leading-relaxed">
            By avoiding direct answer lookups, ScaffoldAI engages critical thinking to ensure students comprehend the underlying logic of mathematics, physics, and science.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white/80 border border-zinc-200/50 p-8 rounded-2xl shadow-[0_4px_16px_rgba(120,80,200,0.03)] hover:shadow-[0_12px_24px_rgba(120,80,200,0.06)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center mb-6">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-zinc-950 mb-2">Socratic Guidance</h4>
            <p className="text-zinc-600 text-sm leading-relaxed">
              Our tutor asks open-ended questions designed around the student's reasoning, encouraging logical leaps without feeding direct answers.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 border border-zinc-200/50 p-8 rounded-2xl shadow-[0_4px_16px_rgba(120,80,200,0.03)] hover:shadow-[0_12px_24px_rgba(120,80,200,0.06)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center mb-6">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-zinc-950 mb-2">Misconception Tracking</h4>
            <p className="text-zinc-600 text-sm leading-relaxed">
              We diagnose why a student is stuck rather than just checking if they are wrong. Misconceptions are saved automatically to the student profile.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 border border-zinc-200/50 p-8 rounded-2xl shadow-[0_4px_16px_rgba(120,80,200,0.03)] hover:shadow-[0_12px_24px_rgba(120,80,200,0.06)] hover:-translate-y-1 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center mb-6">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-zinc-950 mb-2">Adaptive Worksheets</h4>
            <p className="text-zinc-600 text-sm leading-relaxed">
              As student confidence rises, lesson paths automatically morph to provide challenge triggers, ensuring optimal learning engagement.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-12 px-6 md:px-12 border-t border-purple-100 bg-white/40 backdrop-blur-md relative z-10 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-zinc-800">ScaffoldAI</span>
          </div>
          <p className="text-zinc-500 text-xs">
            © {new Date().getFullYear()} ScaffoldAI Inc. Recreated with premium visual fidelity. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-zinc-500 font-medium">
            <Link href="/dashboard" className="hover:text-zinc-900">Dashboard</Link>
            <Link href="/settings" className="hover:text-zinc-900">Settings</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
