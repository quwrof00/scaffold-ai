import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Download, FilePlus2, UserRoundSearch } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Class Overview" };

const summary = [
  { label: "Students", value: "32", note: "Grade 9 · CBSE" },
  { label: "Average Confidence", value: "74%", note: "up 6% this month" },
  { label: "Active Streaks", value: "26", note: "learning this week" },
  { label: "Concepts Mastered This Week", value: "18", note: "across 5 topics" },
];

const confidence = [62, 64, 63, 66, 68, 70, 69, 72, 73, 74];
const mastery = [56, 57, 59, 60, 61, 64, 65, 67, 68, 70];

const misconceptions = [
  { topic: "Factorisation", frequency: "18 students", trend: "+12%" },
  { topic: "Unit Conversion", frequency: "14 students", trend: "+6%" },
  { topic: "Sign Errors", frequency: "12 students", trend: "-3%" },
  { topic: "Geometry Proofs", frequency: "10 students", trend: "+4%" },
  { topic: "Fractions", frequency: "9 students", trend: "-8%" },
];

const students = [
  { name: "Aarav Sharma", confidence: "42%", mastery: "48%", struggle: "Factorisation", risk: "High" },
  { name: "Priya Patel", confidence: "55%", mastery: "61%", struggle: "Geometry", risk: "Medium" },
  { name: "Kabir Mehta", confidence: "58%", mastery: "63%", struggle: "Unit Conversion", risk: "Medium" },
  { name: "Anaya Rao", confidence: "49%", mastery: "57%", struggle: "Sign Errors", risk: "High" },
];

const assignments = [
  { name: "Algebra Basics", completion: "91%", score: "78%", confidence: "+8%" },
  { name: "Linear Equations", completion: "84%", score: "74%", confidence: "+6%" },
  { name: "Fractions Review", completion: "76%", score: "69%", confidence: "+4%" },
];

const predictions = [
  {
    text: "Students struggling with Factorisation are likely to struggle with Quadratic Equations.",
    score: "72%",
  },
  {
    text: "Students struggling with Fractions are likely to struggle with Algebraic Manipulation.",
    score: "64%",
  },
];

const actions = [
  { label: "Create Assignment", icon: FilePlus2 },
  { label: "View Student Profile", icon: UserRoundSearch },
  { label: "Download Weekly Report", icon: Download },
];

