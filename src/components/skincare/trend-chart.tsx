import type { ConsistencyDay } from "@/lib/skincare";

interface Props {
  data: ConsistencyDay[];
}

export function TrendChart({ data }: Props) {
  const maxPct = Math.max(...data.map((d) => d.pct), 1);
  const maxHeight = 64; // px

  // Calculate change vs first day
  const first = data[0]?.pct ?? 0;
  const last = data[data.length - 1]?.pct ?? 0;
  const change = last - first;

  return (
    <div className="rounded-2xl bg-[#13151f] border border-white/8 p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
          7-Day Trend
        </p>
        {change !== 0 && (
          <span
            className={`text-xs font-bold ${change > 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {change > 0 ? "+" : ""}
            {change}% since Mon
          </span>
        )}
      </div>

      {/* Chart */}
      <div
        className="flex items-end justify-between gap-1.5"
        style={{ height: `${maxHeight + 20}px` }}
      >
        {data.map((day, i) => {
          const barH = Math.max(
            Math.round((day.pct / maxPct) * maxHeight),
            day.pct > 0 ? 4 : 0,
          );
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1.5 justify-end"
              style={{ height: `${maxHeight + 16}px` }}
            >
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${
                  day.isToday
                    ? "bg-teal-400"
                    : day.pct > 0
                      ? "bg-teal-700/60"
                      : "bg-white/5"
                }`}
                style={{
                  height: `${barH}px`,
                  minHeight: day.pct > 0 ? "4px" : "0px",
                }}
              />
              <span
                className={`text-[10px] font-semibold ${day.isToday ? "text-teal-400" : "text-white/30"}`}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <div className="flex justify-end mt-3">
        <button className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 hover:bg-teal-500/30 transition-all">
          <span className="text-lg leading-none">+</span>
        </button>
      </div>
    </div>
  );
}
