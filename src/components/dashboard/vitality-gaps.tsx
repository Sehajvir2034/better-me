import Link from "next/link";
import { Zap } from "lucide-react";

export interface VitalityGap {
  pillar: string;
  icon: string;
  deficit: string; // "1.2L behind"
  action: string; // "Drink 2 glasses now"
  scoreBoost: number; // 4
  href: string;
  color: "blue" | "indigo" | "emerald" | "pink" | "orange" | "teal";
}

interface Props {
  gaps: VitalityGap[];
}

const colorMap = {
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  indigo: {
    text: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  pink: {
    text: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  teal: {
    text: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
};

export function VitalityGaps({ gaps }: Props) {
  if (gaps.length === 0) {
    return (
      <div className="relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 flex flex-col items-center justify-center gap-2 min-h-40">
        <Zap size={28} className="text-emerald-400" />
        <p className="text-white font-bold text-sm">All pillars on track</p>
        <p className="text-white/30 text-xs text-center">
          No gaps to close today. Great work.
        </p>
      </div>
    );
  }

  return (
    <div className="relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 bg-linear-to-br from-yellow-600/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-0.5">
              Vitality Gaps
            </p>
            <p className="text-[#FFFFE4] font-black text-3xl leading-none">
              {gaps.length}
              <span className="text-white/30 font-normal text-sm">
                {" "}
                pillar{gaps.length > 1 ? "s" : ""} behind
              </span>
            </p>
          </div>
          <Zap size={26} className="text-yellow-400 opacity-60" />
        </div>

        {/* Gap rows */}
        <div className="flex flex-col gap-2">
          {gaps.map((gap) => {
            const c = colorMap[gap.color];
            return (
              <Link href={gap.href} key={gap.pillar}>
                <div
                  className={`rounded-xl p-3 border ${c.bg} ${c.border} hover:opacity-80 transition-opacity`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{gap.icon}</span>
                      <div>
                        <p className={`text-sm font-bold ${c.text}`}>
                          {gap.pillar}
                          <span className="text-white/30 text-sm font-normal ml-1.5">
                            · {gap.deficit}
                          </span>
                        </p>
                        <p className="text-white/50 text-sm mt-0.5">
                          {gap.action}
                        </p>
                      </div>
                    </div>
                    {/* Score boost badge */}
                    <span className="shrink-0 text-[10px] font-black text-emerald-400 tracking-wider whitespace-nowrap">
                      +{gap.scoreBoost}%
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
