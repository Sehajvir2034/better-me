"use client";
import Link from "next/link";
import { Zap } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

interface Props {
  data: { workouts: number; totalMinutes: number; calories: number };
}

export function ActivityCard({ data }: Props) {
  const status =
    data.totalMinutes >= 30
      ? "ACTIVE"
      : data.totalMinutes > 0
        ? "MOVING"
        : "REST DAY";

  const statusColor =
    data.totalMinutes >= 30
      ? "text-orange-400"
      : data.totalMinutes > 0
        ? "text-yellow-400"
        : "text-white/30";

  const pct = Math.min(Math.round((data.totalMinutes / 60) * 100), 100);

  return (
    <Link href="/activity">
      <div className="shrink-0 w-60 h-60 group relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 flex flex-col justify-between hover:border-orange-500/30 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/8 to-transparent pointer-events-none" />

        {/* Top row — icon + status */}
        <div className="relative flex justify-between items-start p-0.5">
          <div className="p-3 rounded-full bg-orange-500/15 flex items-center justify-center">
            <Zap size={26} className="text-orange-400" />
          </div>
          <span className={`text-sm font-bold tracking-widest ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* Bottom — metric */}
        <div className="relative p-0.5">
          <p className="text-white/40 text-[12px] uppercase tracking-widest mb-1">
            Activity
          </p>

          <div className="flex items-end gap-1 mb-3">
            {data.totalMinutes > 0 ? (
              <>
                <span className="text-3xl font-black text-[#FFFFE4] leading-none">
                  <NumberTicker
                    className="text-[#FFFFE4]"
                    value={data.totalMinutes}
                  />
                </span>
                <span className="text-white/30 text-sm tracking-widest mb-0.5">
                  mins
                </span>
              </>
            ) : (
              <span className="text-3xl font-black text-white/20 leading-none">
                —
              </span>
            )}
          </div>

          {/* Workouts + calories row */}
          <div className="flex gap-3 mb-3">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="text-white/40 text-[11px]">
                Workouts:{" "}
                <span className="text-[#FFFFE4]">{data.workouts}</span>
              </span>
            </div>
            {/* <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span className="text-white/40 text-[11px]">
                Burned:{" "}
                <span className="text-white/70">{data.calories} kcal</span>
              </span>
            </div> */}
          </div>

          {/* Progress segments */}
          <div className="relative flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < Math.round(pct / 10) ? "bg-orange-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
