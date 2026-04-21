"use client";
import { useTransition } from "react";
import { logSupplement, unlogSupplement } from "@/lib/vitamin";
import { toast } from "sonner";
import { getToastStyle } from "@/lib/toast";
import { Button } from "../ui/button";
import type { Supplement } from "@/lib/vitamin";

interface LogEntry {
  log: { id: number; status: string; vitaminId: number };
  supplement: Supplement;
}

interface Props {
  userId: string;
  supplements: Supplement[];
  logs: LogEntry[];
  date: string;
}

const TIME_GROUPS = ["morning", "afternoon", "evening", "night"] as const;
const TIME_LABELS: Record<string, string> = {
  morning: "☀️ Morning",
  afternoon: "🌤️ Afternoon",
  evening: "🌙 Evening",
  night: "🌑 Night",
};

export function SupplementChecklist({
  userId,
  supplements,
  logs,
  date,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function isTaken(supplementId: number) {
    return logs.some(
      (l) => l.log.vitaminId === supplementId && l.log.status === "taken",
    );
  }

  function handleToggle(supplement: Supplement) {
    const taken = isTaken(supplement.id);
    const capturedUserId = userId;

    startTransition(() => {
      void (async () => {
        if (taken) {
          await unlogSupplement(capturedUserId, supplement.id, date);
          toast("Marked as not taken", {
            icon: "↩️",
            style: getToastStyle("default", "dark"),
          });
        } else {
          await logSupplement(capturedUserId, supplement.id, "taken", date);
          toast.success(`${supplement.name} taken!`, {
            icon: "💊",
            style: getToastStyle("default", "dark"),
            action: {
              label: "Undo",
              onClick: () => {
                startTransition(() => {
                  void unlogSupplement(capturedUserId, supplement.id, date);
                });
              },
            },
          });
        }
      })();
    });
  }

  const grouped = TIME_GROUPS.map((time) => ({
    time,
    items: supplements.filter((s) => s.timeOfDay === time),
  })).filter((g) => g.items.length > 0);

  if (supplements.length === 0) return null;

  return (
    <div className="space-y-3">
      {grouped.map(({ time, items }) => (
        <div
          key={time}
          className="rounded-[1.5rem] bg-[#13151f] border border-white/8 p-4 space-y-2"
        >
          <p className="text-[#FFFFE4] text-sm font-bold uppercase tracking-widest mb-3">
            {TIME_LABELS[time]}
          </p>
          <div className="flex flex-col gap-2">
            {items.map((supplement) => {
              const taken = isTaken(supplement.id);
              return (
                <Button
                  key={supplement.id}
                  variant="ghost"
                  onClick={() => handleToggle(supplement)}
                  disabled={isPending}
                  className={`flex items-center justify-between px-4 py-8 rounded-xl border transition-all active:scale-[0.98] ${
                    taken
                      ? "border-white/10 bg-white/4"
                      : "border-white/6 bg-white/2 hover:bg-white/4"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Color dot */}
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: supplement.color ?? "#3b82f6" }}
                    />
                    <div className="text-left">
                      <p
                        className={`text-sm font-semibold tracking-wider transition-colors ${taken ? "text-white/40 line-through" : "text-[#FFFFE4]"}`}
                      >
                        {supplement.name}
                      </p>
                      <p className="text-white/30 text-sm font-semibold tracking-wider">
                        {[supplement.dosage, supplement.unit]
                          .filter(Boolean)
                          .join(" ")}
                        {supplement.withFood
                          ? " · With Food"
                          : " · Empty Stomach"}
                      </p>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      taken
                        ? "border-transparent bg-green-500"
                        : "border-white/20"
                    }`}
                  >
                    {taken && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
