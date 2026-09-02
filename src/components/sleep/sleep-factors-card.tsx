import {
  Beer,
  Brain,
  Coffee,
  Dumbbell,
  MonitorSmartphone,
  MoonStar,
  Utensils,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SleepLog } from "@/db/schema";

interface SleepFactorsCardProps {
  latestLog: SleepLog | null;
}

type FactorTone = "positive" | "neutral" | "caution";

type Factor = {
  key: string;
  label: string;
  detail: string;
  active: boolean;
  icon: React.ElementType;
  tone: FactorTone;
};

function getFactorStyles(tone: FactorTone, active: boolean) {
  if (tone === "positive") {
    return active
      ? {
          iconClass: "bg-emerald-500/12 text-emerald-300",
          chipClass:
            "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20",
          chipLabel: "Logged",
        }
      : {
          iconClass: "bg-white/[0.05] text-white/35",
          chipClass: "bg-white/6 text-white/38 ring-1 ring-white/8",
          chipLabel: "Not logged",
        };
  }

  if (tone === "caution") {
    return active
      ? {
          iconClass: "bg-rose-500/12 text-rose-300",
          chipClass: "bg-rose-500/12 text-rose-300 ring-1 ring-rose-400/20",
          chipLabel: "Logged",
        }
      : {
          iconClass: "bg-emerald-500/10 text-emerald-300",
          chipClass:
            "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/15",
          chipLabel: "Clear",
        };
  }

  return active
    ? {
        iconClass: "bg-amber-500/12 text-amber-300",
        chipClass: "bg-amber-500/12 text-amber-300 ring-1 ring-amber-400/20",
        chipLabel: "Logged",
      }
    : {
        iconClass: "bg-white/[0.05] text-white/35",
        chipClass: "bg-white/6 text-white/38 ring-1 ring-white/8",
        chipLabel: "Not logged",
      };
}

function getFactors(log: SleepLog): Factor[] {
  return [
    {
      key: "late-caffeine",
      label: "Late caffeine",
      detail: log.hadLateCaffeine
        ? "Caffeine was logged close to bedtime."
        : "No late caffeine logged.",
      active: log.hadLateCaffeine,
      icon: Coffee,
      tone: "caution",
    },
    {
      key: "alcohol",
      label: "Alcohol",
      detail: log.hadAlcohol
        ? "Alcohol was logged before sleep."
        : "No alcohol logged.",
      active: log.hadAlcohol,
      icon: Beer,
      tone: "caution",
    },
    {
      key: "late-meal",
      label: "Late meal",
      detail: log.hadLateMeal
        ? "A late meal may have affected recovery."
        : "No late meal logged.",
      active: log.hadLateMeal,
      icon: Utensils,
      tone: "caution",
    },
    {
      key: "workout",
      label: "Workout",
      detail: log.hadWorkout
        ? "Exercise was completed that day."
        : "No workout was logged.",
      active: log.hadWorkout,
      icon: Dumbbell,
      tone: "positive",
    },
    {
      key: "stress",
      label: "High stress",
      detail: log.hadHighStress
        ? "High stress was logged before bed."
        : "No high stress logged.",
      active: log.hadHighStress,
      icon: Brain,
      tone: "caution",
    },
    {
      key: "screen-time",
      label: "Late screen time",
      detail: log.hadLateScreenTime
        ? "Screen use was logged close to bedtime."
        : "No late screen time logged.",
      active: log.hadLateScreenTime,
      icon: MonitorSmartphone,
      tone: "caution",
    },
  ];
}

function getSummary(log: SleepLog) {
  const cautionCount = [
    log.hadLateCaffeine,
    log.hadAlcohol,
    log.hadLateMeal,
    log.hadHighStress,
    log.hadLateScreenTime,
  ].filter(Boolean).length;

  if (cautionCount === 0) {
    return {
      label: "Clear evening",
      className: "text-emerald-300",
      detail: "No common sleep disruptors were logged last night.",
    };
  }

  if (cautionCount <= 2) {
    return {
      label: "A few factors",
      className: "text-amber-300",
      detail: "A small number of factors may have influenced recovery.",
    };
  }

  return {
    label: "High load",
    className: "text-rose-300",
    detail: "Several potential sleep disruptors were logged.",
  };
}

export function SleepFactorsCard({ latestLog }: SleepFactorsCardProps) {
  if (!latestLog) {
    return (
      <Card className="overflow-hidden rounded-[2rem] border-0 bg-[#13151f] py-0 shadow-none">
        <div className="border-b border-white/6 px-5 py-4 md:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/32">
                Sleep Factors
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#FFFFE4]">
                What influenced your night
              </h2>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-violet-300">
              <MoonStar size={17} />
            </div>
          </div>
        </div>

        <CardContent className="flex min-h-48 flex-col items-center justify-center px-5 py-8 text-center md:px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-white/25">
            <MoonStar size={22} />
          </div>

          <p className="mt-4 text-sm font-semibold text-white/35">
            No sleep factors logged yet.
          </p>

          <p className="mt-1 max-w-xs text-xs leading-relaxed text-white/22">
            Log a night to see which habits may have supported or disrupted your
            recovery.
          </p>
        </CardContent>
      </Card>
    );
  }

  const factors = getFactors(latestLog);
  const summary = getSummary(latestLog);

  return (
    <Card className="overflow-hidden rounded-[2rem] border-0 bg-[#13151f] py-0 shadow-none">
      <div className="border-b border-white/6 px-5 py-4 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/32">
              Sleep Factors
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#FFFFE4]">
              What influenced last night
            </h2>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-violet-300">
            <MoonStar size={17} />
          </div>
        </div>
      </div>

      <CardContent className="px-5 py-5 md:px-6">
        <div className="rounded-[1.35rem] border border-white/7 bg-white/[0.035] p-4">
          <p className={cn("text-sm font-bold", summary.className)}>
            {summary.label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/45">
            {summary.detail}
          </p>
        </div>

        <div className="mt-3 grid gap-2">
          {factors.map((factor) => {
            const styles = getFactorStyles(factor.tone, factor.active);
            const Icon = factor.icon;

            return (
              <div
                key={factor.key}
                className="flex items-center gap-3 rounded-[1.25rem] border border-white/6 bg-white/[0.025] p-3"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    styles.iconClass,
                  )}
                >
                  <Icon size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#FFFFE4]">
                    {factor.label}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-white/40">
                    {factor.detail}
                  </p>
                </div>

                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.13em]",
                    styles.chipClass,
                  )}
                >
                  {styles.chipLabel}
                </span>
              </div>
            );
          })}
        </div>

        {latestLog.notes ? (
          <div className="mt-3 rounded-[1.25rem] border border-white/6 bg-white/[0.025] p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
              Night note
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/55">
              {latestLog.notes}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
