"use client";
import { useState, useTransition, useOptimistic } from "react";
import { Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleRitualStep } from "@/lib/skincare-actions";
import type { RoutineStep } from "@/lib/skincare";

interface Props {
  amSteps: RoutineStep[];
  pmSteps: RoutineStep[];
}

function RitualStepRow({
  step,
  timeOfDay,
  onToggle,
  isPending,
}: {
  step: RoutineStep;
  timeOfDay: "am" | "pm";
  onToggle: (id: number, done: boolean) => void;
  isPending: boolean;
}) {
  return (
    <button
      onClick={() => onToggle(step.id, !step.done)}
      disabled={isPending}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all",
        "hover:bg-white/3 active:scale-[0.99] text-left",
        step.done && "opacity-70",
      )}
    >
      {/* Checkbox */}
      <div
        className={cn(
          "shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
          step.done
            ? "bg-teal-500 border-teal-500"
            : "border-white/20 bg-transparent",
        )}
      >
        {step.done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold font-satoshi text-[#FFFFE4] transition-all",
            step.done && "line-through text-white/40",
          )}
        >
          {step.name}
        </p>
        {step.brand && (
          <p className="text-[11px] text-white/35 mt-0.5 font-satoshi">
            {step.brand}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="shrink-0">
        {step.done ? (
          <div className="flex items-center gap-1 text-white/30">
            <Clock size={11} />
            <span className="text-[11px] font-semibold">
              {step.completedAt ?? "Done"}
            </span>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-white/25">
            Pending
          </span>
        )}
      </div>
    </button>
  );
}

export function DailyRitual({ amSteps, pmSteps }: Props) {
  const [tab, setTab] = useState<"am" | "pm">("am");
  const [isPending, startTransition] = useTransition();

  const currentSteps = tab === "am" ? amSteps : pmSteps;

  const [optimisticSteps, updateOptimistic] = useOptimistic(
    currentSteps,
    (state: RoutineStep[], { id, done }: { id: number; done: boolean }) =>
      state.map((s) => (s.id === id ? { ...s, done } : s)),
  );

  function handleToggle(productId: number, done: boolean) {
    startTransition(async () => {
      updateOptimistic({ id: productId, done });
      await toggleRitualStep(productId, tab, done);
    });
  }

  return (
    <div className="rounded-2xl bg-[#13151f] border border-white/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌿</span>
          <h2 className="text-base font-bold text-[#FFFFE4] font-satoshi tracking-wide">
            Ritual
          </h2>
        </div>
        {/* AM/PM toggle */}
        <div className="flex items-center bg-white/5 rounded-lg p-0.5 gap-0.5">
          {(["am", "pm"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold tracking-widest uppercase transition-all",
                tab === t
                  ? "bg-[#2a2d3e] text-[#FFFFE4] shadow-sm"
                  : "text-white/30 hover:text-white/50",
              )}
            >
              {t === "am" ? "Morning" : "Evening"}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="px-1 py-2 space-y-0.5 min-h-50">
        {optimisticSteps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <p className="text-white/30 text-sm font-satoshi">
              No products in your {tab === "am" ? "morning" : "evening"}{" "}
              routine.
            </p>
            <p className="text-white/20 text-xs mt-1">
              Add products using the button below.
            </p>
          </div>
        ) : (
          optimisticSteps.map((step) => (
            <RitualStepRow
              key={step.id}
              step={step}
              timeOfDay={tab}
              onToggle={handleToggle}
              isPending={isPending}
            />
          ))
        )}
      </div>

      {/* Add to Ritual */}
      <div className="px-4 py-4 border-t border-white/6">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/15 text-white/40 text-sm font-semibold font-satoshi hover:border-white/25 hover:text-white/60 transition-all">
          <Plus size={16} />
          Add to Ritual
        </button>
      </div>
    </div>
  );
}
