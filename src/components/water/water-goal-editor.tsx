"use client";
import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { updateWaterGoal } from "@/lib/water";

interface Props {
  userId: string;
  currentGoal: number;
}

export function WaterGoalEditor({ userId, currentGoal }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentGoal));
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const ml = parseInt(value);
    if (!ml || ml < 500 || ml > 10000) return;
    startTransition(async () => {
      await updateWaterGoal(userId, ml);
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs"
      >
        <Pencil size={11} />
        Goal: {(currentGoal / 1000).toFixed(1)}L
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ml e.g. 3000"
        className="w-28 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-blue-500/40"
      />
      <span className="text-white/30 text-xs">ml</span>
      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-all"
      >
        <Check size={13} />
      </button>
      <button
        onClick={() => setEditing(false)}
        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:bg-white/10 transition-all"
      >
        <X size={13} />
      </button>
    </div>
  );
}
