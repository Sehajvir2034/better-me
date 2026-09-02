"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { TZDate } from "react-day-picker";
import { format } from "date-fns";
import {
  AlarmClock,
  BedDouble,
  Check,
  CircleAlert,
  Coffee,
  Dumbbell,
  Loader2,
  MonitorSmartphone,
  MoonStar,
  Plus,
  Save,
  Sparkles,
  CalendarIcon,
  Utensils,
  Wine,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { cn } from "@/lib/utils";
import { saveSleepLog, type SleepLogActionState } from "@/lib/sleep-actions";
import type { SleepLog } from "@/db/schema";

interface LogSleepDialogProps {
  log?: SleepLog | null;
  trigger?: React.ReactNode;
  defaultSleepDate: string;
  maxSleepDate: string;
  onSuccess?: () => void;
}

type RatingFieldName = "sleepQuality" | "morningEnergy" | "morningMood";

const INITIAL_STATE: SleepLogActionState = {
  success: false,
};

const FACTORS = [
  {
    name: "hadLateCaffeine",
    label: "Late caffeine",
    icon: Coffee,
  },
  {
    name: "hadAlcohol",
    label: "Alcohol",
    icon: Wine,
  },
  {
    name: "hadLateMeal",
    label: "Late meal",
    icon: Utensils,
  },
  {
    name: "hadWorkout",
    label: "Workout",
    icon: Dumbbell,
  },
  {
    name: "hadHighStress",
    label: "High stress",
    icon: CircleAlert,
  },
  {
    name: "hadLateScreenTime",
    label: "Late screen time",
    icon: MonitorSmartphone,
  },
] as const;

function timeToInput(value?: Date | null) {
  return value ? format(value, "HH:mm") : "";
}

function RatingField({
  name,
  label,
  defaultValue,
}: {
  name: RatingFieldName;
  label: string;
  defaultValue?: number | null;
}) {
  const [value, setValue] = useState(defaultValue ? String(defaultValue) : "");

  return (
    <div className="space-y-2.5 font-satoshi">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm font-semibold capitalize tracking-wider text-white/45">
          {label}
        </Label>

        <span className="text-sm font-medium text-white/45">
          {value ? `${value}/5` : "Not rated"}
        </span>
      </div>

      <RadioGroup
        name={name}
        value={value}
        onValueChange={setValue}
        className="grid grid-cols-5 gap-1.5"
      >
        {[1, 2, 3, 4, 5].map((rating) => {
          const id = `${name}-${rating}`;
          const selected = value === String(rating);

          return (
            <Label
              key={rating}
              htmlFor={id}
              className={cn(
                "flex h-9 cursor-pointer items-center justify-center rounded-2xl border-2 text-sm font-bold transition-colors",
                selected
                  ? "border-primary bg-primary/15 text-primary"
                  : "border border-[#FFFFE4] bg-muted/30 text-white/45 hover:bg-muted",
              )}
            >
              <RadioGroupItem
                id={id}
                value={String(rating)}
                className="sr-only"
              />
              {rating}
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
}

function ymdToTZDate(value: string, timeZone = "Asia/Kolkata") {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return undefined;

  return new TZDate(year, month - 1, day, timeZone);
}
function toYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function SleepDateField({
  defaultValue,
  maxDate,
}: {
  defaultValue: string;
  maxDate: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const timeZone = "Asia/Kolkata";
  const selectedDate = value ? ymdToTZDate(value, timeZone) : undefined;
  const latestAllowedDate = ymdToTZDate(maxDate, timeZone);

  console.log({
    defaultValue,
    maxDate,
    value,
  });

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2 text-sm font-semibold capitalize tracking-wide text-[#FFFFE4]">
        <CalendarIcon className="ml-1 size-3.5 text-primary" />
        Sleep date <span className="-ml-1.5 text-destructive">*</span>
      </Label>

      <input name="sleepDate" type="hidden" value={value} />

      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-full justify-start rounded-xl border-2 border-[#FFFFE4] bg-muted/20 px-3 text-left font-medium text-[#FFFFE4] hover:bg-muted/50",
              !value && "text-[#FFFFE4]",
            )}
          >
            <CalendarIcon className="mr-2 size-4 text-primary" />
            {value ? <span>{value}</span> : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="z-[100] w-auto rounded-2xl border-border p-0"
        >
          <Calendar
            mode="single"
            timeZone={timeZone}
            selected={selectedDate}
            month={selectedDate ?? latestAllowedDate}
            onSelect={(date) => {
              if (!date) return;

              setValue(toYmd(date));
              setOpen(false);
            }}
            disabled={(date) =>
              latestAllowedDate ? date > latestAllowedDate : false
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function TimeField({
  id,
  name,
  label,
  icon: Icon,
  defaultValue,
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  icon: React.ElementType;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-semibold capitalize tracking-wide text-[#FFFFE4]"
      >
        <Icon className="size-3.5 text-primary" />
        {label}
        {required ? <span className="text-destructive -ml-1.5">*</span> : null}
      </Label>

      <Input
        id={id}
        name={name}
        type="time"
        required={required}
        defaultValue={defaultValue}
        className="h-10 rounded-xl border border-[#FFFFE4] bg-muted/20 text-[#FFFFE4] placeholder:text-[#FFFFE4] hover:bg-muted/50 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </div>

        <p className="text-base font-bold text-[#FFFFE4]">{title}</p>
      </div>

      {children}
    </section>
  );
}

export function LogSleepDialog({
  log,
  trigger,
  defaultSleepDate,
  maxSleepDate,
  onSuccess,
}: LogSleepDialogProps) {
  const [open, setOpen] = useState(false);

  const defaultValues = useMemo(
    () => ({
      sleepDate: log?.sleepDate ?? defaultSleepDate,
      bedTime: timeToInput(log?.bedTime),
      attemptedSleepTime: timeToInput(log?.attemptedSleepTime),
      fellAsleepTime: timeToInput(log?.fellAsleepTime),
      wakeTime: timeToInput(log?.wakeTime),
      outOfBedTime: timeToInput(log?.outOfBedTime),
    }),
    [defaultSleepDate, log],
  );

  const [state, formAction, isPending] = useActionState(
    async (
      previousState: SleepLogActionState,
      formData: FormData,
    ): Promise<SleepLogActionState> => {
      const result = await saveSleepLog(previousState, formData);

      if (result.success) {
        toast.success(log ? "Sleep entry updated" : "Sleep logged");
        onSuccess?.();

        // Deferred to the next task, avoiding a synchronous render-phase update.
        queueMicrotask(() => {
          setOpen(false);
        });
      }

      return result;
    },
    INITIAL_STATE,
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) return;
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" className="h-10 w-full rounded-2xl">
            <Plus className="size-4" />
            Log sleep
          </Button>
        )}
      </DialogTrigger>

      {/* <DialogContent className="max-h-[92dvh] max-w-2xl gap-0 overflow-hidden p-0 font-satoshi"> */}
      <DialogContent className="flex h-[88dvh] max-h-190 w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-[1.75rem] p-0 font-satoshi sm:w-full bg-[#13151f]">
        <DialogHeader className="shrink-0 border-b px-5 py-4 sm:px-6 justify-center items-center">
          <div className="flex items-start gap-3">
            {/* <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MoonStar className="size-4" />
              </div> */}

            <div className="min-w-0 space-y-0.5 ">
              <DialogTitle className="text-center font-satoshi text-xl font-bold tracking-wider text-[#FFFFE4]">
                {log ? "Edit sleep entry" : "Log last night"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <form
            id="sleep-log-form"
            action={formAction}
            className="space-y-5 px-5 py-5 sm:px-6"
          >
            <FormSection icon={BedDouble} title="Sleep timing">
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <SleepDateField
                  defaultValue={defaultValues.sleepDate}
                  maxDate={maxSleepDate}
                />

                <TimeField
                  id="bedTime"
                  name="bedTime"
                  label="Got into bed"
                  icon={BedDouble}
                  defaultValue={defaultValues.bedTime}
                  required
                />

                <TimeField
                  id="attemptedSleepTime"
                  name="attemptedSleepTime"
                  label="Tried to sleep"
                  icon={MoonStar}
                  defaultValue={defaultValues.attemptedSleepTime}
                />

                <TimeField
                  id="fellAsleepTime"
                  name="fellAsleepTime"
                  label="Fell asleep"
                  icon={MoonStar}
                  defaultValue={defaultValues.fellAsleepTime}
                />

                <TimeField
                  id="wakeTime"
                  name="wakeTime"
                  label="Final wake time"
                  icon={AlarmClock}
                  defaultValue={defaultValues.wakeTime}
                  required
                />

                <TimeField
                  id="outOfBedTime"
                  name="outOfBedTime"
                  label="Out of bed"
                  icon={AlarmClock}
                  defaultValue={defaultValues.outOfBedTime}
                />
              </div>
            </FormSection>

            <Separator className="my-5 " />

            <FormSection icon={CircleAlert} title="Awakenings">
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="awakeningsCount"
                    className="text-sm font-semibold capitalize tracking-wider text-white/45"
                  >
                    Number of awakenings
                  </Label>

                  <Input
                    id="awakeningsCount"
                    name="awakeningsCount"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    defaultValue={log?.awakeningsCount ?? 0}
                    className="h-10 bg-muted/20 text-[#FFFFE4] placeholder:text-[#FFFFE4] border border-[#FFFFE4]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="awakeMinutes"
                    className="text-sm font-semibold capitalize tracking-wider text-white/45"
                  >
                    Total awake minutes
                  </Label>

                  <Input
                    id="awakeMinutes"
                    name="awakeMinutes"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    defaultValue={log?.awakeMinutes ?? 0}
                    className="h-10 bg-muted/20 text-[#FFFFE4] placeholder:text-[#FFFFE4] border border-[#FFFFE4]"
                  />
                </div>
              </div>
            </FormSection>

            <Separator className="my-5" />

            <FormSection icon={Sparkles} title="Morning check-in">
              <div className="space-y-4 ">
                <RatingField
                  name="sleepQuality"
                  label="Sleep quality"
                  defaultValue={log?.sleepQuality}
                />

                <RatingField
                  name="morningEnergy"
                  label="Morning energy"
                  defaultValue={log?.morningEnergy}
                />

                <RatingField
                  name="morningMood"
                  label="Morning mood"
                  defaultValue={log?.morningMood}
                />
              </div>
            </FormSection>

            <Separator className="my-5" />

            <FormSection icon={CircleAlert} title="Factors from yesterday">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FACTORS.map(({ name, label, icon: Icon }) => {
                  const id = `factor-${name}`;

                  return (
                    <Label
                      key={name}
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#FFFFE4]  bg-muted/20 px-3 py-2 transition-colors hover:bg-muted/50"
                    >
                      <Checkbox
                        id={id}
                        name={name}
                        className="rounded-full border-2 border-[#FFFFE4] bg-muted/20 text-primary focus:ring-offset-background data-[state=checked]:bg-primary/80 data-[state=checked]:text-[#FFFFE4] cursor-pointer"
                        defaultChecked={Boolean(log?.[name])}
                      />

                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-black">
                        <Icon className="size-4" />
                      </span>

                      <span className="flex-1 text-sm font-semibold capitalize tracking-wide text-[#FFFFE4]">
                        {label}
                      </span>

                      {/* <Check className="size-4 text-muted-foreground" /> */}
                    </Label>
                  );
                })}
              </div>
            </FormSection>

            <Separator />

            <FormSection icon={MoonStar} title="Notes">
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="sr-only">
                  Notes
                </Label>

                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  defaultValue={log?.notes ?? ""}
                  placeholder="Anything worth remembering about last night?"
                  className="resize-none bg-muted/20 text-[#FFFFE4] font-semibold placeholder:text-[#FFFFE4] border border-[#FFFFE4]"
                />
              </div>
            </FormSection>

            {state.error ? (
              <Alert variant="destructive">
                <CircleAlert className="size-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="h-1" />
          </form>
        </ScrollArea>

        <DialogFooter className="shrink-0 border-t bg-background/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="h-10 flex-1 sm:flex-none bg-red-500 hover:bg-red-400 text-[#FFFFE4] hover:text-[#FFFFE4] cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="sleep-log-form"
            disabled={isPending}
            className="h-10 flex-1 sm:flex-none cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save sleep
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
