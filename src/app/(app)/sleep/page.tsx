import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { subDays } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { getSleepPageData } from "@/lib/sleep-db";
import { SleepHero } from "@/components/sleep/sleep-hero";
import { SleepTrendCard } from "@/components/sleep/sleep-trend-card";
import { SleepTonightCard } from "@/components/sleep/sleep-tonight-card";
import { SleepStatsCard } from "@/components/sleep/sleep-stats-card";
import { SleepFactorsCard } from "@/components/sleep/sleep-factors-card";
import { SleepHistoryCard } from "@/components/sleep/sleep-history-card";
import { SleepInsightsCard } from "@/components/sleep/sleep-insights-card";

export default async function SleepPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;
  const userName = session.user.name?.split(" ")[0] ?? "there";
  const timeZone = "Asia/Kolkata";

  const maxSleepDate = formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd");

  // Build “yesterday” from the India-local calendar day, not from server-local time.
  const indiaTodayAtNoon = fromZonedTime(`${maxSleepDate}T12:00:00`, timeZone);

  const defaultSleepDate = formatInTimeZone(
    subDays(indiaTodayAtNoon, 1),
    timeZone,
    "yyyy-MM-dd",
  );

  const data = await getSleepPageData(userId);

  return (
    <div className="space-y-4 pb-8">
      <SleepHero
        userName={userName}
        overview={data.overview}
        latestLog={data.latestLog}
        settings={data.settings}
        defaultSleepDate={defaultSleepDate}
        maxSleepDate={maxSleepDate}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <SleepTrendCard logs={data.logs} overview={data.overview} />

          <SleepHistoryCard logs={data.logs} settings={data.settings} />

          <SleepInsightsCard
            latestLog={data.latestLog}
            overview={data.overview}
            logs={data.logs}
            naps={data.naps}
            settings={data.settings}
          />
        </div>

        <div className="flex flex-col gap-4">
          <SleepTonightCard overview={data.overview} settings={data.settings} />

          <SleepStatsCard overview={data.overview} naps={data.naps} />

          <SleepFactorsCard latestLog={data.latestLog} />
        </div>
      </div>

      {/* <SleepInsightsCard
        latestLog={data.latestLog}
        overview={data.overview}
        logs={data.logs}
        naps={data.naps}
        settings={data.settings}
      /> */}
    </div>
  );
}
