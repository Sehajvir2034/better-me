import type { ConsistencyDay } from "@/lib/skincare";
import { cn } from "@/lib/utils";

interface Props {
  data: ConsistencyDay[];
}

export function TrendChart({ data }: Props) {
  const maxHeight = 64;

  const first = data[0]?.pct ?? 0;
  const last = data[data.length - 1]?.pct ?? 0;
  const change = last - first;

  return (
    <div className="overflow-hidden rounded-2xl bg-[#1e2235] font-satoshi">
      {/* Header */}
      <div
        className={cn(
          "border-b border-white/6 px-4 py-3.5",
          change !== 0
            ? "flex items-center justify-between gap-3"
            : "flex items-center justify-center",
        )}
      >
        <p className="text-base font-semibold capitalize tracking-wider text-amber-400">
          7-Day Trend
        </p>

        {change !== 0 && (
          <span
            className={cn(
              "whitespace-nowrap text-right text-xs font-bold",
              change > 0 ? "text-emerald-400" : "text-red-400",
            )}
          >
            {change > 0 ? "+" : ""}
            {change}% since Mon
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-end justify-between gap-2">
          {data.map((day, i) => {
            const barH =
              day.pct <= 0
                ? 0
                : Math.max(Math.round((day.pct / 100) * maxHeight), 4);

            return (
              <div
                key={i}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div
                  className="group relative flex w-full items-end justify-center"
                  style={{ height: `${maxHeight + 14}px` }}
                >
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-[#1b1e2b] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">
                    {day.pct}%
                  </div>

                  <div
                    className={`rounded-full transition-all duration-700 ease-in-out ${
                      day.isToday
                        ? "bg-teal-400"
                        : day.pct > 0
                          ? "bg-teal-700/70"
                          : "bg-transparent"
                    }`}
                    style={{
                      width: "8px",
                      height: `${barH}px`,
                      minHeight: day.pct > 0 ? "4px" : "0px",
                    }}
                  />
                </div>

                <span
                  className={`text-sm font-semibold ${
                    day.isToday ? "text-teal-400" : "text-white/30"
                  }`}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