export default function Page() {
  return (
    <AppShell headerTitle="Teacher" headerSubtitle="Class Overview">
      <div className="mx-auto w-full max-w-6xl px-1 py-8 sm:px-3 md:py-12">
        <header className="mb-10 max-w-3xl space-y-3 md:mb-12">
          <h1 className="font-[var(--font-serif-editorial)] text-5xl font-semibold leading-[0.96] tracking-normal text-[hsl(var(--foreground))] sm:text-6xl">
            Class Overview
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">
            Track learning progress, identify misconceptions, and support students before they fall behind.
          </p>
        </header>

        <div className="grid gap-5">
          <section aria-labelledby="summary-title" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <h2 id="summary-title" className="sr-only">
              Class Summary
            </h2>
            {summary.map((item) => (
              <SoftCard key={item.label}>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{item.label}</p>
                <p className="mt-4 text-4xl font-semibold tracking-normal text-[hsl(var(--foreground))]">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.note}</p>
              </SoftCard>
            ))}
          </section>

          <div className="grid gap-5 lg:grid-cols-[1.28fr_0.72fr]">
            <SoftCard title="Class Performance Trends">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Legend label="Average Confidence" />
                  <Legend label="Average Mastery" muted />
                </div>
                <LineChart confidence={confidence} mastery={mastery} />
              </div>
            </SoftCard>

            <SoftCard title="Common Misconceptions">
              <div className="space-y-3">
                {misconceptions.map((item) => (
                  <div
                    key={item.topic}
                    className="rounded-[18px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.52)] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{item.topic}</p>
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{item.frequency}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-semibold",
                          item.trend.startsWith("-")
                            ? "border-[hsl(var(--success)/0.18)] text-[hsl(var(--success))]"
                            : "border-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]"
                        )}
                      >
                        {item.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SoftCard>
          </div>

          <SoftCard title="Students Requiring Attention">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">
                    <th className="border-b border-[hsl(var(--border-subtle))] pb-3">Name</th>
                    <th className="border-b border-[hsl(var(--border-subtle))] pb-3">Confidence</th>
                    <th className="border-b border-[hsl(var(--border-subtle))] pb-3">Mastery</th>
                    <th className="border-b border-[hsl(var(--border-subtle))] pb-3">Primary Struggle</th>
                    <th className="border-b border-[hsl(var(--border-subtle))] pb-3">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.name} className="text-sm">
                      <td className="border-b border-[hsl(var(--border-subtle))] py-4 font-semibold text-[hsl(var(--foreground))]">
                        {student.name}
                      </td>
                      <td className="border-b border-[hsl(var(--border-subtle))] py-4 text-[hsl(var(--muted-foreground))]">
                        {student.confidence}
                      </td>
                      <td className="border-b border-[hsl(var(--border-subtle))] py-4 text-[hsl(var(--muted-foreground))]">
                        {student.mastery}
                      </td>
                      <td className="border-b border-[hsl(var(--border-subtle))] py-4 text-[hsl(var(--foreground))]">
                        {student.struggle}
                      </td>
                      <td className="border-b border-[hsl(var(--border-subtle))] py-4">
                        <RiskBadge level={student.risk} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SoftCard>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <SoftCard title="Assignment Performance">
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.name}
                    className="rounded-[20px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.5)] p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{assignment.name}</p>
                      <div className="grid grid-cols-3 gap-4 text-right text-sm">
                        <Metric label="Complete" value={assignment.completion} />
                        <Metric label="Score" value={assignment.score} />
                        <Metric label="Confidence" value={assignment.confidence} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SoftCard>

            <SoftCard title="Learning Risk Predictions">
              <div className="space-y-4">
                {predictions.map((prediction) => (
                  <div
                    key={prediction.text}
                    className="rounded-[20px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.5)] p-5"
                  >
                    <p className="text-sm leading-6 text-[hsl(var(--foreground))]">{prediction.text}</p>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                        Risk Score
                      </span>
                      <span className="text-2xl font-semibold text-[hsl(var(--foreground))]">
                        {prediction.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SoftCard>
          </div>

          <SoftCard title="Quick Actions">
            <div className="grid gap-3 sm:grid-cols-3">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className="flex min-h-14 items-center justify-center gap-2 rounded-[16px] border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.58)] px-4 text-sm font-semibold text-[hsl(var(--foreground))] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:bg-[hsl(var(--surface-2)/0.75)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--primary)/0.14)]"
                    type="button"
                  >
                    <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </SoftCard>
        </div>
      </div>
    </AppShell>
  );
}

function SoftCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-[24px] border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface)/0.78)] shadow-[0_12px_38px_rgba(120,80,160,0.07)]",
        className
      )}
    >
      {title && (
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-[15px] font-semibold tracking-normal">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("p-6", title && "pt-5")}>{children}</CardContent>
    </Card>
  );
}

function Legend({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          muted ? "bg-[hsl(var(--muted-foreground)/0.42)]" : "bg-[hsl(var(--primary))]"
        )}
      />
      {label}
    </div>
  );
}

function LineChart({
  confidence,
  mastery,
}: {
  confidence: number[];
  mastery: number[];
}) {
  const points = (values: number[]) =>
    values
      .map((value, index) => {
        const x = 16 + index * 31;
        const y = 122 - value;
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div className="rounded-[22px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.46)] p-5">
      <svg
        role="img"
        aria-label="Average confidence and average mastery trend over the last 30 days"
        viewBox="0 0 310 140"
        className="h-56 w-full overflow-visible"
      >
        {[36, 68, 100].map((y) => (
          <line
            key={y}
            x1="16"
            x2="295"
            y1={y}
            y2={y}
            stroke="hsl(var(--border-subtle))"
            strokeWidth="1"
          />
        ))}
        <polyline
          points={points(mastery)}
          fill="none"
          stroke="hsl(var(--muted-foreground) / 0.46)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={points(confidence)}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        level === "High"
          ? "border-[hsl(var(--danger)/0.18)] text-[hsl(var(--danger))]"
          : "border-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))]"
      )}
    >
      {level}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="mt-1 text-base font-semibold text-[hsl(var(--foreground))]">{value}</p>
    </div>
  );
}
