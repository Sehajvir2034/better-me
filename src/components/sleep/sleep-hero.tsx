import {
  MoonStar,
  BedDouble,
  Gauge,
  AlarmClock,
  Plus,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatMinutesAsSleep } from "@/lib/sleep";
import type { SleepLog, SleepSettings } from "@/db/schema";
import { LogSleepDialog } from "@/components/sleep/log-sleep-dialog";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

type SleepOverview = ReturnType<typeof import("@/lib/sleep").getSleepOverview>;

interface SleepHeroProps {
  userName: string;
  overview: SleepOverview;
  latestLog: SleepLog | null;
  settings: SleepSettings | null;
  defaultSleepDate: string;
  maxSleepDate: string;
}

function formatClock(value?: Date | null) {
  if (!value) return "--:--";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(value);
}

function formatTargetTime(value?: string | null) {
  if (!value) return "--:--";

  const [hours, minutes] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return "--:--";
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function getStatusMeta(status: SleepOverview["status"]) {
  switch (status) {
    case "excellent":
      return {
        label: "Excellent recovery",
        chipClass:
          "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20",
      };
    case "good":
      return {
        label: "Good recovery",
        chipClass: "bg-teal-500/12 text-teal-300 ring-1 ring-teal-400/20",
      };
    case "fair":
      return {
        label: "Fair recovery",
        chipClass: "bg-amber-500/12 text-amber-300 ring-1 ring-amber-400/20",
      };
    case "poor":
      return {
        label: "Needs recovery",
        chipClass: "bg-rose-500/12 text-rose-300 ring-1 ring-rose-400/20",
      };
    default:
      return {
        label: "No sleep data yet",
        chipClass: "bg-white/10 text-white/60 ring-1 ring-white/10",
      };
  }
}

function getHeroCopy(overview: SleepOverview) {
  if (!overview.hasData) {
    return "Start logging your nights to see recovery, debt, consistency, and sleep trends here.";
  }

  if (overview.score >= 85) {
    return "You slept well and your recovery looks strong. Keep tonight steady to maintain the rhythm.";
  }

  if (overview.score >= 70) {
    return "You had a decent night with room to improve. A slightly earlier wind-down could push your score higher.";
  }

  if (overview.score >= 55) {
    return "Recovery was mixed last night. Focus on reducing bedtime drift and clearing some sleep debt tonight.";
  }

  return "Last night did not give you enough recovery. Prioritize an earlier bedtime and protect your sleep window tonight.";
}

export function SleepHero({
  userName,
  overview,
  latestLog,
  settings,
  maxSleepDate,
  defaultSleepDate,
}: SleepHeroProps) {
  const status = getStatusMeta(overview.status);
  const score = Math.max(0, Math.min(100, Math.round(overview.score)));

  const sleepStart =
    latestLog?.fellAsleepTime ??
    latestLog?.attemptedSleepTime ??
    latestLog?.bedTime;
  const wakeTime = latestLog?.wakeTime ?? latestLog?.outOfBedTime ?? null;

  return (
    <Card className="relative overflow-hidden rounded-[2rem] border-0 bg-[#13151f] py-0 shadow-none font-satoshi">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-indigo-600/8 to-transparent" />

      <CardContent className="relative px-5 py-5 md:px-6 md:py-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-widest text-white/40">
                Sleep / Morning review
              </span>

              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                  status.chipClass,
                )}
              >
                {status.label}
              </span>
            </div>

            <div className="max-w-2xl">
              <p className="text-2xl lg:text-5xl font-semibold leading-none tracking-wide text-[#FFFFE4] md:text-5xl">
                Good morning, {userName}
              </p>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 md:text-base font-semibold">
                {getHeroCopy(overview)}
              </p>
            </div>

            <div className="mt-5 xl:mt-30 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={BedDouble}
                label="Duration"
                value={formatMinutesAsSleep(overview.sleepDurationMinutes)}
                sub={
                  overview.hasData
                    ? `${formatClock(sleepStart)} → ${formatClock(wakeTime)}`
                    : "No sleep logged"
                }
              />

              <MetricCard
                icon={Gauge}
                label="Efficiency"
                value={`${overview.sleepEfficiency}%`}
                sub={`${overview.avg7dEfficiency}% avg over 7 days`}
              />

              <MetricCard
                icon={TimerReset}
                label="Sleep Debt"
                value={formatMinutesAsSleep(overview.sleepDebtMinutes)}
                sub={`${formatMinutesAsSleep(overview.rollingSleepDebtMinutes)} rolling 7-day debt`}
              />

              <MetricCard
                icon={AlarmClock}
                label="Target"
                value={formatTargetTime(settings?.targetBedtime)}
                sub={`Wake ${formatTargetTime(settings?.targetWakeTime)}`}
              />
            </div>
          </div>

          <div className="flex h-full flex-col justify-between rounded-[1.75rem]  bg-white/4 p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
                  Sleep score
                </p>
                <p className="mt-1 text-sm font-semibold text-white/45">
                  Duration, quality, efficiency, and consistency
                </p>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-indigo-300 rounded-lg bg-white/6 w-40 text-center">
                  Consistency {overview.consistencyScore}
                </p>
              </div>

              {/* <div className="rounded-full bg-white/6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-300">
                Consistency {overview.consistencyScore}
              </div> */}
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="relative">
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute h-0 w-0"
                >
                  <defs>
                    <linearGradient
                      id="sleep-score-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="55%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                </svg>

                <AnimatedCircularProgressBar
                  min={0}
                  max={100}
                  value={score}
                  showValue={false}
                  gaugePrimaryColor="url(#sleep-score-gradient)"
                  gaugeSecondaryColor="rgba(255,255,255,0.08)"
                  className="size-40"
                />

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold leading-none tracking-[-0.05em] text-[#FFFFE4]">
                    {score}
                  </span>

                  <span className="mt-1 text-xs font-bold uppercase tracking-widest text-white/45">
                    Score
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <LogSleepDialog
                log={latestLog}
                defaultSleepDate={defaultSleepDate}
                maxSleepDate={maxSleepDate}
                trigger={
                  <Button
                    type="button"
                    className="h-11 rounded-2xl border bg-violet-500/12 text-[#FFFFE4] font-semibold tracking-wide hover:bg-violet-500/18 cursor-pointer"
                  >
                    <MoonStar className="size-4" />
                    Log sleep
                  </Button>
                }
              />

              <Button
                type="button"
                className="h-11 rounded-2xl font-semibold tracking-wide bg-white/4 text-white/72 hover:bg-white/[0.07] hover:text-[#FFFFE4] cursor-pointer"
              >
                <Plus className="size-4" />
                Log nap
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white/[0.035] p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/45">
          {label}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-indigo-300">
          <Icon size={16} />
        </div>
      </div>

      <div className="text-2xl font-bold leading-none tracking-widest text-[#FFFFE4]">
        {value}
      </div>

      <p className="mt-2 text-sm font-semibold tracking-wide text-white/42">
        {sub}
      </p>
    </div>
  );
}
