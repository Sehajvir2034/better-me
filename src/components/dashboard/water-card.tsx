"use client";
import Link from "next/link";
import { Droplet } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

interface Props {
  data: { consumed: number; goal: number };
}

export function WaterCard({ data }: Props) {
  const pct = Math.min(Math.round((data.consumed / data.goal) * 100), 100);
  const status = pct >= 100 ? "OPTIMAL" : pct >= 60 ? "HYDRATED" : "LOW";
  const statusColor =
    pct >= 100
      ? "text-emerald-400"
      : pct >= 60
        ? "text-blue-400"
        : "text-orange-400";

  return (
    <Link href="/water">
      <div className="shrink-0 w-60 h-60 group relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/8 to-transparent pointer-events-none" />

        {/* Top row — icon + status */}
        <div className="relative flex justify-between items-start p-0.5">
          <div className="p-3 rounded-full bg-blue-500/15 flex items-center justify-center">
            <Droplet size={26} className="text-blue-400" />
          </div>
          <span className={`text-sm font-bold tracking-widest ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* Bottom — metric */}
        <div className="relative p-0.5">
          <p className="text-white/40 text-[12px] uppercase tracking-widest mb-1">
            Water
          </p>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-3xl font-black text-white leading-none">
              <NumberTicker
                className="text-[#FFFFE4]"
                value={parseFloat((data.consumed / 1000).toFixed(1))}
                decimalPlaces={1}
              />
            </span>
            <span className="text-white/30 text-sm tracking-widest  mb-0.5">
              / {(data.goal / 1000).toFixed(1)}L
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
