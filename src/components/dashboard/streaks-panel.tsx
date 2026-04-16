import { Flame } from "lucide-react";

export interface StreakData {
  pillar: string;
  icon: string;
  currentStreak: number;
  bestStreak: number;
  status: "perfect" | "at-risk" | "broken";
}

interface Props {
  streaks: StreakData[];
}

function FlameIcon({ streak }: { streak: number }) {
  const color =
    streak >= 14
      ? "text-red-400"
      : streak >= 7
        ? "text-orange-400"
        : streak >= 3
          ? "text-yellow-400"
          : "text-white/20";
  return <Flame size={18} className={color} />;
}

const statusConfig = {
  perfect: { label: "On track", labelColor: "text-emerald-400" },
  "at-risk": { label: "At risk today", labelColor: "text-yellow-400" },
  broken: { label: "Broken", labelColor: "text-red-400/70" },
};

export function StreaksPanel({ streaks }: Props) {
  const activeStreaks = streaks.filter((s) => s.currentStreak > 0);
  const longestStreak = Math.max(...streaks.map((s) => s.currentStreak), 0);

  return (
    <div className="relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-600/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-0.5">
              Streaks
            </p>
            <p className="text-[#FFFFE4] font-black text-3xl leading-none">
              {activeStreaks.length}
              <span className="text-white/30 font-normal text-sm"> active</span>
            </p>
          </div>
          {longestStreak >= 7 && (
            <span className="text-sm font-black text-orange-400 tracking-widest">
              🔥 {longestStreak} DAY BEST
            </span>
          )}
        </div>

        {/* Streak rows */}
        <div className="flex flex-col gap-1.5">
          {streaks.map((s) => {
            const cfg = statusConfig[s.status];
            const isBest =
              s.currentStreak === s.bestStreak && s.currentStreak > 0;

            return (
              <div
                key={s.pillar}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/4 transition-colors"
              >
                {/* Flame + count */}
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <FlameIcon streak={s.currentStreak} />
                  <span className="text-[#FFFFE4] font-black text-sm tabular-nums">
                    {s.currentStreak}
                  </span>
                </div>

                {/* Icon + pillar name */}
                <span className="text-lg">{s.icon}</span>
                <span className="flex-1 text-sm text-[#FFFFE4] font-medium">
                  {s.pillar}
                </span>

                {/* Right side */}
                <div className="flex items-center gap-2">
                  {isBest && (
                    <span className="text-sm font-black text-yellow-400 tracking-widest">
                      BEST
                    </span>
                  )}
                  <span
                    className={`text-sm font-bold tracking-wide ${cfg.labelColor}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
