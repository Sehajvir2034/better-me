"use client";
import { useState } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface DayData {
  date: string;
  total: number;
}

interface Props {
  history: DayData[];
  goal: number;
}

const chartConfig = {
  total: {
    label: "Water",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function WaterHistoryChart({ history, goal }: Props) {
  const [view, setView] = useState<"7d" | "30d" | "all">("7d");

  const sliced =
    view === "7d"
      ? history.slice(0, 7).reverse()
      : view === "30d"
        ? history.slice(0, 30).reverse()
        : [...history].reverse();

  // Annotate each day so tooltip can show goal status
  const data = sliced.map((d) => ({
    ...d,
    dateLabel: formatDate(d.date),
    metGoal: d.total >= goal,
  }));

  return (
    <div className="rounded-[1.5rem] bg-[#13151f] border border-white/8 p-4 space-y-4">
      {/* Header + toggle */}
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-[11px] uppercase tracking-widest">
          History
        </p>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(["7d", "30d", "all"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider transition-all ${
                view === v
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              {v === "all" ? "ALL" : v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-45 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={view === "all" ? 4 : 20}>
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={view === "all" ? Math.floor(data.length / 6) : 0}
            />
            <YAxis hide domain={[0, Math.max(goal * 1.2, 1000)]} />
            <ReferenceLine
              y={goal}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="4 4"
            />
            <ChartTooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    const ml = Number(value);
                    return [
                      ml >= 1000 ? `${(ml / 1000).toFixed(2)}L` : `${ml}ml`,
                      "Water",
                    ];
                  }}
                />
              }
            />
            <Bar
              dataKey="total"
              radius={[4, 4, 0, 0]}
              shape={(props: {
                x?: number;
                y?: number;
                width?: number;
                height?: number;
                total?: number;
              }) => {
                const {
                  x = 0,
                  y = 0,
                  width = 0,
                  height = 0,
                  total = 0,
                } = props;
                const color =
                  total >= goal ? "#3b82f6" : "rgba(59,130,246,0.3)";
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={color}
                    rx={4}
                    ry={4}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] text-white/30 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />
          Goal met
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-blue-500/30 inline-block" />
          Below goal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 border-t border-dashed border-white/20 inline-block" />
          Goal ({(goal / 1000).toFixed(1)}L)
        </span>
      </div>
    </div>
  );
}
