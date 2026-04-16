// "use client";
// import { useState, useMemo } from "react";
// import {
//   Bar,
//   BarChart,
//   XAxis,
//   YAxis,
//   ReferenceLine,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   type ChartConfig,
// } from "@/components/ui/chart";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { CalendarIcon } from "lucide-react";
// import {
//   format,
//   subDays,
//   startOfWeek,
//   endOfWeek,
//   startOfMonth,
//   endOfMonth,
//   startOfYear,
//   endOfYear,
// } from "date-fns";
// import type { DateRange } from "react-day-picker";

// interface DayData {
//   date: string;
//   total: number;
// }
// interface Props {
//   history: DayData[];
//   goal: number;
// }

// const chartConfig = {
//   total: { label: "Water", color: "#3b82f6" },
// } satisfies ChartConfig;

// type Preset = "7d" | "30d" | "thisMonth" | "thisYear" | "custom";

// const PRESETS: { label: string; value: Preset }[] = [
//   { label: "7D", value: "7d" },
//   { label: "30D", value: "30d" },
//   { label: "Month", value: "thisMonth" },
//   { label: "Year", value: "thisYear" },
//   { label: "Custom", value: "custom" },
// ];

// function getPresetRange(preset: Preset): { from: Date; to: Date } {
//   const today = new Date();
//   switch (preset) {
//     case "7d":
//       return { from: subDays(today, 6), to: today };
//     case "30d":
//       return { from: subDays(today, 29), to: today };
//     case "thisMonth":
//       return { from: startOfMonth(today), to: endOfMonth(today) };
//     case "thisYear":
//       return { from: startOfYear(today), to: endOfYear(today) };
//     default:
//       return { from: subDays(today, 6), to: today };
//   }
// }

// export function WaterHistoryChart({ history, goal }: Props) {
//   const [preset, setPreset] = useState<Preset>("7d");
//   const [customRange, setCustomRange] = useState<DateRange | undefined>();
//   const [calOpen, setCalOpen] = useState(false);

//   const activeRange = useMemo(() => {
//     if (preset === "custom" && customRange?.from) {
//       return { from: customRange.from, to: customRange.to ?? customRange.from };
//     }
//     return getPresetRange(preset);
//   }, [preset, customRange]);

//   const data = useMemo(() => {
//     const sorted = [...history].sort(
//       (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
//     );
//     return sorted
//       .filter((d) => {
//         const date = new Date(d.date);
//         return date >= activeRange.from && date <= activeRange.to;
//       })
//       .map((d) => ({
//         ...d,
//         dateLabel: new Date(d.date).toLocaleDateString("en-IN", {
//           month: "short",
//           day: "numeric",
//         }),
//       }));
//   }, [history, activeRange]);

//   const barSize =
//     data.length <= 7
//       ? 22
//       : Math.max(4, Math.min(16, Math.floor(280 / data.length)));

//   const customLabel =
//     preset === "custom" && customRange?.from
//       ? customRange.to && customRange.to !== customRange.from
//         ? `${format(customRange.from, "dd MMM")} – ${format(customRange.to, "dd MMM")}`
//         : format(customRange.from, "dd MMM yyyy")
//       : "Custom";

//   const needsScroll = data.length > 30;

//   return (
//     <div className="rounded-[1.5rem] bg-[#13151f] border border-white/8 p-4 space-y-4">
//       {/* Header */}
//       {/* <div className="flex items-center justify-between"> */}
//       <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//         <p className="text-white/40 text-[11px] uppercase tracking-widest">
//           History
//         </p>

