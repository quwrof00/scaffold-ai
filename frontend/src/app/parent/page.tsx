import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowUpRight, CalendarDays, CheckCircle2, HeartPulse } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Parent Dashboard" };

const overview = [
  { label: "Current Streak", value: "12 days", note: "Steady learning rhythm" },
  { label: "Weekly Improvement", value: "+18%", note: "More accurate attempts" },
  { label: "Overall Confidence", value: "76%", note: "Comfortable with most topics" },
];

const report = [
  { label: "Topics Practiced", value: "14" },
  { label: "Sessions Completed", value: "6" },
  { label: "Confidence Change", value: "+9%" },
  { label: "Mastery Change", value: "+7%" },
];

const trend = [58, 62, 61, 67, 70, 73, 76];
const trendPoints = trend
  .map((value, index) => {
    const x = 12 + index * 46;
    const y = 116 - value;
    return `${x},${y}`;
  })
  .join(" ");

export default function Page() {
  return (
    <AppShell headerTitle="Parent" headerSubtitle="Aarav Sharma">
      <div className="mx-auto w-full max-w-6xl px-1 py-8 sm:px-3 md:py-12">
        <header className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
              Parent Dashboard
            </p>
            <h1 className="font-[var(--font-serif-editorial)] text-5xl font-semibold leading-[0.96] tracking-normal text-[hsl(var(--foreground))] sm:text-6xl">
              Aarav Sharma
            </h1>
            <p className="max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">
              A calm weekly view of Aarav&apos;s progress, confidence, and the topics that need gentle attention.
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface)/0.78)] px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] shadow-[0_10px_30px_rgba(120,80,160,0.06)]">
            <CalendarDays className="h-4 w-4" />
            Grade 9 · CBSE
          </div>
        </header>

        <div className="grid gap-5">
          <section aria-labelledby="overview-title" className="grid gap-5 lg:grid-cols-3">
            <h2 id="overview-title" className="sr-only">
              Overview
            </h2>
            {overview.map((item) => (
              <SoftCard key={item.label}>
                <div className="space-y-4">
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{item.label}</p>
                  <div className="space-y-2">
                    <p className="text-4xl font-semibold tracking-normal text-[hsl(var(--foreground))]">
                      {item.value}
                    </p>
                    <p className="text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.note}</p>
                  </div>
                </div>
              </SoftCard>
            ))}
          </section>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
            <SoftCard title="Learning Summary">
              <div className="grid gap-6 sm:grid-cols-2">
                <AreaList
                  title="Strong Areas"
                  items={["Algebra", "Physics"]}
                  tone="strong"
                />
                <AreaList
                  title="Needs Attention"
                  items={["Geometry", "Factorisation"]}
                  tone="attention"
                />
              </div>
            </SoftCard>

            <SoftCard title="Weekly Learning Report">
              <div className="grid gap-3 sm:grid-cols-2">
                {report.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[18px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.55)] p-4"
                  >
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[hsl(var(--foreground))]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </SoftCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <SoftCard title="Learning Trends">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold text-[hsl(var(--foreground))]">76%</p>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      Overall confidence this week
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.58)] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--success))]">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    improving
                  </span>
                </div>

                <div className="rounded-[20px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.46)] p-4">
                  <svg
                    role="img"
                    aria-label="Simple weekly confidence trend rising from 58 percent to 76 percent"
                    viewBox="0 0 300 132"
                    className="h-36 w-full overflow-visible"
                  >
                    {[32, 66, 100].map((y) => (
                      <line
                        key={y}
                        x1="12"
                        x2="288"
                        y1={y}
                        y2={y}
                        stroke="hsl(var(--border-subtle))"
                        strokeWidth="1"
                      />
                    ))}
                    <polyline
                      points={trendPoints}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {trend.map((value, index) => (
                      <circle
                        key={`${value}-${index}`}
                        cx={12 + index * 46}
                        cy={116 - value}
                        r="4"
                        fill="hsl(var(--surface))"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                </div>
              </div>
            </SoftCard>

            <SoftCard title="Recurring Difficulties">
              <div className="space-y-3">
                {["Factorisation", "Unit Conversion", "Sign Errors"].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-4 rounded-[16px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.5)] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">{item}</span>
                    <span className="h-2 w-2 rounded-full bg-[hsl(var(--warning))]" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </SoftCard>
          </div>

          <SoftCard title="Growth Forecast">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Current Algebra Mastery
                </p>
                <p className="text-5xl font-semibold tracking-normal text-[hsl(var(--foreground))]">
                  74%
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-3 overflow-hidden rounded-full bg-[hsl(var(--surface-3)/0.7)]">
                  <div className="h-full w-[74%] rounded-full bg-[hsl(var(--primary))]" />
                </div>
                <div className="flex flex-col gap-3 rounded-[20px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.5)] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Projected</p>
                    <p className="mt-1 text-2xl font-semibold text-[hsl(var(--foreground))]">
                      90% in 3 weeks
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--success))]">
                    <HeartPulse className="h-4 w-4" />
                    On track
                  </div>
                </div>
              </div>
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

function AreaList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "strong" | "attention";
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-[16px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--background)/0.5)] px-4 py-3"
          >
            <CheckCircle2
              className={cn(
                "h-4 w-4",
                tone === "strong"
                  ? "text-[hsl(var(--success))]"
                  : "text-[hsl(var(--warning))]"
              )}
            />
            <span className="text-sm font-medium text-[hsl(var(--foreground))]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
