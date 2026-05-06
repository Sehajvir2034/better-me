interface Props {
  env: { uvIndex: number; humidity: number; aqi: number };
}

function getUvLabel(uv: number) {
  if (uv <= 2) return { label: "Low", color: "text-emerald-400" };
  if (uv <= 5) return { label: "Moderate", color: "text-yellow-400" };
  if (uv <= 7) return { label: "High", color: "text-orange-400" };
  return { label: "Very High", color: "text-red-400" };
}

function getAqiLabel(aqi: number) {
  if (aqi <= 20) return { label: "Good", color: "text-emerald-400" };
  if (aqi <= 40) return { label: "Fair", color: "text-yellow-400" };
  if (aqi <= 60) return { label: "Moderate", color: "text-orange-400" };
  return { label: "Poor", color: "text-red-400" };
}

export function EnvironmentCard({ env }: Props) {
  const uv = getUvLabel(env.uvIndex);
  const aqi = getAqiLabel(env.aqi);

  return (
    <div className="rounded-2xl bg-[#13151f] border border-white/8 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 mb-4">
        Environmental Factors
      </p>
      <div className="grid grid-cols-3 gap-2">
        {/* UV Index */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-2xl">☀️</span>
          <span className={`text-2xl font-black font-satoshi text-[#FFFFE4]`}>
            {env.uvIndex}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/30">
            UV Index
          </span>
          <span className={`text-xs font-bold ${uv.color}`}>{uv.label}</span>
        </div>
        {/* Humidity */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-2xl">💧</span>
          <span className="text-2xl font-black font-satoshi text-[#FFFFE4]">
            {env.humidity}%
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/30">
            Humidity
          </span>
          <span className="text-xs font-bold text-blue-400">
            {env.humidity < 30
              ? "Low"
              : env.humidity < 60
                ? "Balanced"
                : "High"}
          </span>
        </div>
        {/* AQI */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-2xl">🌬️</span>
          <span className="text-2xl font-black font-satoshi text-[#FFFFE4]">
            {env.aqi}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/30">
            AQI
          </span>
          <span className={`text-xs font-bold ${aqi.color}`}>{aqi.label}</span>
        </div>
      </div>
    </div>
  );
}
