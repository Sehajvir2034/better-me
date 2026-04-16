"use client";
import { useTransition, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { deleteWaterEntry, logWater } from "@/lib/water";
import { getToastStyle } from "@/lib/toast";
import { toast } from "sonner";

interface Entry {
  id: number;
  amountMl: number;
  loggedAt: Date | null;
  date: string;
}

interface Props {
  entries: Entry[];
  userId: string;
}

function formatTime(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateLabel(date: Date) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = format(yesterdayDate, "yyyy-MM-dd");
  const selectedStr = format(date, "yyyy-MM-dd");

  if (selectedStr === todayStr) return "Today";
  if (selectedStr === yesterdayStr) return "Yesterday";
  return format(date, "dd MMM yyyy");
}

function formatAmount(ml: number) {
  return ml >= 1000 ? `${(ml / 1000).toFixed(2)}L` : `${ml}ml`;
}

export function WaterEntryList({ entries, userId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const selectedStr = format(selectedDate, "yyyy-MM-dd");
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const filtered = entries.filter((e) => e.date === selectedStr);
  const totalMl = filtered.reduce((sum, e) => sum + e.amountMl, 0);

  function handleDelete(entry: Entry) {
    console.log("userId at delete time:", userId);
    const capturedUserId = userId; // ← capture at call time

    startTransition(() => {
      void (async () => {
        await deleteWaterEntry(entry.id);
        toast("Log removed", {
          description: `${formatAmount(entry.amountMl)} deleted`,
          icon: "🗑️",
          style: getToastStyle("water", "dark"),
          action: {
            label: "Undo",
            onClick: () => {
              startTransition(() => {
                void (async () => {
                  await logWater(capturedUserId, entry.amountMl, entry.date); // ← use captured
                  toast.success("Log restored", {
                    icon: "↩️",
                    description: `${formatAmount(entry.amountMl)} added back`,
                    style: getToastStyle("water", "dark"),
                  });
                })();
              });
            },
          },
        });
      })();
    });
  }

  return (
    <div className="rounded-[1.5rem] bg-[#13151f] border border-white/8 p-4 space-y-3">
      {/* Header + date picker */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
            Log
          </p>
          {filtered.length > 0 && (
            <p className="text-white/30 text-xs font-semibold mt-0.5">
              {totalMl >= 1000
                ? `${(totalMl / 1000).toFixed(2)}L total`
                : `${totalMl}ml total`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedStr !== todayStr && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2"
            >
              ← Today
            </Button>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 bg-white/5 border-white/10 text-white/60 hover:bg-white/8 hover:text-white/80 text-xs font-semibold"
              >
                <CalendarIcon size={11} />
                {formatDateLabel(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                defaultMonth={selectedDate}
                captionLayout="dropdown"
                disabled={{ after: new Date() }}
                onSelect={(d) => {
                  if (d) setSelectedDate(d);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Date label */}
      <p className="text-[#FFFFE4] font-bold text-sm tracking-wider">
        {formatDateLabel(selectedDate)}
      </p>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-white/30 text-sm tracking-wider font-bold">
            No entries for this day.
          </p>
          {selectedStr === todayStr && (
            <p className="text-white/20 text-[12px] font-semibold tracking-wider mt-1">
              Log your first glass above
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/4 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-blue-400 text-base">💧</span>
                <div>
                  <p className="text-[#FFFFE4] text-sm font-bold">
                    {formatAmount(entry.amountMl)}
                  </p>
                  <p className="text-white/30 text-xs font-semibold">
                    {formatTime(entry.loggedAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(entry)}
                disabled={isPending}
                className="opacity-80 hover:opacity-100 w-6 h-6 rounded-full text-white/90 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
