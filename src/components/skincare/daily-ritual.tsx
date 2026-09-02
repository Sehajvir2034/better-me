"use client";

import { useMemo, useState, useTransition, useOptimistic } from "react";
import { format } from "date-fns";
import {
  Clock,
  Loader2,
  MoreHorizontal,
  History,
  Trash2,
  CheckCircle2,
  CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  toggleRitualStep,
  logRitualStepForDate,
  deactivateRitualStep,
} from "@/lib/skincare-actions";
import { SmartProductDialog } from "@/components/skincare/smart-product-dialog";
import type { RoutineStep } from "@/lib/skincare";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface Props {
  amSteps: RoutineStep[];
  pmSteps: RoutineStep[];
}

type StepAction =
  | { type: "toggle"; id: number; done: boolean; completedAt: string | null }
  | { type: "backfill"; id: number; done: true; completedAt: string | null }
  | { type: "remove"; id: number };

function formatTimeNow() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function StepRow({
  step,
  onToggle,
  onOpenHistory,
  onOpenRemove,
  disabled,
}: {
  step: RoutineStep;
  onToggle: (ritualStepId: number, productId: number, done: boolean) => void;
  onOpenHistory: (step: RoutineStep) => void;
  onOpenRemove: (step: RoutineStep) => void;
  disabled: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all",
        "hover:bg-white/3",
        step.done && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(step.id, step.productId, !step.done)}
        disabled={disabled}
        aria-label={step.done ? `Undo ${step.name}` : `Mark ${step.name} done`}
        className={cn(
          "shrink-0 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
          "disabled:cursor-not-allowed disabled:opacity-60",
          step.done
            ? "border-teal-500 bg-teal-500"
            : "border-white/20 bg-transparent hover:border-white/35",
        )}
      >
        {step.done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.2 5.7L8 1"
              stroke="white"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-satoshi text-sm font-bold tracking-wider text-[#FFFFE4] transition-all",
            step.done && "line-through text-white/45",
          )}
        >
          {step.name}
        </p>

        {step.brand && (
          <p className="mt-0.5 truncate font-satoshi text-sm text-white/40">
            {step.brand}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {step.done ? (
          <span className="flex items-center gap-1 text-green-400">
            <Clock size={14} />
            <span className="font-satoshi text-sm font-semibold">
              {step.completedAt ?? "Done"}
            </span>
          </span>
        ) : (
          <span className="font-satoshi text-sm font-semibold text-red-400">
            Pending
          </span>
        )}
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          disabled={disabled}
          aria-label={`Open actions for ${step.name}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="cursor-pointer rounded-lg p-2 text-white/35 transition hover:bg-white/6 hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreHorizontal size={16} />
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Close actions menu"
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />

            <div className="absolute right-0 top-11 z-20 min-w-52 overflow-hidden rounded-xl border border-white/10 bg-[#171923] p-1 shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggle(step.id, step.productId, !step.done);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#FFFFE4] transition hover:bg-white/6"
              >
                <CheckCircle2 size={15} />
                <span>
                  {step.done ? "Undo for today" : "Mark as done today"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenHistory(step);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#FFFFE4] transition hover:bg-white/6"
              >
                <History size={15} />
                <span>Log previous date</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenRemove(step);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/10"
              >
                <Trash2 size={15} />
                <span>Remove from ritual</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function DailyRitual({ amSteps, pmSteps }: Props) {
  const [tab, setTab] = useState<"am" | "pm">("am");
  const [isPending, startTrans] = useTransition();

  const [historyStep, setHistoryStep] = useState<RoutineStep | null>(null);
  const [historyDate, setHistoryDate] = useState<Date | undefined>(undefined);
  const [removeStep, setRemoveStep] = useState<RoutineStep | null>(null);

  const steps = useMemo(
    () => (tab === "am" ? amSteps : pmSteps),
    [tab, amSteps, pmSteps],
  );

  const [optimistic, updateOptimistic] = useOptimistic(
    steps,
    (state: RoutineStep[], action: StepAction) => {
      if (action.type === "remove") {
        return state.filter((s) => s.id !== action.id);
      }

      if (action.type === "toggle" || action.type === "backfill") {
        return state.map((s) =>
          s.id === action.id
            ? { ...s, done: action.done, completedAt: action.completedAt }
            : s,
        );
      }

      return state;
    },
  );

  function handleToggle(
    ritualStepId: number,
    productId: number,
    done: boolean,
  ) {
    startTrans(async () => {
      updateOptimistic({
        type: "toggle",
        id: ritualStepId,
        done,
        completedAt: done ? formatTimeNow() : null,
      });

      await toggleRitualStep(ritualStepId, productId, tab, done);
    });
  }

  function openHistoryDialog(step: RoutineStep) {
    setHistoryStep(step);
    setHistoryDate(undefined);
  }

  function submitHistoryLog() {
    if (!historyStep || !historyDate) return;

    const dateStr = toDateString(historyDate);

    startTrans(async () => {
      updateOptimistic({
        type: "backfill",
        id: historyStep.id,
        done: true,
        completedAt: "Logged",
      });

      await logRitualStepForDate({
        ritualStepId: historyStep.id,
        productId: historyStep.productId,
        timeOfDay: tab,
        date: dateStr,
      });

      setHistoryStep(null);
      setHistoryDate(undefined);
    });
  }

  function submitRemoveFromRitual() {
    if (!removeStep) return;

    startTrans(async () => {
      updateOptimistic({ type: "remove", id: removeStep.id });
      await deactivateRitualStep(removeStep.productId, tab);
      setRemoveStep(null);
    });
  }

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600/8 to-indigo-600/2 font-satoshi">
        <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
          <h2 className="font-satoshi text-base font-semibold tracking-wide text-[#FFFFE4]">
            Skincare Ritual
          </h2>

          <div className="flex items-center gap-0.75 rounded-full bg-white/4 p-0.75">
            {(["am", "pm"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium capitalize tracking-[0.12em] transition-all cursor-pointer",
                  tab === t
                    ? "bg-[#2a2e42] text-[#FFFFE4] shadow-sm"
                    : "text-white/30 hover:text-white/50",
                )}
              >
                {t === "am" ? "Morning" : "Evening"}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-55 flex-1 space-y-0.5 overflow-y-auto px-1 py-2">
          {optimistic.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <p className="font-satoshi text-base font-semibold text-white/25">
                No products in your {tab === "am" ? "morning" : "evening"}{" "}
                routine yet.
              </p>
              <p className="mt-1 text-base font-semibold text-white/15">
                Use the button below to add your first step.
              </p>
            </div>
          ) : (
            optimistic.map((step) => (
              <StepRow
                key={step.id}
                step={step}
                onToggle={handleToggle}
                onOpenHistory={openHistoryDialog}
                onOpenRemove={setRemoveStep}
                disabled={isPending}
              />
            ))
          )}
        </div>

        <div className="px-4 pb-4 pt-2">
          <SmartProductDialog mode="ritual" timeOfDay={tab} />
        </div>
      </div>

      {/* Log previous date dialog */}
      <Dialog
        open={historyStep !== null}
        onOpenChange={(open) => {
          if (!open) {
            setHistoryStep(null);
            setHistoryDate(undefined);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl bg-[#13151f] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="font-satoshi text-xl font-bold text-[#FFFFE4]">
              Log previous date
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 font-satoshi">
            <p className="text-sm text-white/65">
              Add a historical completion entry for{" "}
              <span className="font-semibold text-[#FFFFE4]">
                {historyStep?.name}
              </span>{" "}
              in your {tab === "am" ? "morning" : "evening"} ritual.
            </p>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold tracking-wider text-white/40">
                Date
              </label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start gap-2 rounded-xl border-white/10 bg-white/5 font-satoshi font-normal text-left",
                      !historyDate && "text-white/30",
                      historyDate && "text-[#FFFFE4]",
                    )}
                  >
                    <CalendarIcon
                      size={15}
                      className="shrink-0 text-white/40"
                    />
                    {historyDate ? format(historyDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto rounded-xl border-white/10 bg-[#13151f] p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={historyDate}
                    onSelect={setHistoryDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2020-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={() => {
                  setHistoryStep(null);
                  setHistoryDate(undefined);
                }}
                className="h-10 flex-1 rounded-xl bg-white/5 text-white hover:bg-white/10"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={isPending || !historyStep || !historyDate}
                onClick={submitHistoryLog}
                className="h-10 flex-1 rounded-xl border border-teal-500/30 bg-teal-500/20 font-bold text-teal-300 hover:bg-teal-500/30"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save log"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove from ritual dialog */}
      <Dialog
        open={removeStep !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveStep(null);
        }}
      >
        <DialogContent className="max-w-md rounded-2xl bg-[#13151f] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="font-satoshi text-center text-xl font-bold text-[#FFFFE4]">
              Remove from ritual
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 font-satoshi">
            <p className="text-sm font-medium text-white/65">
              Remove{" "}
              <span className="font-semibold text-[#FFFFE4]">
                {removeStep?.name}
              </span>{" "}
              from your {tab === "am" ? "morning" : "evening"} ritual. This will
              stop showing it in future routine lists, but your previous history
              stays intact.
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setRemoveStep(null)}
                className="h-10 flex-1 cursor-pointer rounded-xl bg-white/5 text-white hover:bg-white/10"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={isPending || !removeStep}
                onClick={submitRemoveFromRitual}
                className="h-10 flex-1 cursor-pointer rounded-xl bg-red-500/15 font-semibold text-red-300 hover:bg-red-500/25"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Removing...
                  </span>
                ) : (
                  "Remove from ritual"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
