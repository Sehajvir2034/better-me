"use client";
import { useState, useTransition } from "react";
import { deleteSupplement } from "@/lib/vitamin";
import { toast } from "sonner";
import { getToastStyle } from "@/lib/toast";
import { AddSupplementDialog } from "./add-supplement-dialog";
import type { Supplement } from "@/lib/vitamin";

interface AdherenceData {
  supplement: Supplement;
  adherence: number;
  takenCount: number;
}

interface Props {
  userId: string;
  adherenceData: AdherenceData[];
}

export function SupplementStackGrid({ userId, adherenceData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(
    null,
  );

  function handleDelete(supplement: Supplement) {
    startTransition(() => {
      void (async () => {
        await deleteSupplement(supplement.id);
        toast("Supplement removed", {
          description: `${supplement.name} removed from your stack`,
          icon: "🗑️",
          style: getToastStyle("default", "dark"),
        });
      })();
    });
  }

  return (
    <div className="rounded-[1.5rem] bg-[#13151f] border border-white/8 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
          My Stack
        </p>
      </div>

      {adherenceData.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-3xl">💊</p>
          <p className="text-white/40 text-sm font-semibold tracking-wider">
            No supplements yet
          </p>
          <p className="text-white/30 text-xs font-semibold">
            Tap + Add to build your stack
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {adherenceData.map(({ supplement, adherence }) => (
            <div
              key={supplement.id}
              className="relative rounded-2xl border border-white/6 bg-white/2 p-4 space-y-2"
              style={{
                borderLeftColor: supplement.color ?? "#3b82f6",
                borderLeftWidth: 3,
              }}
            >
              {/* Delete button */}
              <button
                onClick={() => handleDelete(supplement)}
                disabled={isPending}
                className="absolute top-2 right-2 w-5 h-5 rounded-full text-white/50 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center text-xs transition-all"
              >
                ✕
              </button>
              <button
                onClick={() => setEditingSupplement(supplement)}
                className="absolute top-2 right-8 w-5 h-5 rounded-full text-white/50 hover:text-blue-400 hover:bg-blue-500/10 flex items-center justify-center text-xs transition-all"
              >
                ✎
              </button>

              <div>
                <p className="text-[#FFFFE4] text-sm font-bold pr-4 leading-tight">
                  {supplement.name}
                </p>
                <p className="text-white/30 text-sm font-semibold mt-0.5">
                  {[supplement.dosage, supplement.unit]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                    {supplement.timeOfDay}
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      adherence >= 80
                        ? "text-green-400"
                        : adherence >= 50
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {adherence}%
                  </p>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${adherence}%`,
                      background: supplement.color ?? "#3b82f6",
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddSupplementDialog
        userId={userId}
        existingSupplements={adherenceData.map((d) => d.supplement)}
      />
      {editingSupplement && (
        <AddSupplementDialog
          userId={userId}
          existingSupplements={adherenceData.map((d) => d.supplement)}
          supplement={editingSupplement}
          open={true} // ← ADD THIS
          onClose={() => setEditingSupplement(null)}
        />
      )}
    </div>
  );
}
