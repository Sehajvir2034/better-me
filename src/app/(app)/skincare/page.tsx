import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSkincarePageData } from "@/lib/skincare";
import { getConflictAlerts } from "@/lib/skincare-ingredients";
import { SkincareHero } from "@/components/skincare/skincare-hero";
import { DailyRitual } from "@/components/skincare/daily-ritual";
import { ConflictAlerts } from "@/components/skincare/conflict-alerts";
import { EnvironmentCard } from "@/components/skincare/environment-card";
import { TrendChart } from "@/components/skincare/trend-chart";
import { ProductShelf } from "@/components/skincare/product-shelf";

// Fetch env data from Open-Meteo (free, no key needed)
async function getEnvironmentData() {
  try {
    const [weather, air] = await Promise.all([
      fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=30.9&longitude=75.85&current=relative_humidity_2m,uv_index&forecast_days=1",
        { next: { revalidate: 1800 } },
      ).then((r) => r.json()),
      fetch(
        "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=30.9&longitude=75.85&current=european_aqi",
        { next: { revalidate: 1800 } },
      ).then((r) => r.json()),
    ]);
    return {
      uvIndex: Math.round(weather?.current?.uv_index ?? 0),
      humidity: Math.round(weather?.current?.relative_humidity_2m ?? 50),
      aqi: Math.round(air?.current?.european_aqi ?? 0),
    };
  } catch {
    return { uvIndex: 0, humidity: 50, aqi: 0 };
  }
}

export default async function SkincarePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userId = session.user.id;
  const userName = session.user.name?.split(" ")[0] ?? "there";

  const [data, env] = await Promise.all([
    getSkincarePageData(userId),
    getEnvironmentData(),
  ]);

  const allProductNames = [...data.amSteps, ...data.pmSteps].map((s) => s.name);
  const conflicts = getConflictAlerts(allProductNames);

  return (
    <div className="space-y-4 pb-8">
      {/* Hero */}
      <SkincareHero
        completedSteps={data.completedSteps}
        totalSteps={data.totalSteps}
        streakDays={data.streakDays}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Left — Ritual */}
        <DailyRitual
          amSteps={data.amSteps}
          pmSteps={data.pmSteps}
          userId={userId}
        />

        {/* Right — Analytics */}
        <div className="flex flex-col gap-4">
          <ConflictAlerts conflicts={conflicts} />
          <EnvironmentCard env={env} />
          <TrendChart data={data.consistency} />
        </div>
      </div>

      {/* Product Shelf */}
      <ProductShelf products={data.shelf} />
    </div>
  );
}
