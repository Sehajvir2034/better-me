"use client";
import Link from "next/link";
import { Pill } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

interface Props {
  data: { taken: number; total: number };
}

export function VitaminsCard({ data }: Props) {
  const pct = data.total > 0 ? Math.round((data.taken / data.total) * 100) : 0;
  const allDone = data.total > 0 && data.taken === data.total;
  const status = allDone ? "DONE" : data.taken > 0 ? "IN PROGRESS" : "PENDING";
  const statusColor = allDone
    ? "text-emerald-400"
    : data.taken > 0
      ? "text-yellow-400"
      : "text-white/30";

  return (
    <Link href="/vitamins">
      <div className="shrink-0 w-60 h-60 group relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 flex flex-col justify-between hover:border-pink-500/30 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-linear-to-br from-pink-600/8 to-transparent pointer-events-none" />

        {/* Top row — icon + status */}
        <div className="relative flex justify-between items-start p-0.5">
          <div className="p-3 rounded-full bg-pink-500/15 flex items-center justify-center">
            <Pill size={26} className="text-pink-400" />
          </div>
          <span className={`text-sm font-bold tracking-widest ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* Bottom — metric */}
        <div className="relative p-0.5">
          <p className="text-white/40 text-[12px] uppercase tracking-widest mb-1">
            Vitamins
          </p>

          <div className="flex items-end gap-1 mb-3">
            <NumberTicker
              className="text-3xl font-black text-[#FFFFE4] leading-none"
              value={data.taken}
            />
            <span className="text-white/30 text-sm tracking-widest mb-0.5">
              / {data.total} taken
            </span>
          </div>

          {/* Progress segments */}
          <div className="relative flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < Math.round(pct / 10) ? "bg-pink-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
