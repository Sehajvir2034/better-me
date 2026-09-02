import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { format, subDays } from "date-fns";
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

function localDateString(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

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

  const todayStr = localDateString();

  const consumed = entries
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amountMl, 0);

  const avgMl =
    Array.from({ length: 7 }).reduce<number>((sum, _, i) => {
      const dateStr = localDateString(subDays(new Date(), i));
      const entry = history.find((h) => h.date === dateStr);
      return sum + (entry ? Number(entry.total) : 0);
    }, 0) / 7;

  const bestMl =
    history.length > 0 ? Math.max(...history.map((d) => Number(d.total))) : 0;

  const chartData = history.map((d) => ({
    date: d.date,
    total: Number(d.total),
  }));

  return (
    <div className="mx-auto min-h-screen max-w-lg space-y-4 px-4 pb-10 font-satoshi text-[#FFFFE4]">
      <div className="flex items-end justify-between pt-6 pb-2">
        <div>
          <p className="text-sm uppercase tracking-widest text-white/40">
            Today
          </p>
          <h1 className="text-3xl font-bold text-[#FFFFE4]">Water</h1>
        </div>
      </div>

      <WaterProgress consumed={consumed} goal={goal} />

      <WaterGoalEditor userId={userId} currentGoal={goal} />

      <QuickLogBar userId={userId} />

      <WaterStatsRow streak={streak} avgMl={avgMl} bestMl={bestMl} />

      <WaterEntryList entries={entries} userId={userId} />

      <WaterHistoryChart history={chartData} goal={goal} />
    </div>
  );
}
