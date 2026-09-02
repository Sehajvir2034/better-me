import {
  Activity,
  AlarmClock,
  BatteryCharging,
  MoonStar,
  TimerReset,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SleepNap } from "@/db/schema";
import type { SleepOverview } from "@/lib/sleep";
import { formatMinutesAsSleep } from "@/lib/sleep";

interface SleepStatsCardProps {
  overview: SleepOverview;
  naps: SleepNap[];
}

function getConsistencyMeta(score: number) {
  if (score >= 85) {
    return {
      label: "Strong",
      className: "text-emerald-300",
      barClass: "bg-emerald-400",
      chipClass:
        "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20",
    };
  }

  if (score >= 70) {
    return {
      label: "Stable",
      className: "text-teal-300",
      barClass: "bg-teal-400",
      chipClass: "bg-teal-500/12 text-teal-300 ring-1 ring-teal-400/20",
    };
  }

  if (score >= 55) {
    return {
      label: "Uneven",
      className: "text-amber-300",
      barClass: "bg-amber-400",
      chipClass: "bg-amber-500/12 text-amber-300 ring-1 ring-amber-400/20",
    };
  }

  return {
    label: "Drifting",
    className: "text-rose-300",
    barClass: "bg-rose-400",
    chipClass: "bg-rose-500/12 text-rose-300 ring-1 ring-rose-400/20",
  };
}

function getDebtMeta(minutes: number) {
  if (minutes <= 30) {
    return {
      label: "Recovered",
      className: "text-emerald-300",
      chipClass:
        "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20",
    };
  }

  if (minutes <= 120) {
    return {
      label: "Building",
      className: "text-amber-300",
      chipClass: "bg-amber-500/12 text-amber-300 ring-1 ring-amber-400/20",
    };
  }

  return {
    label: "High",
    className: "text-rose-300",
    chipClass: "bg-rose-500/12 text-rose-300 ring-1 ring-rose-400/20",
  };
}

function getAverageDelta(shortTermMinutes: number, longTermMinutes: number) {
  const difference = shortTermMinutes - longTermMinutes;

  if (difference === 0) {
    return {
      label: "Holding steady",
      className: "text-white/40",
    };
  }

  if (difference > 0) {
    return {
      label: `+${formatMinutesAsSleep(difference)} vs 30d`,
      className: "text-emerald-300",
    };
  }

  return {
    label: `-${formatMinutesAsSleep(Math.abs(difference))} vs 30d`,
    className: "text-rose-300",
  };
}

export function SleepStatsCard({ overview, naps }: SleepStatsCardProps) {
  const consistency = getConsistencyMeta(overview.consistencyScore);
  const debt = getDebtMeta(overview.rollingSleepDebtMinutes);
  const durationDelta = getAverageDelta(
    overview.avg7dSleepMinutes,
    overview.avg30dSleepMinutes,
  );

  const napCount = naps.length;
  const napSummary =
    napCount === 0
      ? "No naps logged"
      : napCount === 1
        ? "1 nap in the last 30 days"
        : `${napCount} naps in the last 30 days`;

  return (
    <Card className="overflow-hidden rounded-[2rem] border-0 bg-[#13151f] py-0 shadow-none">
      <div className="border-b border-white/6 px-5 py-4 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/32">
              Recovery Metrics
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#FFFFE4]">
              Debt and consistency
            </h2>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-violet-300">
            <Activity size={17} />
          </div>
        </div>
      </div>

      <CardContent className="space-y-3 px-5 py-5 md:px-6">
        <div className="rounded-[1.45rem] border border-white/7 bg-white/[0.035] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                Schedule consistency
              </p>

              <div className="mt-3 flex items-end gap-2">
                <p className="text-3xl font-black leading-none tracking-[-0.05em] text-[#FFFFE4]">
                  {overview.consistencyScore}
                </p>

                <span
                  className={cn(
                    "mb-0.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
                    consistency.chipClass,
                  )}
                >
                  {consistency.label}
                </span>
              </div>

              <p className="mt-2 text-xs font-medium text-white/42">
                Based on bedtime and wake-time variation.
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-violet-300">
              <MoonStar size={16} />
            </div>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                consistency.barClass,
              )}
              style={{
                width: `${Math.max(
                  4,
                  Math.min(100, overview.consistencyScore),
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatTile
            icon={TimerReset}
            label="Rolling debt"
            value={formatMinutesAsSleep(overview.rollingSleepDebtMinutes)}
            sub="Accumulated over 7 days"
            valueClass={debt.className}
            chip={
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em]",
                  debt.chipClass,
                )}
              >
                {debt.label}
              </span>
            }
          />

          <StatTile
            icon={BatteryCharging}
            label="7-day efficiency"
            value={`${overview.avg7dEfficiency}%`}
            sub="Average time asleep in bed"
            valueClass={
              overview.avg7dEfficiency >= 85
                ? "text-emerald-300"
                : overview.avg7dEfficiency >= 75
                  ? "text-amber-300"
                  : "text-rose-300"
            }
          />

          <StatTile
            icon={MoonStar}
            label="7-day average"
            value={formatMinutesAsSleep(overview.avg7dSleepMinutes)}
            sub={durationDelta.label}
            subClass={durationDelta.className}
          />

          <StatTile
            icon={AlarmClock}
            label="Nap average"
            value={
              overview.avgNapMinutes > 0
                ? formatMinutesAsSleep(overview.avgNapMinutes)
                : "--"
            }
            sub={napSummary}
            valueClass={
              overview.avgNapMinutes > 90 ? "text-amber-300" : "text-[#FFFFE4]"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  valueClass = "text-[#FFFFE4]",
  subClass = "text-white/42",
  chip,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
  subClass?: string;
  chip?: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/7 bg-white/[0.035] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
            {label}
          </p>

          <p
            className={cn(
              "mt-3 text-2xl font-black leading-none tracking-[-0.04em]",
              valueClass,
            )}
          >
            {value}
          </p>
        </div>

        {chip ?? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-violet-300">
            <Icon size={15} />
          </div>
        )}
      </div>

      <p className={cn("mt-3 text-xs font-medium", subClass)}>{sub}</p>
    </div>
  );
}