//         {/* Preset pills */}
//         <div className="flex gap-1 bg-white/5 rounded-xl p-1 flex-wrap">
//           {PRESETS.map((p) =>
//             p.value === "custom" ? (
//               <Popover key="custom" open={calOpen} onOpenChange={setCalOpen}>
//                 <PopoverTrigger asChild>
//                   <button
//                     onClick={() => setPreset("custom")}
//                     className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider transition-all ${
//                       preset === "custom"
//                         ? "bg-blue-500/20 text-blue-400"
//                         : "text-white/30 hover:text-white/50"
//                     }`}
//                   >
//                     <CalendarIcon size={10} />
//                     {customLabel}
//                   </button>
//                 </PopoverTrigger>
//                 <PopoverContent
//                   className="w-auto p-0 bg-[#1a1c2a] border border-white/10 rounded-2xl shadow-xl"
//                   align="end"
//                   collisionPadding={16}
//                 >
//                   <Calendar
//                     mode="range"
//                     selected={customRange}
//                     onSelect={(range) => {
//                       setCustomRange(range);
//                       // Close only when both dates are picked
//                       if (range?.from && range?.to) setCalOpen(false);
//                     }}
//                     numberOfMonths={1}
//                     disabled={{ after: new Date() }}
//                     className="text-white"
//                   />
//                 </PopoverContent>
//               </Popover>
//             ) : (
//               <button
//                 key={p.value}
//                 onClick={() => setPreset(p.value)}
//                 className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider transition-all ${
//                   preset === p.value
//                     ? "bg-blue-500/20 text-blue-400"
//                     : "text-white/30 hover:text-white/50"
//                 }`}
//               >
//                 {p.label}
//               </button>
//             ),
//           )}
//         </div>
//       </div>
//       {/* Empty state */}
//       {data.length === 0 ? (
//         <div className="h-45 flex items-center justify-center text-white/20 text-xs">
//           No data for this period
//         </div>
//       ) : (
//         <ChartContainer config={chartConfig} className="h-40 sm:h-52 w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={data} barSize={barSize} barCategoryGap="30%">
//               <XAxis
//                 dataKey="dateLabel"
//                 tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
//                 axisLine={false}
//                 tickLine={false}
//                 angle={data.length > 10 ? -35 : 0}
//                 textAnchor={data.length > 10 ? "end" : "middle"}
//                 height={data.length > 10 ? 40 : 20}
//                 interval={data.length > 14 ? Math.floor(data.length / 6) : 0}
//               />
//               <YAxis hide domain={[0, Math.max(goal * 1.2, 1000)]} />
//               <ReferenceLine
//                 y={goal}
//                 stroke="rgba(255,255,255,0.15)"
//                 strokeDasharray="4 4"
//               />
//               <ChartTooltip
//                 cursor={{ fill: "rgba(255,255,255,0.04)" }}
//                 content={
//                   <ChartTooltipContent
//                     formatter={(value) => {
//                       const ml = Number(value);
//                       return [
//                         ml >= 1000 ? `${(ml / 1000).toFixed(2)}L` : `${ml}ml`,
//                         "Water",
//                       ];
//                     }}
//                   />
//                 }
//               />
//               <Bar
//                 dataKey="total"
//                 radius={[4, 4, 0, 0]}
//                 shape={(props: {
//                   x?: number;
//                   y?: number;
//                   width?: number;
//                   height?: number;
//                   total?: number;
//                 }) => {
//                   const {
//                     x = 0,
//                     y = 0,
//                     width = 0,
//                     height = 0,
//                     total = 0,
//                   } = props;
//                   return (
//                     <rect
//                       x={x}
//                       y={y}
//                       width={width}
//                       height={height}
//                       fill={total >= goal ? "#3b82f6" : "rgba(59,130,246,0.3)"}
//                       rx={4}
//                       ry={4}
//                     />
//                   );
//                 }}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       )}

//       {/* Legend */}
//       <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/30 px-1">
//         <span className="flex items-center gap-1.5">
//           <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" /> Goal
//           met
//         </span>
//         <span className="flex items-center gap-1.5">
//           <span className="w-2 h-2 rounded-sm bg-blue-500/30 inline-block" />{" "}
//           Below goal
//         </span>
//         <span className="flex items-center gap-1.5">
//           <span className="w-3 border-t border-dashed border-white/20 inline-block" />
//           Goal ({(goal / 1000).toFixed(1)}L)
//         </span>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Brush,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

interface DayData {
  date: string;
  total: number;
}
interface Props {
  history: DayData[];
  goal: number;
}

type Preset = "7d" | "30d" | "thisMonth" | "thisYear" | "custom";

const PRESETS: { label: string; value: Preset }[] = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "Month", value: "thisMonth" },
  { label: "Year", value: "thisYear" },
  { label: "Custom", value: "custom" },
];

function getPresetRange(preset: Preset): { from: Date; to: Date } {
  const today = new Date();
  switch (preset) {
    case "7d":
      return { from: subDays(today, 6), to: today };
    case "30d":
      return { from: subDays(today, 29), to: today };
    case "thisMonth":
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case "thisYear":
      return { from: startOfYear(today), to: endOfYear(today) };
    default:
      return { from: subDays(today, 6), to: today };
  }
}

