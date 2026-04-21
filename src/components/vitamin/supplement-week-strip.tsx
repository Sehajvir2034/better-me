import { format } from "date-fns";

interface DaySummary {
  date: string;
  taken: number;
  total: number;
}

interface Props {
  weekData: DaySummary[];
}

export function SupplementWeekStrip({ weekData }: Props) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div className="rounded-[1.5rem] bg-[#13151f] border border-white/8 p-4 space-y-3">
      <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
        This Week
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {weekData.map(({ date, taken, total }) => {
          const isToday = date === today;
          const pct = total === 0 ? 0 : taken / total;
          const color =
            total === 0
              ? "bg-white/5"
              : pct === 1
                ? "bg-green-500"
                : pct >= 0.5
                  ? "bg-yellow-500"
                  : "bg-red-500/60";

          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <p
                className={`text-sm font-bold uppercase ${isToday ? "text-blue-400" : "text-white/40"}`}
              >
                {format(new Date(date + "T00:00:00"), "EEE").slice(0, 1)}
              </p>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${color} ${isToday ? "ring-2 ring-[#FFFFE4]" : ""}`}
              >
                <span className="text-smfont-bold text-white/80">
                  {total === 0 ? "—" : `${taken}`}
                </span>
              </div>
              <p className="text-white/30 text-sm font-semibold">/{total}</p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs text-white/40 pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> All
          taken
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-yellow-500 inline-block" />{" "}
          Partial
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-500/60 inline-block" />{" "}
          Missed
        </span>
      </div>
    </div>
  );
}
