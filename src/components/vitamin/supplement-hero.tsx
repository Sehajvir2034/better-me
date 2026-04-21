import { NumberTicker } from "../ui/number-ticker";

interface Props {
  total: number;
  taken: number;
  streak: number;
  date: string;
}

export function SupplementHero({ total, taken, streak, date }: Props) {
  const pct = total === 0 ? 0 : Math.round((taken / total) * 100);
  const formatted = new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="rounded-[1.5rem] bg-[#13151f] border border-white/8 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
            Today&apos;s Stack
          </p>
          <p className="text-white/60 text-[14px] font-semibold mt-0.5">
            {formatted}
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5">
            <span className="text-base">🔥</span>
            <span className="text-orange-400 font-bold text-sm">{streak}d</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-[#FFFFE4] text-3xl font-bold">
            <NumberTicker
              className="text-[#FFFFE4]"
              value={taken}
              decimalPlaces={0}
            />
            <span className="text-white/30 text-xl font-semibold">
              {" "}
              / {total} taken
            </span>
          </p>
          <p
            className={`text-sm font-satoshi font-semibold ${pct === 100 ? "text-green-400" : pct >= 50 ? "text-yellow-400" : "text-white/40"}`}
          >
            {pct}%
          </p>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background:
                pct === 100
                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                  : "linear-gradient(90deg, #3b82f6, #6366f1)",
            }}
          />
        </div>
      </div>

      {total === 0 && (
        <p className="text-white/40 text-sm font-semibold text-center pb-1">
          Add your first supplement below ↓
        </p>
      )}
    </div>
  );
}
