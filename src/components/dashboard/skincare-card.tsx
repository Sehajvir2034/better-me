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

  const totalSegments = Math.max(data.totalSteps, 1);
  const filledSegments = Math.min(data.stepsCompleted, totalSegments);

  return (
    <Link href="/skincare">
      <div className="group relative flex h-60 w-60 shrink-0 cursor-pointer flex-col justify-between overflow-hidden rounded-[2rem] bg-[#13151f] p-5 transition-all duration-300">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-rose-600/8 to-transparent" />

        <div className="relative flex items-start justify-between p-0.5">
          <div className="flex items-center justify-center rounded-full bg-rose-500/15 p-3">
            <Smile size={26} className="text-rose-400" />
          </div>

          <span className={`text-sm font-bold tracking-widest ${statusColor}`}>
            {status}
          </span>
        </div>

        <div className="relative p-0.5">
          <p className="mb-1 text-[12px] uppercase tracking-widest text-white/40">
            Skincare
          </p>

          <div className="mb-3 flex gap-2">
            <div
              className={`flex-1 rounded-xl py-1.5 text-center text-xs font-bold tracking-wider ${
                data.amDone
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-white/5 text-white/30"
              }`}
            >
              🌅 AM {data.amDone ? "✓" : "—"}
            </div>

            <div
              className={`flex-1 rounded-xl py-1.5 text-center text-xs font-bold tracking-wider ${
                data.pmDone
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "bg-white/5 text-white/30"
              }`}
            >
              🌙 PM {data.pmDone ? "✓" : "—"}
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-white/30">
              Progress
            </span>
            <span className="text-xs font-bold tracking-wider text-white/45">
              {data.stepsCompleted}/{data.totalSteps}
            </span>
          </div>

          <div className="relative flex gap-1">
            {Array.from({ length: totalSegments }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < filledSegments ? "bg-rose-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
