"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus, User, Mail, Lock, GraduationCap, BookOpen, Users, ArrowLeft } from "lucide-react";
import { apiRegister } from "@/lib/api";

const ROLES = [
  { value: "STUDENT", label: "Student", Icon: GraduationCap },
  { value: "TEACHER", label: "Teacher", Icon: BookOpen },
  { value: "PARENT",  label: "Parent",  Icon: Users },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRegister({ name, email, password, role });
      // Auto sign-in after register
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Registered but failed to sign in automatically. Please log in.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-gradient-to-br from-[#e8d5f5] via-[#d5dcf7] to-[#d8efd5] dark:from-[#15121e] dark:via-[#1a1726] dark:to-[#12161a]">
      
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-7">
          <h1
            className="text-[22px] tracking-tight text-[#2d1f5e] dark:text-zinc-100"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}
          >
            <em>Scaffold</em>AI
          </h1>
          <p className="text-xs mt-1 text-[#7a6fa0] dark:text-zinc-400">
            Create your account
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-4 bg-white/65 dark:bg-zinc-900/65 backdrop-blur-md border border-white/85 dark:border-zinc-700/50 shadow-[0_8px_40px_rgba(100,80,160,0.1)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
        >
          {/* Error */}
          {error && (
            <div className="text-xs px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#6b5fa0] dark:text-zinc-400">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9b8fc8] dark:text-zinc-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all bg-white/70 dark:bg-zinc-950/70 border border-[#9682c8]/30 dark:border-zinc-700/50 text-[#2d1f5e] dark:text-zinc-200 focus:border-[#8264c8]/60 focus:ring-[3px] focus:ring-[#8264c8]/10 dark:focus:border-purple-500/50 dark:focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#6b5fa0] dark:text-zinc-400">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9b8fc8] dark:text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all bg-white/70 dark:bg-zinc-950/70 border border-[#9682c8]/30 dark:border-zinc-700/50 text-[#2d1f5e] dark:text-zinc-200 focus:border-[#8264c8]/60 focus:ring-[3px] focus:ring-[#8264c8]/10 dark:focus:border-purple-500/50 dark:focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#6b5fa0] dark:text-zinc-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9b8fc8] dark:text-zinc-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all bg-white/70 dark:bg-zinc-950/70 border border-[#9682c8]/30 dark:border-zinc-700/50 text-[#2d1f5e] dark:text-zinc-200 focus:border-[#8264c8]/60 focus:ring-[3px] focus:ring-[#8264c8]/10 dark:focus:border-purple-500/50 dark:focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Divider */}
          <hr className="border-t border-[#9682c8]/20 dark:border-zinc-700/50" />

          {/* Role selector */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#6b5fa0] dark:text-zinc-400">
              I am a…
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(({ value, label, Icon }) => {
                const active = role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all text-xs font-semibold ${
                      active 
                        ? 'bg-[#beaaf0]/25 dark:bg-purple-900/30 border border-[#6e50be]/55 dark:border-purple-500/50 text-[#4a2fa0] dark:text-purple-300' 
                        : 'bg-white/50 dark:bg-zinc-950/50 border border-[#9682c8]/30 dark:border-zinc-700/50 text-[#7a6fa0] dark:text-zinc-500'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${active ? 'text-[#6040c0] dark:text-purple-400' : 'text-[#9b8fc8] dark:text-zinc-600'}`}
                    />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 bg-gradient-to-br from-[#7b5ccc] to-[#a06abf] dark:from-purple-600 dark:to-purple-500"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center text-xs pt-1 text-[#8a7fac] dark:text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold transition text-[#7050c0] dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}