"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn, Mail, Lock } from "lucide-react";

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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #e8d5f5 0%, #d5dcf7 35%, #c8e8f0 70%, #d8efd5 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-7">
          <h1
            className="text-[22px] tracking-tight"
            style={{ color: "#2d1f5e", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}
          >
            <em>Scaffold</em>AI
          </h1>
          <p className="text-xs mt-1" style={{ color: "#7a6fa0" }}>
            Sign in to continue learning
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 space-y-4"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "0.5px solid rgba(255,255,255,0.85)",
            boxShadow: "0 8px 40px rgba(100,80,160,0.1)",
          }}
        >
          {/* Error */}
          {error && (
            <div
              className="text-xs px-3 py-2 rounded-lg"
              style={{
                background: "rgba(220,50,50,0.08)",
                border: "0.5px solid rgba(200,50,50,0.25)",
                color: "#a03030",
              }}
            >
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label
              className="block text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "#6b5fa0" }}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#9b8fc8" }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "0.5px solid rgba(150,130,200,0.3)",
                  color: "#2d1f5e",
                }}
                onFocus={(e) => {
                  e.target.style.border = "0.5px solid rgba(130,100,200,0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(130,100,200,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "0.5px solid rgba(150,130,200,0.3)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              className="block text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "#6b5fa0" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#9b8fc8" }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "0.5px solid rgba(150,130,200,0.3)",
                  color: "#2d1f5e",
                }}
                onFocus={(e) => {
                  e.target.style.border = "0.5px solid rgba(130,100,200,0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(130,100,200,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "0.5px solid rgba(150,130,200,0.3)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #7b5ccc 0%, #a06abf 100%)",
              }}
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              style={{
                background: "rgba(123, 92, 204, 0.1)",
                color: "#7b5ccc",
                border: "1px solid rgba(123, 92, 204, 0.2)",
              }}
            >
              Test Demo Login
            </button>
          </div>

          <p className="text-center text-xs pt-1" style={{ color: "#8a7fac" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold transition"
              style={{ color: "#7050c0" }}
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}