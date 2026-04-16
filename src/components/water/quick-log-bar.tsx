"use client";
import { useState, useTransition } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { logWater, deleteWaterEntry } from "@/lib/water";
import { toast } from "sonner";
import { getToastStyle } from "@/lib/toast";

interface Props {
  userId: string;
}

const PRESETS = [
  { label: "½ Owala", ml: 473 },
  { label: "1 Owala", ml: 946 },
  { label: "½ Stanley", ml: 590 },
  { label: "1 Stanley", ml: 1180 },
];

export function QuickLogBar({ userId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showCustom, setShowCustom] = useState(false);
  const [customMl, setCustomMl] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const selectedStr = format(date, "yyyy-MM-dd");
  const isHistoric = selectedStr !== todayStr;

  function formatAmount(ml: number) {
    return ml >= 1000 ? `${(ml / 1000).toFixed(2)}L` : `${ml}ml`;
  }

  function handlePreset(ml: number) {
    startTransition(() => {
      void (async () => {
        const entry = await logWater(userId, ml, selectedStr);
        toast.success("Water logged", {
          description: `${formatAmount(ml)} added${isHistoric ? ` for ${format(date, "dd MMM")}` : ""}`,
          icon: "💧",
          style: getToastStyle("water", "dark"),
          action: {
            label: "Undo",
            onClick: () => {
              startTransition(() => {
                void deleteWaterEntry(entry.id);
              });
              toast("Log removed", {
                icon: "↩️",
                description: `${formatAmount(ml)} undone`,
                style: getToastStyle("water", "dark"),
              });
            },
          },
        });
      })();
    });
  }

  function handleCustomSubmit() {
    const ml = parseInt(customMl);
    if (!ml || ml <= 0) return;
    startTransition(() => {
      void (async () => {
        const entry = await logWater(userId, ml, selectedStr);
        toast.success("Water logged", {
          description: `${formatAmount(ml)} added${isHistoric ? ` for ${format(date, "dd MMM")}` : ""}`,
          icon: "💧",
          style: getToastStyle("water", "dark"),
          action: {
            label: "Undo",
            onClick: () => {
              startTransition(() => {
                void deleteWaterEntry(entry.id);
              });
              toast("Log removed", {
                icon: "↩️",
                description: `${formatAmount(ml)} undone`,
                style: getToastStyle("water", "dark"),
              });
            },
          },
        });
      })();
    });
    setCustomMl("");
    setShowCustom(false);
  }

  return (
    <div className="rounded-[1.5rem] bg-[#13151f] border border-white/8 p-4 space-y-3">
      {/* Header + date picker */}
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
          Quick Log
        </p>
        <div className="flex items-center gap-2">
          {isHistoric && (
            <span className="text-xs font-bold text-yellow-400 tracking-wider">
              HISTORIC
            </span>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/8 active:bg-white/10 !hover:bg-white/8 border border-white/10 
                text-white/60 hover:text-white/60 active:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs font-semibold"
              >
                <CalendarIcon size={11} />
                {isHistoric ? format(date, "dd MMM yyyy") : "Today"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                defaultMonth={date}
                captionLayout="dropdown"
                disabled={{ after: new Date() }}
                onSelect={(d) => {
                  if (d) setDate(d);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.ml}
            variant="outline"
            onClick={() => handlePreset(p.ml)}
            disabled={isPending}
            className="flex flex-col items-center gap-0.5 h-auto py-2.5 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 active:scale-95 transition-all"
          >
            <span className="text-blue-400 font-bold text-sm">{p.label}</span>
            <span className="text-white/30 font-semibold text-[12px]">
              {p.ml}ml
            </span>
          </Button>
        ))}
      </div>

      {/* Custom input */}
      {showCustom ? (
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Amount in ml"
            value={customMl}
            onChange={(e) => setCustomMl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            className="flex-1 bg-white/5 border-2 border-blue-500/20 text-white placeholder:text-white/20 focus-visible:ring-blue-500/40"
          />
          <Button
            onClick={handleCustomSubmit}
            disabled={isPending}
            variant="outline"
            className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300"
          >
            Log
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowCustom(false)}
            className="text-white/30 hover:text-white/60 hover:bg-white/8"
          >
            ✕
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowCustom(true)}
          className="w-full bg-transparent border-white/8 text-white/30 hover:bg-white/4 hover:text-white/50 text-sm font-bold tracking-wider"
        >
          + Custom Amount
        </Button>
      )}
    </div>
  );
}
