"use client";
import { useState, useTransition, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addSupplement, updateSupplement } from "@/lib/vitamin";
import {
  findSupplementByName,
  getConflicts,
  getPairings,
  type SupplementKey,
} from "@/lib/supplements-knowledge";
import { toast } from "sonner";
import { getToastStyle } from "@/lib/toast";
import { SUPPLEMENT_SUGGESTIONS } from "@/lib/supplement-suggestions";
import type { Supplement } from "@/lib/vitamin";

interface ExistingSupplement {
  id: number;
  name: string;
}

interface Props {
  userId: string;
  existingSupplements: ExistingSupplement[];
  supplement?: Supplement;
  onClose?: () => void;
  open?: boolean;
}

const TIME_OPTIONS = ["morning", "afternoon", "evening", "night"] as const;
const UNIT_OPTIONS = ["mg", "mcg", "IU", "g", "capsule", "tablet", "ml"];
const TIME_RANGES: Record<string, [number, number]> = {
  morning: [5, 11],
  afternoon: [12, 16],
  evening: [17, 20],
  night: [21, 4],
};

export function AddSupplementDialog({
  userId,
  existingSupplements,
  supplement,
  onClose,
  open: externalOpen,
}: Props) {
  const isEditing = !!supplement;
  const [internalOpen, setInternalOpen] = useState(false);

  // Derive open: external controls it in edit mode, internal in add mode
  const open = externalOpen !== undefined ? externalOpen : internalOpen;

  function setOpen(v: boolean) {
    setInternalOpen(v);
    if (!v) onClose?.();
  }
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(supplement?.name ?? "");
  const [dosage, setDosage] = useState(supplement?.dosage ?? "");
  const [unit, setUnit] = useState(supplement?.unit ?? "mg");
  const [notes, setNotes] = useState(supplement?.notes ?? "");
  const [reminderTime, setReminderTime] = useState(
    supplement?.reminderTime ?? "",
  );
  const [timeOfDayOverride, setTimeOfDayOverride] = useState<string | null>(
    supplement?.timeOfDay ?? null,
  );
  const [withFoodOverride, setWithFoodOverride] = useState<boolean | null>(
    supplement?.withFood ?? null,
  );
  const nameInputRef = useRef<HTMLInputElement>(null);

  const smartInfo = useMemo(() => {
    if (name.length < 3) return null;
    return findSupplementByName(name);
  }, [name]);

  const { conflicts, pairings } = useMemo(() => {
    if (!smartInfo) return { conflicts: [], pairings: [] };
    const existingKeys = existingSupplements
      .map((s) => findSupplementByName(s.name)?.key)
      .filter(Boolean) as SupplementKey[];
    return {
      conflicts: getConflicts(smartInfo.key, existingKeys),
      pairings: getPairings(smartInfo.key, existingKeys),
    };
  }, [smartInfo, existingSupplements]);

  const timeOfDay = timeOfDayOverride ?? smartInfo?.bestTime ?? "morning";
  const withFood = withFoodOverride ?? smartInfo?.withFood ?? false;

  // Replace useEffect with this
  const suggestions = useMemo(() => {
    if (name.length < 2) return [];
    const lower = name.toLowerCase();
    return SUPPLEMENT_SUGGESTIONS.filter((s) =>
      s.toLowerCase().includes(lower),
    ).slice(0, 6);
  }, [name]);

  const isMismatch = useMemo(() => {
    if (!reminderTime) return false;
    const hour = parseInt(reminderTime.split(":")[0]);
    const [min, max] = TIME_RANGES[timeOfDay];
    if (timeOfDay === "night") return hour < 21 && hour > 4;
    return hour < min || hour > max;
  }, [reminderTime, timeOfDay]);

  const [dismissed, setDismissed] = useState(false);

  // Auto-focus name input when dialog opens
  useEffect(() => {
    if (open) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [open]);

  function reset() {
    setName(supplement?.name ?? "");
    setDosage(supplement?.dosage ?? "");
    setUnit(supplement?.unit ?? "mg");
    setTimeOfDayOverride(supplement?.timeOfDay ?? null);
    setReminderTime(supplement?.reminderTime ?? "");
    setWithFoodOverride(supplement?.withFood ?? null);
    setNotes(supplement?.notes ?? "");
    setDismissed(false);
    onClose?.();
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    startTransition(async () => {
      if (isEditing) {
        await updateSupplement(supplement.id, {
          name,
          dosage,
          unit,
          timeOfDay: timeOfDay as "morning" | "afternoon" | "evening" | "night",
          reminderTime,
          withFood,
          notes,
        });
        toast("Supplement updated", {
          description: `${name} has been updated`,
          icon: "✏️",
          style: getToastStyle("default", "dark"),
        });
      } else {
        await addSupplement(userId, {
          name,
          dosage,
          unit,
          timeOfDay: timeOfDay as "morning" | "afternoon" | "evening" | "night",
          reminderTime,
          withFood,
          notes,
          frequency: "daily",
        });
        toast("Supplement added", {
          description: `${name} added to your stack`,
          icon: "💊",
          style: getToastStyle("default", "dark"),
        });
      }
      setOpen(false);
      reset();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      {/* Only render trigger in add mode */}
      {!isEditing && (
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 text-sm font-semibold"
          >
            Add Supplement
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-[#13151f] border border-white/10 text-white max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="font-satoshi text-center  text-[#FFFFE4] font-bold text-xl tracking-wider">
            {isEditing ? "Edit Supplement" : "Add Your Supplement"}
          </DialogTitle>
        </DialogHeader>

        <div className="font-satoshi space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-white/40 text-sm font-bold uppercase tracking-wider">
              Name
            </Label>
            <Popover
              open={!dismissed && name.length >= 2 && suggestions.length > 0}
            >
              <PopoverAnchor asChild>
                <Input
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setDismissed(false);
                  }}
                  placeholder="e.g. Vitamin D, Magnesium..."
                  className="bg-white/5 border-white/10 font-semibold text-[#FFFFE4] placeholder:text-white/20"
                />
              </PopoverAnchor>
              <PopoverContent
                className="p-0 bg-[#1a1c2a] border border-white/10 rounded-xl shadow-xl"
                style={{ width: "var(--radix-popover-trigger-width)" }}
                onOpenAutoFocus={(e) => e.preventDefault()}
                sideOffset={4}
              >
                <Command className="bg-transparent">
                  <CommandList>
                    <CommandGroup>
                      {suggestions.map((s) => (
                        <CommandItem
                          key={s}
                          value={s}
                          onSelect={() => {
                            setName(s);
                            setDismissed(true);
                          }}
                          className="text-white/70 hover:text-[#FFFFE4] font-semibold font-satoshi cursor-pointer aria-selected:bg-white/5"
                        >
                          {s}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Dosage + unit */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label className="text-white/40 text-sm font-bold uppercase tracking-wider">
                Dosage<span className="text-red-400/60">*</span>
              </Label>
              <Input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 2000"
                type="number"
                className="bg-white/5 border-white/10 text-[#FFFFE4] placeholder:text-white/20"
              />
            </div>
            <div className="w-auto space-y-1.5">
              <Label className="text-white/40 text-sm font-bold uppercase tracking-wider">
                Unit
              </Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white/70 font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1c2a] border-white/10 text-white">
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem
                      key={u}
                      value={u}
                      className="text-white/70 focus:bg-white/5 focus:text-white font-semibold font-satoshi"
                    >
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time of day */}
          <div className="space-y-1.5">
            <Label className="text-white/40 text-sm font-bold uppercase tracking-wider">
              When
            </Label>
            <div className="grid grid-cols-4 gap-1.5">
              {TIME_OPTIONS.map((t) => (
                <Button
                  key={t}
                  onClick={() => setTimeOfDayOverride(t)}
                  className={`py-2 rounded-xl text-sm font-semibold capitalize transition-all border ${
                    timeOfDay === t
                      ? "bg-primary border-primary text-[#FFFFE4]"
                      : "bg-white/4 border-white/8 text-white/30 hover:text-white/50"
                  }`}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/40 text-sm font-bold uppercase tracking-wider">
              Reminder Time{" "}
              <span className="normal-case text-white/20">(optional)</span>
            </Label>
            <Input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="bg-white/5 border-white/10 text-[#FFFFE4] font-satoshi"
            />
            {/* Auto-suggest based on timeOfDay */}
            {!reminderTime && (
              <p className="text-white/20 text-[11px] font-semibold px-1">
                Suggested:{" "}
                <button
                  onClick={() =>
                    setReminderTime(
                      timeOfDay === "morning"
                        ? "08:00"
                        : timeOfDay === "afternoon"
                          ? "13:00"
                          : timeOfDay === "evening"
                            ? "18:00"
                            : "21:00",
                    )
                  }
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  {timeOfDay === "morning"
                    ? "8:00 AM"
                    : timeOfDay === "afternoon"
                      ? "1:00 PM"
                      : timeOfDay === "evening"
                        ? "6:00 PM"
                        : "9:00 PM"}
                </button>
              </p>
            )}
            {isMismatch && ( // ← ADD THIS BLOCK
              <p className="text-yellow-400/70 text-xs font-semibold px-1">
                ⚠️ {reminderTime} doesn&apos;t match {timeOfDay} — is that
                intentional?
              </p>
            )}
          </div>

          {/* With food — two button selector */}
          <div className="space-y-1.5">
            <Label className="text-white/40 text-sm font-bold uppercase tracking-wider">
              Take with
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={() => setWithFoodOverride(true)}
                className={`py-2.5 rounded-xl text-sm font-semibold tracking-wider transition-all border ${
                  withFood
                    ? "bg-green-500/45 hover:bg-green-400/35 border-green-500/30 text-[#FFFFE4] hover:text-[#FFFFE4]"
                    : "bg-white/4 border-white/8 text-white/30 hover:text-white/50"
                }`}
              >
                {/* 🍽️ With food */}
                With Food
              </Button>
              <Button
                variant="ghost"
                onClick={() => setWithFoodOverride(false)}
                className={`py-2.5 rounded-xl text-sm font-semibold tracking-wider transition-all border ${
                  !withFood
                    ? "bg-orange-500/45 hover:bg-orange-500/35 border-orange-500/30 text-[#FFFFE4] hover:text-[#FFFFE4]"
                    : "bg-white/4 border-white/8 text-white/30 hover:text-white/50"
                }`}
              >
                {/* 💧 Empty Stomach */}
                Empty Stomach
              </Button>
            </div>
            {smartInfo?.withFoodNote && (
              <p className="text-white/35 text-sm font-semibold px-1">
                {smartInfo.withFoodNote}
              </p>
            )}
          </div>

          {/* Smart suggestion banner */}
          {smartInfo && (
            <div className="rounded-xl bg-blue-500/8 border border-blue-500/15 p-3 space-y-2">
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
                ✨ Smart Suggestion
              </p>
              <p className="text-white/60 text-sm font-semibold leading-relaxed">
                {smartInfo.timingReason}
              </p>
              {/* ← Add this */}
              <p className="text-white/40 text-xs font-semibold">
                📏 Recommended:{" "}
                <span className="text-white/60">
                  {smartInfo.recommendedDose}
                </span>
              </p>
              {pairings.length > 0 && (
                <p className="text-green-400 text-xs font-semibold">
                  ✅ Pairs well with:{" "}
                  {pairings.map((p) => p.displayName).join(", ")}
                </p>
              )}
              {conflicts.length > 0 && (
                <p className="text-red-400 text-xs font-semibold">
                  ⚠️ Conflict:{" "}
                  {conflicts.map((c) => c.supplement.displayName).join(", ")} —{" "}
                  {conflicts[0].reason}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-white/40 text-xs font-bold uppercase tracking-wider">
              Notes{" "}
              <span className="normal-case text-white/20">(optional)</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. doctor recommended, brand notes..."
              rows={2}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending || !name.trim() || !dosage.trim()}
            className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 font-bold h-10 rounded-xl font-satoshi"
          >
            {isPending
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save Changes"
                : "Add to my stack"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
