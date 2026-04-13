interface Props {
  score: number;
  yearProgress: number;
}

// Consistency tiers
const TIERS = [
  {
    name: "Spark",
    days: 0,
    color: "text-white/30",
    description: "Just getting started",
  },
  {
    name: "Momentum",
    days: 3,
    color: "text-blue-400",
    description: "3 day streak",
  },
  {
    name: "Flow State",
    days: 7,
    color: "text-violet-400",
    description: "7 day streak",
  },
  {
    name: "Vital Rhythm",
    days: 14,
    color: "text-emerald-400",
    description: "14 day streak",
  },
  {
    name: "Eternal Bloom",
    days: 30,
    color: "text-amber-400",
    description: "30 day streak — peak consistency",
  },
];

// Hardcoded streak for now — wire up from DB later
const CURRENT_STREAK = 3;
const DAYS_TO_NEXT = 4; // days until next tier

function getCurrentTier(streak: number) {
  return [...TIERS].reverse().find((t) => streak >= t.days) ?? TIERS[0];
}

function getNextTier(streak: number) {
  return TIERS.find((t) => t.days > streak);
}

export function HeroSection({ score, yearProgress }: Props) {
  const currentTier = getCurrentTier(CURRENT_STREAK);
  const nextTier = getNextTier(CURRENT_STREAK);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[70%_1fr] gap-3 w-full pb-2 lg:pb-8">
      {/* ── LEFT ── */}
      <div className="bg-none rounded-2xl p-2 lg:p-4 flex flex-col justify-between min-h-75">
        <div>
          <p className="text-blue-300 text-sm font-semibold font-satoshi tracking-[0.3em] uppercase mb-4">
            The Annual Journey
          </p>
          <h1 className="text-4xl text-[#FFFFE4] lg:text-5xl xl:text-[4.5rem] font-black leading-none tracking-tight">
            <span>You&apos;ve reached </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-200">
              {score}%
            </span>
            <span>
              {" "}
              of your
              <br />
              vitality potential
              <br />
              this year.
            </span>
          </h1>
        </div>

        {/* Year progress bar */}
        <div className="mt-10">
          <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-600 to-blue-400 rounded-full"
              style={{ width: `${yearProgress}%` }}
            />
          </div>

          {/* Labels */}
          <div className="relative mt-2 h-4">
            {/* Jan 01 — always far left */}
            <span className="absolute left-0 text-[12px] text-white/35 tracking-[0.15em] uppercase">
              <span className="lg:hidden">Jan 01</span>
              <span className="hidden lg:inline">January 01</span>
            </span>

            {/* Today — moves with yearProgress but clamped at edges */}
            <span
              className="absolute text-[12px] text-white/60 tracking-[0.15em] uppercase"
              style={{
                left: `${Math.min(Math.max(yearProgress, 5), 92)}%`,
                transform:
                  yearProgress > 85
                    ? "translateX(-100%)" // near end → align right
                    : yearProgress < 15
                      ? "translateX(0%)" // near start → align left
                      : "translateX(-50%)", // middle → center
              }}
            >
              Today
            </span>

            {/* Dec 31 — always far right */}
            <span className="absolute right-0 text-[12px] text-white/35 tracking-[0.15em] uppercase">
              <span className="lg:hidden">Dec 31</span>
              <span className="hidden lg:inline">December 31</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Milestone Card ── */}
      {/* ── MOBILE — compact strip ── */}
      <div className="lg:hidden bg-[#171a22] rounded-2xl border border-white/15 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-blue-300 text-sm">✦</span>
          <span className="text-white/40 text-xs tracking-widest uppercase">
            Next Milestone
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={currentTier.color}>{currentTier.name}</span>
          <span className="text-white/20">→</span>
          <span className="text-white/60">{nextTier?.name}</span>
          <span className="text-white/20">·</span>
          <span className="text-orange-400 font-medium">
            {DAYS_TO_NEXT}d left
          </span>
        </div>
      </div>

      {/* ── DESKTOP — full card ── */}
      <div className="hidden lg:flex bg-[#171a22] rounded-[1.50rem] border border-white/15 p-8 flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-blue-300 font-bold text-lg tracking-widest">
            Next Milestone
          </p>
          <span className="text-blue-300 text-2xl">✦</span>
        </div>

        {/* Tier ladder */}
        <div className="space-y-2 my-4">
          {TIERS.map((tier) => {
            const isActive = tier.name === currentTier.name;
            const isPast = tier.days < currentTier.days;
            return (
              <div
                key={tier.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  isActive ? "bg-white/8 border border-white/15" : "opacity-40"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPast || isActive
                      ? tier.color.replace("text-", "bg-")
                      : "bg-white/20"
                  }`}
                />
                <span
                  className={`text-sm ${
                    isActive ? tier.color : "text-white/40"
                  }`}
                >
                  {tier.name}
                </span>
                {isActive && (
                  <span className="ml-auto text-sm capitalize text-orange-400">
                    current
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Next milestone CTA */}
        {nextTier && (
          <div>
            <h3 className="text-[#FFFFE4] tracking-widest font-bold text-lg leading-tight">
              {nextTier.name}
            </h3>
            <p className="text-white/40 text-sm mt-1 leading-relaxed">
              Maintain all pillars for{" "}
              <span className="text-orange-400 font-medium">
                {DAYS_TO_NEXT} more days
              </span>{" "}
              to unlock{" "}
              <span className="text-orange-400">
                &quot;{nextTier.name}&quot;
              </span>{" "}
              status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
