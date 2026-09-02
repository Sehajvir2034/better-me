import { ChevronRight, Clock3, MoonStar, Sunrise } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SleepLog, SleepSettings } from "@/db/schema";
import {
  formatMinutesAsSleep,
  getSleepDurationMinutes,
  getSleepScore,
  getSleepStatus,
} from "@/lib/sleep";

interface SleepHistoryCardProps {
  logs: SleepLog[];
  settings: SleepSettings | null;
}

type SleepStatus = "excellent" | "good" | "fair" | "poor";

function formatSleepDate(value: string) {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];

  if (value === todayKey) return "Today";
  if (value === yesterdayKey) return "Yesterday";

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatClock(value?: Date | null) {
  if (!value) return "--:--";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function getStatusMeta(status: SleepStatus) {
  switch (status) {
    case "excellent":
      return {
        label: "Excellent",
        chipClass:
          "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20",
        scoreClass: "text-emerald-300",
      };

    case "good":
      return {
        label: "Good",
        chipClass: "bg-teal-500/12 text-teal-300 ring-1 ring-teal-400/20",
        scoreClass: "text-teal-300",
      };

    case "fair":
      return {
        label: "Fair",
        chipClass: "bg-amber-500/12 text-amber-300 ring-1 ring-amber-400/20",
        scoreClass: "text-amber-300",
      };

    case "poor":
      return {
        label: "Poor",
        chipClass: "bg-rose-500/12 text-rose-300 ring-1 ring-rose-400/20",
        scoreClass: "text-rose-300",
      };
  }
}

function getSleepStart(log: SleepLog) {
  return log.fellAsleepTime ?? log.attemptedSleepTime ?? log.bedTime;
}

function getSleepEnd(log: SleepLog) {
  return log.wakeTime ?? log.outOfBedTime;
}

export function SleepHistoryCard({ logs, settings }: SleepHistoryCardProps) {
  const visibleLogs = logs.slice(0, 7);

  return (
    <Card className="overflow-hidden rounded-[2rem] border-0 bg-[#13151f] py-0 shadow-none">
      <div className="flex items-center justify-between gap-3 border-b border-white/6 px-5 py-4 md:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/32">
            Sleep History
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#FFFFE4]">
            Recent nights
          </h2>
        </div>

        <span className="rounded-full bg-white/6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/42">
          Last {visibleLogs.length || 0}
        </span>
      </div>

      <CardContent className="px-5 py-5 md:px-6">
        {visibleLogs.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/25">
              <MoonStar size={22} />
            </div>

            <p className="mt-4 text-sm font-semibold text-white/35">
              No sleep history yet.
            </p>

            <p className="mt-1 max-w-xs text-xs leading-relaxed text-white/22">
              Your logged nights will appear here with scores, durations, and
              recovery status.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleLogs.map((log) => {
              const score = getSleepScore(log, settings, logs.slice(0, 7));
              const status = getSleepStatus(log, settings);
              const meta = getStatusMeta(status);
              const duration = getSleepDurationMinutes(log);

              return (
                <button
                  key={log.id}
                  type="button"
                  className="group flex w-full items-center gap-3 rounded-[1.35rem] border border-white/6 bg-white/[0.025] p-3 text-left transition hover:border-white/10 hover:bg-white/[0.045]"
                >
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-white/[0.05]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/32">
                      {formatSleepDate(log.sleepDate).slice(0, 3)}
                    </span>

                    <span className="mt-0.5 text-sm font-black leading-none tracking-[-0.04em] text-[#FFFFE4]">
                      {new Date(`${log.sleepDate}T12:00:00`).getDate()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-[#FFFFE4]">
                        {formatSleepDate(log.sleepDate)}
                      </p>

                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.13em]",
                          meta.chipClass,
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-1 flex min-w-0 items-center gap-2 text-xs font-medium text-white/40">
                      <span className="flex min-w-0 items-center gap-1 truncate">
                        <Clock3 size={12} className="shrink-0" />
                        {formatClock(getSleepStart(log))}
                      </span>

                      <span className="text-white/18">→</span>

                      <span className="flex min-w-0 items-center gap-1 truncate">
                        <Sunrise size={12} className="shrink-0" />
                        {formatClock(getSleepEnd(log))}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-lg font-black leading-none tracking-[-0.04em] text-[#FFFFE4]">
                      {formatMinutesAsSleep(duration)}
                    </p>

                    <p
                      className={cn(
                        "mt-1 text-[11px] font-bold uppercase tracking-[0.14em]",
                        meta.scoreClass,
                      )}
                    >
                      {score} score
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className="shrink-0 text-white/18 transition group-hover:translate-x-0.5 group-hover:text-white/45"
                  />
                </button>
              );
            })}
          </div>
        )}

        {logs.length > visibleLogs.length ? (
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/7 bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white/42 transition hover:bg-white/[0.06] hover:text-white/70"
          >
            View full sleep history
            <ChevronRight size={14} />
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}
