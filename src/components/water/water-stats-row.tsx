interface Props {
  streak: number;
  avgMl: number;
  bestMl: number;
}

export function WaterStatsRow({ streak, avgMl, bestMl }: Props) {
  const stats = [
    {
      icon: "🔥",
      label: "Streak",
      value: `${streak}d`,
      glow: "from-orange-600/8",
      border: "hover:border-orange-500/30",
    },
    {
      icon: "📅",
      label: "7d Avg",
      value: `${(avgMl / 1000).toFixed(2)}L`,
      glow: "from-blue-600/8",
      border: "hover:border-blue-500/30",
    },
    {
      icon: "🏆",
      label: "Best",
      value: `${(bestMl / 1000).toFixed(2)}L`,
      glow: "from-yellow-600/8",
      border: "hover:border-yellow-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`relative rounded-[1.25rem] bg-[#13151f] border border-white/8 ${s.border} p-3 flex flex-col items-center gap-1 overflow-hidden transition-all duration-300`}
        >
          {/* Per-stat glow */}
          <div
            className={`absolute inset-0 bg-linear-to-br ${s.glow} to-transparent pointer-events-none`}
          />

          <span className="relative text-lg">{s.icon}</span>
          <p className="relative text-[#FFFFE4] font-bold text-sm tabular-nums">
            {s.value}
          </p>
          <p className="relative text-white/30 text-xs font-semibold uppercase tracking-wider">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
