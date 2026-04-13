"use client";
import Link from "next/link";
import { Wind } from "lucide-react";

interface Props {
  data: {
    lastWashDaysAgo: number | null;
    minoxidil?: { amDone: boolean; pmDone: boolean };
  };
}

export function HaircareCard({ data }: Props) {
  const { amDone = false, pmDone = false } = data.minoxidil ?? {}; // ✅ fixed
  const doseCount = (amDone ? 1 : 0) + (pmDone ? 1 : 0);

  const status =
    doseCount === 2 ? "DONE" : doseCount === 1 ? "IN PROGRESS" : "PENDING";
  const statusColor =
    doseCount === 2
      ? "text-emerald-400"
      : doseCount === 1
        ? "text-yellow-400"
        : "text-white/30";

  const washLabel =
    data.lastWashDaysAgo === null
      ? "No logs yet"
      : data.lastWashDaysAgo === 0
        ? "Washed today"
        : `Last washed ${data.lastWashDaysAgo}d ago`;

  return (
    <Link href="/haircare">
      <div className="shrink-0 w-60 h-60 group relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 flex flex-col justify-between hover:border-teal-500/30 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-linear-to-br from-teal-600/8 to-transparent pointer-events-none" />

        {/* Top row — icon + status */}
        <div className="relative flex justify-between items-start p-0.5">
          <div className="p-3 rounded-full bg-teal-500/15 flex items-center justify-center">
            <Wind size={26} className="text-teal-400" />
          </div>
          <span className={`text-sm font-bold tracking-widest ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* Bottom — metric */}
        <div className="relative p-0.5">
          <p className="text-white/40 text-[12px] uppercase tracking-widest mb-1">
            Haircare
          </p>

          {/* Last wash — secondary label */}
          <p className="text-white/30 text-[11px] tracking-wide mb-2">
            {data.lastWashDaysAgo === 0 ? "🚿 " : ""}
            {washLabel}
          </p>

          {/* Minoxidil AM / PM pills */}
          <div className="flex gap-2 mb-3">
            <div
              className={`flex-1 rounded-xl py-1.5 text-center text-xs font-bold tracking-wider border ${
                amDone
                  ? "bg-teal-500/20 border-teal-500/40 text-teal-300"
                  : "bg-white/5 border-white/10 text-white/30"
              }`}
            >
              🌅 AM {amDone ? "✓" : "—"}
            </div>
            <div
              className={`flex-1 rounded-xl py-1.5 text-center text-xs font-bold tracking-wider border ${
                pmDone
                  ? "bg-teal-500/20 border-teal-500/40 text-teal-300"
                  : "bg-white/5 border-white/10 text-white/30"
              }`}
            >
              🌙 PM {pmDone ? "✓" : "—"}
            </div>
          </div>

          {/* Progress segments — based on minoxidil doses (0, 1, or 2) */}
          <div className="relative flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < doseCount * 5 ? "bg-teal-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
