import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WaterProgress } from "@/components/water/water-progress";
import { QuickLogBar } from "@/components/water/quick-log-bar";
import { WaterEntryList } from "@/components/water/water-entry-list";
import { WaterHistoryChart } from "@/components/water/water-history-chart";
import { WaterStatsRow } from "@/components/water/water-stats-row";
import { WaterGoalEditor } from "@/components/water/water-goal-editor";
import {
  getWaterAllEntries,
  getWaterHistory,
  getWaterGoal,
  getWaterStreak,
} from "@/lib/water";

export default async function WaterPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [entries, history, goal] = await Promise.all([
    getWaterAllEntries(userId),
    getWaterHistory(userId),
    getWaterGoal(userId),
  ]);

  const streak = await getWaterStreak(userId, goal);

  // Today's consumed — filter from all entries
  const todayString = new Date().toISOString().split("T")[0];
  const consumed = entries
    .filter((e) => e.date === todayString)
    .reduce((sum, e) => sum + e.amountMl, 0);

  // 7-day average — last 7 calendar days (Apr 9 to Apr 15), zero for missing days
  const last7Avg = (() => {
    const totalMl = Array.from({ length: 7 }).reduce<number>((sum, _, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = history.find((h) => h.date === dateStr);
      return sum + (entry ? Number(entry.total) : 0);
    }, 0);
    return totalMl / 7; // ← no rounding, keep decimals
  })();
  const avgMl = (() => {
    const total = Array.from({ length: 7 }).reduce<number>((sum, _, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = history.find((h) => h.date === dateStr);
      return sum + (entry ? Number(entry.total) : 0);
    }, 0);
    return total / 7;
  })();

  // Best day — from aggregated history
  const bestMl =
    history.length > 0 ? Math.max(...history.map((d) => Number(d.total))) : 0;

  // Chart needs { date, total } shape — history already provides this
  const chartData = history.map((d) => ({
    date: d.date,
    total: Number(d.total),
  }));

  return (
    <div className="font-satoshi min-h-screen px-4 pb-10 text-[#FFFFE4] space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="pt-6 pb-2 flex items-end justify-between">
        <div>
          <p className="text-white/40 text-sm uppercase tracking-widest">
            Today
          </p>
          <h1 className="text-[#FFFFE4] font-bold text-3xl">Water</h1>
        </div>
      </div>

      {/* Progress */}
      <WaterProgress consumed={consumed} goal={goal} />

      <WaterGoalEditor userId={userId} currentGoal={goal} />

      {/* Quick log */}
      <QuickLogBar userId={userId} />

      {/* Stats */}
      <WaterStatsRow streak={streak} avgMl={avgMl} bestMl={bestMl} />

      {/* Entry list — all entries, has internal date picker */}
      <WaterEntryList entries={entries} userId={userId} />

      {/* Chart — pre-aggregated daily totals */}
      <WaterHistoryChart history={chartData} goal={goal} />
    </div>
  );
}
