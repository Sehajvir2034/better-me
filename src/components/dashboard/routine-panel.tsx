"use client";
import { RoutineItem } from "./routine-item";

export interface RoutineItemData {
  id: string;
  label: string;
  scheduledTime: string;
  category: "vitamins" | "skincare" | "haircare" | "nutrition" | "exercise";
  done: boolean;
}
interface Props {
  items: RoutineItemData[];
  onToggle: (id: string, done: boolean) => Promise<void>;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function RoutinePanel({ items, onToggle }: Props) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sorted = [...items].sort(
    (a, b) => timeToMinutes(a.scheduledTime) - timeToMinutes(b.scheduledTime),
  );

  // First undone item that's either upcoming or overdue
  const nextIndex = sorted.findIndex((item) => !item.done);

  const doneCount = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total > 0 ? (doneCount / total) * 100 : 0;

  // Find where to insert the NOW divider
  const nowDividerIndex = sorted.findIndex(
    (item) => timeToMinutes(item.scheduledTime) > currentMinutes,
  );

  return (
    <div className="relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute inset-0 bg-linear-to-br from-violet-600/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-0.5">
              The Routine
            </p>
            <p className="text-[#FFFFE4] font-black text-3xl leading-none">
              {doneCount}
              <span className="text-white/30 font-normal text-sm">
                {" "}
                / {total} done
              </span>
            </p>
          </div>

          {/* Progress pill */}
          <span
            className={`text-xs font-bold tracking-widest
            ${pct === 100 ? "text-emerald-400" : pct > 0 ? "text-yellow-400" : "text-white/30"}`}
          >
            {pct === 100 ? "DONE ✓" : pct > 0 ? "IN PROGRESS" : "PENDING"}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/8 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-linear-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Items list */}
        <div className="flex flex-col gap-1">
          {sorted.map((item, index) => {
            // Insert NOW divider
            const showNowDivider =
              nowDividerIndex !== -1 && index === nowDividerIndex;

            return (
              <div key={item.id}>
                {showNowDivider && (
                  <div className="flex items-center gap-2 my-2 px-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">
                      now
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}
                <RoutineItem
                  {...item}
                  isNext={index === nextIndex}
                  onToggle={onToggle}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
