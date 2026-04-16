"use client";
import { Check } from "lucide-react";
import { useTransition } from "react";

interface RoutineItemProps {
  id: string;
  label: string;
  scheduledTime: string;
  category: "vitamins" | "skincare" | "haircare" | "nutrition" | "exercise";
  done: boolean;
  isNext: boolean;
  onToggle: (id: string, done: boolean) => Promise<void>;
}

const categoryColor: Record<RoutineItemProps["category"], string> = {
  vitamins: "text-pink-400 bg-pink-500/10",
  skincare: "text-rose-400 bg-rose-500/10",
  haircare: "text-teal-400 bg-teal-500/10",
  nutrition: "text-emerald-400 bg-emerald-500/10",
  exercise: "text-blue-400 bg-blue-500/10",
};

const categoryDot: Record<RoutineItemProps["category"], string> = {
  vitamins: "bg-pink-400",
  skincare: "bg-rose-400",
  haircare: "bg-teal-400",
  nutrition: "bg-emerald-400",
  exercise: "bg-blue-400",
};

export function RoutineItem({
  id,
  label,
  scheduledTime,
  category,
  done,
  isNext,
  onToggle,
}: RoutineItemProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => onToggle(id, !done));
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
        ${
          isNext
            ? "bg-white/5 border border-white/10 shadow-sm"
            : "hover:bg-white/4 border border-transparent"
        }
        ${done ? "opacity-50" : "opacity-100"}
      `}
    >
      {/* Checkbox */}
      <div
        className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200
        ${
          done
            ? "bg-emerald-500 border-emerald-500"
            : isNext
              ? "border-white/40 group-hover:border-white/60"
              : "border-white/20 group-hover:border-white/40"
        }`}
      >
        {done && <Check size={11} className="text-[#FFFFE4]" strokeWidth={3} />}
      </div>

      {/* Time */}
      <span
        className={`shrink-0 text-[12px] font-bold tracking-widest tabular-nums
        ${done ? "text-white/20" : isNext ? "text-white/60" : "text-white/30"}`}
      >
        {scheduledTime}
      </span>

      {/* Label */}
      <span
        className={`flex-1 text-sm font-medium text-left tracking-widest
        ${done ? "line-through text-white/25" : isNext ? "text-[#FFFFE4]" : "text-[#FFFFE4]/60"}`}
      >
        {label}
      </span>

      {/* Category dot */}
      <div
        className={`shrink-0 w-1.5 h-1.5 rounded-full ${categoryDot[category]}
        ${done ? "opacity-30" : "opacity-80"}`}
      />

      {/* "NEXT" badge */}
      {isNext && !done && (
        <span className="shrink-0 text-[12px] font-black tracking-widest text-white/40 uppercase">
          next
        </span>
      )}
    </button>
  );
}
