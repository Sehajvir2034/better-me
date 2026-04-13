"use client";
import Link from "next/link";
import { Moon } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

interface Props {
  data: { hours: number | null; quality: string | null };
}

const qualityConfig: Record<
  string,
  { label: string; color: string; statusColor: string }
> = {
  poor: { label: "POOR", color: "text-red-400", statusColor: "text-red-400" },
  fair: {
    label: "FAIR",
    color: "text-orange-400",
    statusColor: "text-orange-400",
  },
  good: { label: "GOOD", color: "text-blue-400", statusColor: "text-blue-400" },
  great: {
    label: "GREAT",
    color: "text-emerald-400",
    statusColor: "text-emerald-400",
  },
};

export function SleepCard({ data }: Props) {
  const quality = data.quality ? qualityConfig[data.quality] : null;
  const status = quality?.label ?? "NO LOG";
  const statusColor = quality?.statusColor ?? "text-white/30";

  // Convert hours to segments out of 8 (target)
  const segments = 8;
  const filledSegments = data.hours
    ? Math.min(Math.round((data.hours / 8) * segments), segments)
    : 0;

  return (
    <Link href="/sleep">
      <div className="shrink-0 w-60 h-60 group relative rounded-[2rem] bg-[#13151f] border border-white/8 p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-linear-to-br from-purple-600/8 to-transparent pointer-events-none" />

        {/* Top row — icon + status */}
        <div className="relative flex justify-between items-start p-0.5">
          <div className="p-3 rounded-full bg-purple-500/15 flex items-center justify-center">
            <Moon size={26} className="text-purple-400" />
          </div>
          <span className={`text-sm font-bold tracking-widest ${statusColor}`}>
            {status}
          </span>
        </div>

        {/* Bottom — metric */}
        <div className="relative p-0.5">
          <p className="text-white/40 text-[12px] uppercase tracking-widest mb-1">
            Sleep
          </p>
          <div className="flex items-end gap-1 mb-4">
            {data.hours ? (
              <>
                <span className="text-3xl font-black text-[#FFFFE4] leading-none">
                  <NumberTicker
                    className="text-[#FFFFE4]"
                    value={data.hours}
                    decimalPlaces={1}
                  />
                </span>
                <span className="text-white/30 text-sm tracking-widest mb-0.5">
                  / 8h
                </span>
              </>
            ) : (
              <span className="text-3xl font-black text-white/20 leading-none">
                —
              </span>
            )}
          </div>

          {/* Progress segments */}
          <div className="relative flex gap-1">
            {Array.from({ length: segments }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < filledSegments ? "bg-purple-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
