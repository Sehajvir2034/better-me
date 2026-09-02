"use client";

import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

interface Props {
  consumed: number;
  goal: number;
}

export function WaterProgress({ consumed, goal }: Props) {
  const safeGoal = goal > 0 ? goal : 2500;
  const pct = Math.min(Math.round((consumed / safeGoal) * 100), 100);
  const remaining = Math.max(safeGoal - consumed, 0);
  const done = consumed >= safeGoal;

  const status = done
    ? "GOAL MET ✓"
    : consumed / safeGoal >= 0.6
      ? "ON TRACK"
      : "BEHIND";

  const statusColor = done
    ? "text-emerald-400"
    : consumed / safeGoal >= 0.6
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <linearGradient
            id="progress-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#48c1fa" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative flex items-center justify-center">
        {/* <AnimatedCircularProgressBar
          max={100}
          min={0}
          value={pct}
          gaugePrimaryColor="url(#progress-gradient)"
          gaugeSecondaryColor="rgba(255,255,255,0.08)"
          className="size-60 text-4xl font-semibold text-[#FFFFE4]"
        />

        <span className="absolute ml-18 mt-2 text-xl font-bold text-[#FFFFE4]">
          %
        </span> */}
        <AnimatedCircularProgressBar
          min={0}
          max={100}
          value={pct}
          valueSuffix="%"
          gaugePrimaryColor="url(#progress-gradient)"
          gaugeSecondaryColor="rgba(255,255,255,0.08)"
          className="size-60 text-4xl font-semibold text-[#FFFFE4]"
        />
      </div>

      <div className="text-center">
        <p className="mb-1 text-base font-bold uppercase tracking-widest text-white/45">
          {(consumed / 1000).toFixed(2)}L of {(safeGoal / 1000).toFixed(1)}L
        </p>

        {!done && (
          <p className="text-base font-semibold tracking-wider text-white/35">
            {(remaining / 1000).toFixed(2)}L remaining
          </p>
        )}

        <span
          className={`mt-1 block text-base font-bold tracking-widest ${statusColor}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
