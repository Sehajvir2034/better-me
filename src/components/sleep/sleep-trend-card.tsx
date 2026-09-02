import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SleepLog } from "@/db/schema";
import type { SleepOverview } from "@/lib/sleep";
import { formatMinutesAsSleep, getSleepDurationMinutes } from "@/lib/sleep";

interface SleepTrendCardProps {
  logs: SleepLog[];
  overview: SleepOverview;
}

function getDayLabel(dateString?: string | null, index = 0) {
  if (!dateString) return `D${index + 1}`;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return `D${index + 1}`;

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
  }).format(date);
}

function getTrendData(logs: SleepLog[]) {
  const last7 = logs.slice(0, 7).reverse();

  return last7.map((log, index, arr) => {
    const minutes = getSleepDurationMinutes(log);
    const isToday = index === arr.length - 1;

    return {
      id: log.id,
      label: getDayLabel(log.sleepDate, index),
      minutes,
      value: formatMinutesAsSleep(minutes),
      isToday,
    };
  });
}

export function SleepTrendCard({ logs, overview }: SleepTrendCardProps) {
  const trend = getTrendData(logs);
  const maxMinutes = Math.max(...trend.map((d) => d.minutes), 1);
  const latest = trend[trend.length - 1]?.minutes ?? 0;
  const avg7d = overview.avg7dSleepMinutes ?? 0;
  const delta = latest - avg7d;

  return (
    <Card className="overflow-hidden rounded-[2rem] border-0 bg-[#13151f] py-0 shadow-none">
      <div className="border-b border-white/6 px-5 py-4 md:px-6">
        <div
          className={cn(
            "flex gap-3",
            delta !== 0
              ? "flex-col sm:flex-row sm:items-center sm:justify-between"
              : "items-center justify-between",
          )}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/32">
              Sleep Trend
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#FFFFE4]">
              7-day duration trend
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
              Avg {formatMinutesAsSleep(avg7d)}
            </span>

            {delta !== 0 && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                  delta > 0
                    ? "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20"
                    : "bg-rose-500/12 text-rose-300 ring-1 ring-rose-400/20",
                )}
              >
                {delta > 0 ? "+" : ""}
                {formatMinutesAsSleep(Math.abs(delta))} vs avg
              </span>
            )}
          </div>
        </div>
      </div>

      <CardContent className="px-5 py-5 md:px-6">
        {trend.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <p className="text-base font-semibold text-white/28">
              No sleep trend data yet.
            </p>
            <p className="mt-1 text-sm text-white/18">
              Log a few nights to unlock your weekly pattern.
            </p>
          </div>
        ) : (
          <>
            <div className="flex min-h-[190px] items-end justify-between gap-3">
              {trend.map((day) => {
                const height =
                  day.minutes <= 0
                    ? 6
                    : Math.max(
                        Math.round((day.minutes / maxMinutes) * 124),
                        18,
                      );

                return (
                  <div
                    key={day.id}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <div className="text-[10px] font-bold tracking-wide text-white/28">
                      {day.value}
                    </div>

                    <div className="flex h-34 w-full items-end justify-center">
                      <div
                        className={cn(
                          "w-3 rounded-full transition-all duration-700 ease-out",
                          day.isToday
                            ? "bg-linear-to-b from-violet-400 to-emerald-400"
                            : "bg-violet-500/45",
                        )}
                        style={{ height }}
                      />
                    </div>

                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-[0.16em]",
                        day.isToday ? "text-violet-300" : "text-white/28",
                      )}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <TrendMiniStat
                label="Last night"
                value={formatMinutesAsSleep(latest)}
                sub="Most recent sleep duration"
              />
              <TrendMiniStat
                label="7-day average"
                value={formatMinutesAsSleep(overview.avg7dSleepMinutes)}
                sub="Short-term baseline"
              />
              <TrendMiniStat
                label="30-day average"
                value={formatMinutesAsSleep(overview.avg30dSleepMinutes)}
                sub="Longer-term trend"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TrendMiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/7 bg-white/[0.035] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black leading-none tracking-[-0.04em] text-[#FFFFE4]">
        {value}
      </p>
      <p className="mt-2 text-xs font-medium text-white/40">{sub}</p>
    </div>
  );
}