// How many bars to show at once in the main view
const BARS_PER_VIEW = 20;

export function WaterHistoryChart({ history, goal }: Props) {
  const [preset, setPreset] = useState<Preset>("7d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [calOpen, setCalOpen] = useState(false);

  const activeRange = useMemo(() => {
    if (preset === "custom" && customRange?.from)
      return { from: customRange.from, to: customRange.to ?? customRange.from };
    return getPresetRange(preset);
  }, [preset, customRange]);

  // Full filtered + sorted dataset
  const data = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter((d) => {
        const date = new Date(d.date);
        return date >= activeRange.from && date <= activeRange.to;
      })
      .map((d) => ({
        ...d,
        dateLabel: format(new Date(d.date), "dd MMM"),
      }));
  }, [history, activeRange]);

  const needsBrush = data.length > BARS_PER_VIEW;

  // Brush shows last BARS_PER_VIEW bars by default
  const brushDefault = {
    start: Math.max(0, data.length - BARS_PER_VIEW),
    end: data.length - 1,
  };

  const customLabel =
    preset === "custom" && customRange?.from
      ? customRange.to && customRange.to !== customRange.from
        ? `${format(customRange.from, "dd MMM")} – ${format(customRange.to, "dd MMM")}`
        : format(customRange.from, "dd MMM yyyy")
      : "Custom";

  return (
    <div className="rounded-[1.5rem] bg-[#13151f] border border-white/8 p-4 space-y-4">
      {/* Header + Presets */}
      <div className="flex flex-col gap-2">
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
          History
        </p>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto scrollbar-none">
          {PRESETS.map((p) =>
            p.value === "custom" ? (
              <Popover key="custom" open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => setPreset("custom")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider whitespace-nowrap transition-all ${
                      preset === "custom"
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-white/30 hover:text-white/50"
                    }`}
                  >
                    <CalendarIcon size={10} />
                    {customLabel}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[calc(100vw-2rem)] max-w-sm p-0 bg-[#1a1c2a] border border-white/10 rounded-2xl shadow-xl"
                  align="end"
                  collisionPadding={16}
                >
                  <Calendar
                    mode="range"
                    selected={customRange}
                    onSelect={(range) => {
                      setCustomRange(range);
                      if (range?.from && range?.to) setCalOpen(false);
                    }}
                    numberOfMonths={1}
                    disabled={{ after: new Date() }}
                    className="text-white p-3"
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-wider whitespace-nowrap transition-all ${
                  preset === p.value
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                {p.label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-white/20 text-xs">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={needsBrush ? 260 : 200}>
          <BarChart
            data={data}
            barSize={needsBrush ? 12 : 18}
            barCategoryGap="30%"
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, Math.max(goal * 1.2, 1000)]} />
            <ReferenceLine
              y={goal}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="4 4"
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#1a1c2a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                fontSize: 12,
                fontFamily: "Satoshi",
                fontWeight: "500",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.5)" }}
              itemStyle={{
                color: "rgba(255,255,255,0.9)",
              }}
              formatter={(value) => {
                const ml = typeof value === "number" ? value : 0;
                return [
                  ml >= 1000 ? `${(ml / 1000).toFixed(2)}L` : `${ml}ml`,
                  "Water",
                ];
              }}
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
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={total >= goal ? "#3b82f6" : "rgba(59,130,246,0.3)"}
                    rx={4}
                    ry={4}
                  />
                );
              }}
            />

            {/* Brush only appears for large datasets */}
            {needsBrush && (
              <Brush
                dataKey="dateLabel"
                height={28}
                stroke="rgba(255,255,255,0.08)"
                fill="#0d0f1a"
                travellerWidth={8}
                startIndex={brushDefault.start}
                endIndex={brushDefault.end}
                tickFormatter={() => ""} // hide brush labels, too cramped
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Info text for brush */}
      {needsBrush && (
        <p className="text-white/20 text-[10px] text-center -mt-2">
          Drag the handles below the chart to scroll
        </p>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-semibold text-white/30 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" /> Goal
          met
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-blue-500/30 inline-block" />{" "}
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
