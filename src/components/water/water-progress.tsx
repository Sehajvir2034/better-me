"use client";

import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";

interface Props {
  consumed: number; // ml
  goal: number; // ml
}

export function WaterProgress({ consumed, goal }: Props) {
  const pct = Math.min(Math.round((consumed / goal) * 100), 100);
  const remaining = Math.max(goal - consumed, 0);
  const done = consumed >= goal;

  const status = done
    ? "GOAL MET ✓"
    : consumed / goal >= 0.6
      ? "ON TRACK"
      : "BEHIND";

  const statusColor = done
    ? "text-emerald-400"
    : consumed / goal >= 0.6
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <>
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
          <AnimatedCircularProgressBar
            max={100}
            min={0}
            value={pct}
            gaugePrimaryColor="url(#progress-gradient)"
            gaugeSecondaryColor="rgba(255,255,255,0.08)"
            className="size-60 font-semibold text-[#FFFFE4] text-4xl"
          />
          {/* Overlay % next to the number */}
          <span className="absolute text-[#FFFFE4] text-xl font-bold mt-2 ml-18">
            %
          </span>
        </div>
        <div className="text-center">
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-1">
            {(consumed / 1000).toFixed(2)}L of {(goal / 1000).toFixed(1)}L
          </p>
          {!done && (
            <p className="text-white/30 text-sm font-semibold tracking-wider">
              {(remaining / 1000).toFixed(2)}L remaining
            </p>
          )}
          <span
            className={`text-base font-bold tracking-widest mt-1 block ${statusColor}`}
          >
            {status}
          </span>
        </div>
      </div>
    </>
  );
}
