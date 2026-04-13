"use client";
import Link from "next/link";
import { Smile } from "lucide-react";

interface Props {
  data: {
    amDone: boolean;
    pmDone: boolean;
    stepsCompleted: number;
    totalSteps: number;
  };
}

export function SkincareCard({ data }: Props) {
  const pct =
    data.totalSteps > 0
      ? Math.round((data.stepsCompleted / data.totalSteps) * 100)
      : 0;
  const status =
    data.amDone && data.pmDone
      ? "DONE"
      : data.amDone || data.pmDone
        ? "IN PROGRESS"
        : "PENDING";
  const statusColor =
    data.amDone && data.pmDone
      ? "text-emerald-400"
      : data.amDone || data.pmDone
        ? "text-yellow-400"
        : "text-white/30";

  return (
    <Link href="/skincare">
      <div className="shrink-0 w-60 h-60 group relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 flex flex-col justify-between hover:border-rose-500/30 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-linear-to-br from-rose-600/8 to-transparent pointer-events-none" />

        {/* Top row — icon + status */}
        <div className="relative flex justify-between items-start p-0.5">
          <div className="p-3 rounded-full bg-rose-500/15 flex items-center justify-center">
            <Smile size={26} className="text-rose-400" />
          </div>
          <span className={`text-sm font-bold tracking-widest ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* Bottom — metric */}
        <div className="relative p-0.5">
          <p className="text-white/40 text-[12px] uppercase tracking-widest mb-1">
            Skincare
          </p>

          {/* AM / PM pills */}
          <div className="flex gap-2 mb-3">
            <div
              className={`flex-1 rounded-xl py-1.5 text-center text-xs font-bold tracking-wider border ${
                data.amDone
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  : "bg-white/5 border-white/10 text-white/30"
              }`}
            >
              🌅 AM {data.amDone ? "✓" : "—"}
            </div>
            <div
              className={`flex-1 rounded-xl py-1.5 text-center text-xs font-bold tracking-wider border ${
                data.pmDone
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                  : "bg-white/5 border-white/10 text-white/30"
              }`}
            >
              🌙 PM {data.pmDone ? "✓" : "—"}
            </div>
          </div>

          {/* Progress segments */}
          <div className="relative flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < Math.round(pct / 10) ? "bg-rose-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
