import { AlarmClock, Bell, BedDouble, MoonStar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SleepOverview } from "@/lib/sleep";
import type { SleepSettings } from "@/db/schema";
import { formatMinutesAsSleep } from "@/lib/sleep";

interface SleepTonightCardProps {
  overview: SleepOverview;
  settings: SleepSettings | null;
}

function formatClock(value?: string | null) {
  if (!value) return "--:--";

  const [hh, mm] = value.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return "--:--";

  const date = new Date();
  date.setHours(hh, mm, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function addMinutesToClock(value?: string | null, offset = 0) {
  if (!value) return "--:--";

  const [hh, mm] = value.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return "--:--";

  const total = hh * 60 + mm + offset;
  const normalized = ((total % 1440) + 1440) % 1440;

  const date = new Date();
  date.setHours(Math.floor(normalized / 60), normalized % 60, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getTonightMessage(
  overview: SleepOverview,
  settings: SleepSettings | null,
) {
  if (!settings?.targetBedtime) {
    return "Set a target bedtime to unlock a clearer wind-down plan for tonight.";
  }

  if (!overview.hasData) {
    return "Start with a realistic bedtime tonight and keep your wake time consistent tomorrow morning.";
  }

  if (overview.sleepDebtMinutes >= 120) {
    return "You are carrying meaningful sleep debt. Try protecting a longer sleep window tonight.";
  }

  if (overview.sleepDebtMinutes >= 45) {
    return "A slightly earlier bedtime tonight could help clear your remaining debt.";
  }

  if (overview.consistencyScore < 70) {
    return "Your biggest opportunity is rhythm. Keep bedtime and wake time tighter tonight.";
  }

  return "You are close to your target rhythm. The main goal tonight is staying consistent.";
}

function getDebtTone(minutes: number) {
  if (minutes >= 120) {
    return {
      chip: "bg-rose-500/12 text-rose-300 ring-1 ring-rose-400/20",
      label: "High debt",
    };
  }

  if (minutes >= 45) {
    return {
      chip: "bg-amber-500/12 text-amber-300 ring-1 ring-amber-400/20",
      label: "Some debt",
    };
  }

  return {
    chip: "bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-400/20",
    label: "On track",
  };
}

export function SleepTonightCard({
  overview,
  settings,
}: SleepTonightCardProps) {
  const targetBedtime = formatClock(settings?.targetBedtime);
  const targetWakeTime = formatClock(settings?.targetWakeTime);
  const reminderTime = formatClock(settings?.bedtimeReminderTime);
  const windDownMinutes = settings?.windDownMinutes ?? 30;
  const windDownStart = addMinutesToClock(
    settings?.targetBedtime,
    -windDownMinutes,
  );
  const targetSleep = formatMinutesAsSleep(settings?.targetSleepMinutes ?? 480);
  const rollingDebt = formatMinutesAsSleep(overview.rollingSleepDebtMinutes);
  const tonightDebt = getDebtTone(overview.sleepDebtMinutes);

  return (
    <Card className="overflow-hidden rounded-[2rem] border-0 bg-[#13151f] py-0 shadow-none">
      <div className="border-b border-white/6 px-5 py-4 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/32">
              Tonight Plan
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#FFFFE4]">
              Bedtime and wind-down
            </h2>
          </div>

          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
              tonightDebt.chip,
            )}
          >
            {tonightDebt.label}
          </span>
        </div>
      </div>

      <CardContent className="px-5 py-5 md:px-6">
        <p className="max-w-sm text-sm leading-relaxed text-white/55">
          {getTonightMessage(overview, settings)}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PlanMetric
            icon={BedDouble}
            label="Target bedtime"
            value={targetBedtime}
            sub={`Sleep goal ${targetSleep}`}
          />
          <PlanMetric
            icon={AlarmClock}
            label="Target wake"
            value={targetWakeTime}
            sub="Keep wake time stable"
          />
          <PlanMetric
            icon={MoonStar}
            label="Wind-down"
            value={windDownStart}
            sub={`${windDownMinutes} min before bed`}
          />
          <PlanMetric
            icon={Bell}
            label="Reminder"
            value={settings?.bedtimeReminderEnabled ? reminderTime : "Off"}
            sub={
              settings?.bedtimeReminderEnabled
                ? "Bedtime reminder enabled"
                : "Reminder disabled"
            }
          />
        </div>

        <div className="mt-4 rounded-[1.4rem] border border-white/7 bg-white/[0.035] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                Recovery pressure
              </p>
              <p className="mt-2 text-2xl font-black leading-none tracking-[-0.04em] text-[#FFFFE4]">
                {rollingDebt}
              </p>
              <p className="mt-2 text-xs font-medium text-white/42">
                Rolling 7-day sleep debt
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                Tonight gap
              </p>
              <p className="mt-2 text-xl font-black leading-none tracking-[-0.04em] text-[#FFFFE4]">
                {formatMinutesAsSleep(overview.sleepDebtMinutes)}
              </p>
              <p className="mt-2 text-xs font-medium text-white/42">
                From your latest night
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanMetric({
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
    <div className="rounded-[1.35rem] border border-white/7 bg-white/[0.035] p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
          {label}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-violet-300">
          <Icon size={16} />
        </div>
      </div>

      <p className="text-2xl font-black leading-none tracking-[-0.04em] text-[#FFFFE4]">
        {value}
      </p>
      <p className="mt-2 text-xs font-medium text-white/42">{sub}</p>
    </div>
  );
}
