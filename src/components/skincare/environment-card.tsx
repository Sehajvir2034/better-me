import { Droplet, Sun, Wind } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

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
    <div className="overflow-hidden rounded-2xl bg-[#1e2235] font-satoshi">
      {/* Header */}
      <div className="flex justify-center border-b border-white/6 px-4 py-3.5">
        <div className="flex items-center">
          <p className="text-base font-semibold capitalize tracking-wider text-amber-400">
            Environmental Factors
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {/* UV Index */}
          <div className="flex flex-col items-center gap-1.5">
            <Sun
              size={36}
              color="#f1a31e"
              strokeWidth={2.5}
              absoluteStrokeWidth
            />
            <span className="text-3xl font-bold font-satoshi text-[#FFFFE4]">
              <NumberTicker
                className="text-[#FFFFE4]"
                value={env.uvIndex}
                decimalPlaces={0}
              />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/30">
              UV Index
            </span>
            <span className={`text-sm font-semibold ${uv.color}`}>
              {uv.label}
            </span>
          </div>

          {/* Humidity */}
          <div className="flex flex-col items-center gap-1.5">
            <Droplet
              size={36}
              color="#20b0ee"
              strokeWidth={2.5}
              absoluteStrokeWidth
            />
            <span className="text-3xl font-bold font-satoshi text-[#FFFFE4]">
              <NumberTicker
                className="text-[#FFFFE4]"
                value={env.humidity}
                decimalPlaces={0}
              />
              %
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/30">
              Humidity
            </span>
            <span className="text-sm font-bold text-blue-400">
              {env.humidity < 30
                ? "Low"
                : env.humidity < 60
                  ? "Balanced"
                  : "High"}
            </span>
          </div>

          {/* AQI */}
          <div className="flex flex-col items-center gap-1.5">
            <Wind
              size={36}
              color="#20eebb"
              strokeWidth={2.5}
              absoluteStrokeWidth
            />
            <span className="text-3xl font-bold font-satoshi text-[#FFFFE4]">
              <NumberTicker
                className="text-[#FFFFE4]"
                value={env.aqi}
                decimalPlaces={0}
              />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/30">
              AQI
            </span>
            <span className={`text-sm font-semibold ${aqi.color}`}>
              {aqi.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
