"use client";

import Link from "next/link";
import { Droplet } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

interface Props {
  data: { consumed: number; goal: number };
}

export function WaterCard({ data }: Props) {
  const safeGoal = data.goal > 0 ? data.goal : 2500;
  const pct = Math.min(Math.round((data.consumed / safeGoal) * 100), 100);

  const status = pct >= 100 ? "OPTIMAL" : pct >= 60 ? "HYDRATED" : "LOW";

  const statusColor =
    pct >= 100
      ? "text-emerald-400"
      : pct >= 60
        ? "text-blue-400"
        : "text-orange-400";

  return (
    <Link href="/water">
      <div className="group relative flex h-60 w-60 shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-[2rem] bg-[#13151f] p-5 transition-all duration-300">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-blue-600/8 to-transparent" />

        <div className="relative flex items-start justify-between p-0.5">
          <div className="flex items-center justify-center rounded-full bg-blue-500/15 p-3">
            <Droplet size={26} className="text-blue-400" />
          </div>

          <span className={`text-sm font-bold tracking-widest ${statusColor}`}>
            {status}
          </span>
        </div>

        <div className="relative p-0.5">
          <p className="mb-1 text-[12px] uppercase tracking-widest text-white/40">
            Water
          </p>

          <div className="mb-4 flex items-end gap-1">
            <span className="text-3xl font-black leading-none text-white">
              <NumberTicker
                className="text-[#FFFFE4]"
                value={parseFloat((data.consumed / 1000).toFixed(1))}
                decimalPlaces={1}
              />
            </span>

            <span className="mb-0.5 text-sm tracking-widest text-white/30">
              / {(safeGoal / 1000).toFixed(1)}L
            </span>
          </div>

          <div className="relative flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < Math.round(pct / 10) ? "bg-blue-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
