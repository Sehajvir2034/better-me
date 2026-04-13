"use client";
import Link from "next/link";
import { Utensils } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

interface Props {
  data: {
    calories: number;
    calorieGoal: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function NutritionCard({ data }: Props) {
  const pct = Math.min(
    Math.round((data.calories / data.calorieGoal) * 100),
    100,
  );
  const status = pct >= 90 ? "OPTIMAL" : pct >= 50 ? "ON TRACK" : "LOW";
  const statusColor =
    pct >= 90
      ? "text-emerald-400"
      : pct >= 50
        ? "text-yellow-400"
        : "text-orange-400";

  return (
    <Link href="/nutrition">
      <div className="shrink-0 w-60 h-60 group relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-600/8 to-transparent pointer-events-none" />

        {/* Top row — icon + status */}
        <div className="relative flex justify-between items-start p-0.5">
          <div className="p-3 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <Utensils size={26} className="text-emerald-400" />
          </div>
          <span className={`text-sm font-bold tracking-widest ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* Bottom — metric */}
        <div className="relative p-0.5">
          <p className="text-white/40 text-[12px] uppercase tracking-widest mb-1">
            Nutrition
          </p>

          {/* Calories */}
          <div className="flex items-end gap-1 mb-3">
            <span className="text-3xl font-black text-[#FFFFE4] leading-none">
              <NumberTicker className="text-[#FFFFE4]" value={data.calories} />
            </span>
            <span className="text-white/30 text-sm tracking-widest mb-0.5">
              kcal
            </span>
          </div>

          {/* Macro dots */}
          <div className="flex gap-3 mb-3">
            {[
              { label: "P", value: data.protein, color: "bg-blue-400" },
              { label: "C", value: data.carbs, color: "bg-yellow-400" },
              { label: "F", value: data.fat, color: "bg-rose-400" },
            ].map((macro) => (
              <div key={macro.label} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${macro.color}`} />
                <span className="text-white/40 text-[11px]">
                  {macro.label}:{" "}
                  <span className="text-[#FFFFE4]">{macro.value}g</span>
                </span>
              </div>
            ))}
          </div>

          {/* Progress segments */}
          <div className="relative flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < Math.round(pct / 10) ? "bg-emerald-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
