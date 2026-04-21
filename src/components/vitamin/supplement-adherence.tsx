interface AdherenceData {
  supplement: { name: string; color: string | null };
  adherence: number;
}

interface Props {
  data: AdherenceData[];
}

export function SupplementAdherence({ data }: Props) {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => a.adherence - b.adherence);

  return (
    <div className="rounded-[1.5rem] bg-[#13151f] border border-white/8 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm font-bold uppercase tracking-wider">
          30-Day Adherence
        </p>
      </div>
      <div className="space-y-3">
        {sorted.map(({ supplement, adherence }) => (
          <div key={supplement.name} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: supplement.color ?? "#3b82f6" }}
                />
                <p className="text-white/70 text-sm font-semibold">
                  {supplement.name}
                </p>
              </div>
              <p
                className={`text-xs font-bold ${
                  adherence >= 80
                    ? "text-green-400"
                    : adherence >= 50
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {adherence}%
              </p>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${adherence}%`,
                  background:
                    adherence >= 80
                      ? "#22c55e"
                      : adherence >= 50
                        ? "#eab308"
                        : "#ef4444",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
