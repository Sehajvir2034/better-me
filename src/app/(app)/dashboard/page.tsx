import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WaterCard } from "@/components/dashboard/water-card";
import { SleepCard } from "@/components/dashboard/sleep-card";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { NutritionCard } from "@/components/dashboard/nutrition-card";
import { VitaminsCard } from "@/components/dashboard/vitamins-card";
import { SkincareCard } from "@/components/dashboard/skincare-card";
import { HaircareCard } from "@/components/dashboard/haircare-card";
import {
  VitalityGaps,
  type VitalityGap,
} from "@/components/dashboard/vitality-gaps";
import {
  StreaksPanel,
  type StreakData,
} from "@/components/dashboard/streaks-panel";

import { HeroSection } from "@/components/dashboard/hero-section";
import { RoutinePanel } from "@/components/dashboard/routine-panel";
import { getRoutineItems, toggleRoutineItem } from "@/lib/routine";
import { format } from "date-fns";
import {
  getTodayWater,
  getTodaySleep,
  getTodayActivity,
  getTodayNutrition,
  getTodayVitamins,
  getTodaySkincare,
  getTodayHaircare,
  getTodayJournal,
} from "@/lib/dashboard";
import {
  calcVitalityScore,
  scoreWater,
  scoreNutrition,
  scoreSleep,
  scoreVitamins,
  scoreMindset,
  scoreRitual,
  getYearProgress,
} from "@/lib/vitality";
// dashboard/page.tsx
// --- Gaps (compute from your fetched data) ---
const gaps: VitalityGap[] = [
  {
    pillar: "Water",
    icon: "💧",
    // deficit: `${(water.goal - water.consumed).toFixed(1)}L behind`,
    deficit: "1.2L behind",
    action: "Drink 2 glasses now",
    scoreBoost: 4,
    href: "/water",
    color: "blue",
  },
  {
    pillar: "Sleep",
    icon: "😴",
    deficit: "1.5h short of goal",
    action: "Aim for 10:30 PM bedtime",
    scoreBoost: 6,
    href: "/sleep",
    color: "indigo",
  },
].filter(Boolean) as VitalityGap[];
// --- Streaks (hardcoded for now, replace with DB query later) ---
const streaks: StreakData[] = [
  {
    pillar: "Water",
    icon: "💧",
    currentStreak: 12,
    bestStreak: 12,
    status: "perfect",
  },
  {
    pillar: "Nutrition",
    icon: "🥗",
    currentStreak: 3,
    bestStreak: 7,
    status: "perfect",
  },
  {
    pillar: "Minoxidil",
    icon: "💊",
    currentStreak: 1,
    bestStreak: 5,
    status: "at-risk",
  },
  {
    pillar: "Sleep",
    icon: "😴",
    currentStreak: 0,
    bestStreak: 9,
    status: "broken",
  },
];

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const today = format(new Date(), "yyyy-MM-dd");

  const [
    water,
    sleep,
    activity,
    nutrition,
    vitamins,
    skincare,
    haircare,
    journal,
    routineItems,
  ] = await Promise.all([
    getTodayWater(userId),
    getTodaySleep(userId),
    getTodayActivity(userId),
    getTodayNutrition(userId),
    getTodayVitamins(userId),
    getTodaySkincare(userId),
    getTodayHaircare(userId),
    getTodayJournal(userId),
    getRoutineItems(userId, today), // ← ADD
  ]);

  // ✅ Score calculation is now INSIDE the function, after data is fetched
  const overallScore = calcVitalityScore({
    sleep: scoreSleep(sleep.hours, null),
    nutrition: scoreNutrition(
      nutrition.calories,
      nutrition.calorieGoal,
      nutrition.protein,
    ),
    water: scoreWater(water.consumed, water.goal),
    activity: Math.min(activity.totalMinutes / 45, 1),
    vitamins: scoreVitamins(vitamins.taken, vitamins.total),
    mindset: scoreMindset(journal.hasEntry),
    skincare: scoreRitual(skincare.amDone && skincare.pmDone),
    haircare: scoreRitual(haircare.routineDone),
  });

  const yearProgress = getYearProgress();

  return (
    <div className="font-satoshi min-h-screen px-4 text-white space-y-4">
      <HeroSection score={overallScore} yearProgress={yearProgress} />
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
        <WaterCard data={water} />
        <SleepCard data={sleep} />
        <NutritionCard data={nutrition} />
        <ActivityCard data={activity} />
        <VitaminsCard data={vitamins} />
        <SkincareCard data={skincare} />
        <HaircareCard data={haircare} />
      </div>
      <RoutinePanel
        items={routineItems}
        userId={userId}
        today={today}
        onToggle={toggleRoutineItem}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VitalityGaps gaps={gaps} />
        <StreaksPanel streaks={streaks} />
      </div>
    </div>
  );
}
