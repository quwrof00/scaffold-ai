"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn, Mail, Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleDemoLogin(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let demoEmail = localStorage.getItem("test_demo_email");
    if (!demoEmail) {
      demoEmail = `test_${Math.random().toString(36).substring(2, 9)}@scaffold.ai`;
      localStorage.setItem("test_demo_email", demoEmail);
    }

    const result = await signIn("credentials", {
      email: demoEmail,
      password: "demo",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Failed to login with demo account.");
    } else {
      router.push("/dashboard");
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
            Sign in to continue learning
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all bg-white/70 dark:bg-zinc-950/70 border border-[#9682c8]/30 dark:border-zinc-700/50 text-[#2d1f5e] dark:text-zinc-200 focus:border-[#8264c8]/60 focus:ring-[3px] focus:ring-[#8264c8]/10 dark:focus:border-purple-500/50 dark:focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 bg-gradient-to-br from-[#7b5ccc] to-[#a06abf] dark:from-purple-600 dark:to-purple-500"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 bg-[#7b5ccc]/10 dark:bg-purple-900/20 text-[#7b5ccc] dark:text-purple-400 border border-[#7b5ccc]/20 dark:border-purple-500/30"
            >
              Test Demo Login
            </button>
          </div>

          <p className="text-center text-xs pt-1 text-[#8a7fac] dark:text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold transition text-[#7050c0] dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}