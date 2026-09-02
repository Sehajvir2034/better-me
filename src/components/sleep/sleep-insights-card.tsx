import {
  CalendarClock,
  ChartNoAxesCombined,
  CircleAlert,
  Lightbulb,
  MoonStar,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SleepLog, SleepNap, SleepSettings } from "@/db/schema";
import type { SleepOverview } from "@/lib/sleep";
import {
  formatMinutesAsSleep,
  getBestSleepLog,
  getSleepDurationMinutes,
  getSleepScore,
  getWorstSleepLog,
} from "@/lib/sleep";

interface SleepInsightsCardProps {
  latestLog: SleepLog | null;
  overview: SleepOverview;
  logs: SleepLog[];
  naps: SleepNap[];
  settings: SleepSettings | null;
}

type InsightTone = "positive" | "warning" | "neutral";

type Insight = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  icon: React.ElementType;
  tone: InsightTone;
};

function formatSleepDate(value?: string | null) {
  if (!value) return "Unknown date";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function getToneClasses(tone: InsightTone) {
  switch (tone) {
    case "positive":
      return {
        iconClass: "bg-emerald-500/12 text-emerald-300",
        eyebrowClass: "text-emerald-300",
      };

    case "warning":
      return {
        iconClass: "bg-amber-500/12 text-amber-300",
        eyebrowClass: "text-amber-300",
      };

    default:
      return {
        iconClass: "bg-violet-500/12 text-violet-300",
        eyebrowClass: "text-violet-300",
      };
  }
}

function getFactorSummary(log: SleepLog) {
  const factors = [
    {
      active: log.hadLateCaffeine,
      label: "late caffeine",
    },
    {
      active: log.hadAlcohol,
      label: "alcohol",
    },
    {
      active: log.hadLateMeal,
      label: "a late meal",
    },
    {
      active: log.hadHighStress,
      label: "high stress",
    },
    {
      active: log.hadLateScreenTime,
      label: "late screen time",
    },
  ]
    .filter((factor) => factor.active)
    .map((factor) => factor.label);

  if (factors.length === 0) return null;
  if (factors.length === 1) return factors[0];

  if (factors.length === 2) {
    return `${factors[0]} and ${factors[1]}`;
  }

  return `${factors.slice(0, 2).join(", ")}, and ${factors.length - 2} more`;
}

function getInsights({
  latestLog,
  overview,
  logs,
  naps,
  settings,
}: SleepInsightsCardProps): Insight[] {
  const insights: Insight[] = [];
  const recentLogs = logs.slice(0, 7);

  if (logs.length === 0) {
    return [
      {
        id: "start",
        eyebrow: "Start here",
        title: "Log your first night",
        detail:
          "Once you log a few nights, Better Us can show duration trends, debt, consistency, and your personal sleep patterns.",
        icon: MoonStar,
        tone: "neutral",
      },
    ];
  }

  const bestLog = getBestSleepLog(recentLogs, settings);
  const worstLog = getWorstSleepLog(recentLogs, settings);

  if (bestLog) {
    const score = getSleepScore(bestLog, settings, recentLogs);
    const duration = formatMinutesAsSleep(getSleepDurationMinutes(bestLog));

    insights.push({
      id: "best-night",
      eyebrow: "Best night",
      title: `${score} score on ${formatSleepDate(bestLog.sleepDate)}`,
      detail: `Your strongest recent recovery night delivered ${duration} of sleep. Use that night as a reference point for your routine.`,
      icon: Trophy,
      tone: "positive",
    });
  }

  if (overview.rollingSleepDebtMinutes >= 120) {
    insights.push({
      id: "sleep-debt-high",
      eyebrow: "Recovery gap",
      title: `${formatMinutesAsSleep(overview.rollingSleepDebtMinutes)} of rolling sleep debt`,
      detail:
        "Your recent nights are falling short of your target. Protecting a longer sleep window over the next few nights can help reduce the gap.",
      icon: CircleAlert,
      tone: "warning",
    });
  } else if (overview.rollingSleepDebtMinutes >= 45) {
    insights.push({
      id: "sleep-debt-building",
      eyebrow: "Recovery watch",
      title: "A small sleep deficit is building",
      detail: `You have ${formatMinutesAsSleep(overview.rollingSleepDebtMinutes)} of rolling debt. A slightly earlier bedtime can keep it from accumulating.`,
      icon: CalendarClock,
      tone: "warning",
    });
  } else {
    insights.push({
      id: "sleep-debt-clear",
      eyebrow: "Recovery status",
      title: "Your recent sleep debt is under control",
      detail:
        "Keep your sleep window and wake time steady to maintain this recovery buffer.",
      icon: Sparkles,
      tone: "positive",
    });
  }

  if (overview.consistencyScore < 60) {
    insights.push({
      id: "consistency-low",
      eyebrow: "Pattern to improve",
      title: "Your sleep schedule is drifting",
      detail:
        "Your bedtime or wake time has varied substantially this week. A steadier wake time is the simplest place to start.",
      icon: ChartNoAxesCombined,
      tone: "warning",
    });
  } else if (overview.consistencyScore >= 80) {
    insights.push({
      id: "consistency-strong",
      eyebrow: "Strong pattern",
      title: "Your sleep timing is becoming more consistent",
      detail:
        "A steadier bedtime and wake time gives your recovery a more reliable foundation.",
      icon: CalendarClock,
      tone: "positive",
    });
  }

  if (latestLog) {
    const factorSummary = getFactorSummary(latestLog);

    if (factorSummary) {
      insights.push({
        id: "last-night-factors",
        eyebrow: "Last night",
        title: "A few potential disruptors were logged",
        detail: `${factorSummary.charAt(0).toUpperCase()}${factorSummary.slice(1)} appeared alongside your latest sleep entry. Keep logging to see whether the pattern repeats.`,
        icon: Lightbulb,
        tone: "neutral",
      });
    } else if (latestLog.hadWorkout) {
      insights.push({
        id: "workout-logged",
        eyebrow: "Last night",
        title: "You logged exercise and a clear evening",
        detail:
          "No common evening disruptors were recorded. Keep collecting data to see whether this combination aligns with better recovery for you.",
        icon: Sparkles,
        tone: "positive",
      });
    }
  }

  if (naps.length > 0 && overview.avgNapMinutes > 90) {
    insights.push({
      id: "long-naps",
      eyebrow: "Nap pattern",
      title: `Your average nap is ${formatMinutesAsSleep(overview.avgNapMinutes)}`,
      detail:
        "Longer naps may be worth watching alongside bedtime and sleep latency. The goal is to notice your own pattern, not to draw conclusions from a single week.",
      icon: MoonStar,
      tone: "neutral",
    });
  }

  if (worstLog && worstLog.id !== bestLog?.id && insights.length < 3) {
    const score = getSleepScore(worstLog, settings, recentLogs);
    const duration = formatMinutesAsSleep(getSleepDurationMinutes(worstLog));

    insights.push({
      id: "lowest-night",
      eyebrow: "Lowest night",
      title: `${score} score on ${formatSleepDate(worstLog.sleepDate)}`,
      detail: `This recent night recorded ${duration} of sleep. Review its factors and timing to see what may be worth adjusting.`,
      icon: CircleAlert,
      tone: "warning",
    });
  }

  return insights.slice(0, 3);
}

export function SleepInsightsCard(props: SleepInsightsCardProps) {
  const insights = getInsights(props);

  return (
    <Card className="overflow-hidden rounded-[2rem] border-0 bg-[#13151f] py-0 shadow-none">
      <div className="border-b border-white/6 px-5 py-4 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/32">
              Sleep Insights
            </p>

            <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#FFFFE4]">
              Patterns worth noticing
            </h2>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10 text-violet-300">
            <Sparkles size={17} />
          </div>
        </div>
      </div>

      <CardContent className="px-5 py-5 md:px-6">
        <div className="grid gap-3 lg:grid-cols-3">
          {insights.map((insight) => {
            const Icon = insight.icon;
            const tone = getToneClasses(insight.tone);

            return (
              <article
                key={insight.id}
                className="rounded-[1.5rem] border border-white/7 bg-white/[0.035] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.18em]",
                      tone.eyebrowClass,
                    )}
                  >
                    {insight.eyebrow}
                  </p>

                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                      tone.iconClass,
                    )}
                  >
                    <Icon size={15} />
                  </div>
                </div>

                <h3 className="mt-5 text-[15px] font-bold leading-snug tracking-[-0.015em] text-[#FFFFE4]">
                  {insight.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-white/48">
                  {insight.detail}
                </p>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
