import { Flame } from "lucide-react";
interface Props {
  completedSteps: number;
  totalSteps: number;
  streakDays: number;
}

export function SkincareHero({
  completedSteps,
  totalSteps,
  streakDays,
}: Props) {
  const pct =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const remaining = totalSteps - completedSteps;

  return (
    <div className="flex gap-3 font-satoshi">
      {/* ── Progress card ── */}
      <div className="relative flex-1 rounded-2xl bg-[#13151f]  p-4 lg:p-6 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-600/8 to-transparent pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-1.5">
              TODAY&apos;S PROGRESS
            </p>
            <h1 className="text-xl lg:text-3xl font-semibold text-[#FFFFE4] tracking-wide mb-2 leading-tight">
              Daily Routine Completion
            </h1>
            <p className="text-white/50 text-sm lg:text-sm hidden font-normal sm:block max-w-sm my-1.5">
              {completedSteps > 0
                ? `You've completed ${completedSteps} of ${totalSteps} steps in your clinical regimen. Keep going to maintain your ${streakDays}-day streak!`
                : `Start your routine — ${totalSteps} steps await today.`}
            </p>
            <p className="text-white/50 text-sm sm:hidden">
              Step {completedSteps} of {totalSteps} completed
            </p>
            <div className="pt-5.5 space-y-1.5">
              <div className="h-1.5 lg:h-2 w-full bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-sm mt-2 font-semibold">
                <span className="text-white/40 uppercase tracking-widest text-xs">
                  ROUTINE PROGRESS
                </span>
                <span className="text-teal-400">{pct}%</span>
              </div>
            </div>
          </div>

          {/* Streak — INLINE inside card, desktop only */}
          <div className="hidden lg:flex shrink-0 rounded-2xl bg-[#1e2235] p-5 min-w-44 flex-col items-center justify-center text-center gap-1 mt-4">
            {streakDays > 0 && (
              <div className="w-9 h-9 rounded-full border border-orange-400/40 bg-orange-400/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
              </div>
            )}
            <span className="text-5xl font-semibold text-[#FFFFE4] leading-none">
              {streakDays}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40 mt-1">
              Day Streak
            </span>
          </div>
        </div>
      </div>

      {/* Streak — SEPARATE card, mobile only */}
      <div className="lg:hidden shrink-0 w-28 rounded-2xl bg-linear-to-br border border-white/5 from-indigo-600/8 to-transparent flex flex-col items-center justify-center text-center p-4 gap-1">
        {streakDays > 0 && (
          <div className="w-9 h-9 rounded-full border border-orange-400/40 bg-orange-400/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
          </div>
        )}
        <span className="text-4xl font-bold text-[#FFFFE4] leading-none">
          {streakDays}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mt-1">
          Day Streak
        </span>
      </div>
    </div>
  );
}
