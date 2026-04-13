import { db } from "@/lib/db";
import {
  waterLogs,
  waterGoals,
  sleepLogs,
  activityLogs,
  nutritionLogs,
  vitaminLogs,
  vitamins,
  skincareLogs,
  skincareProducts,
  haircareLogs,
  journalEntries,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

function today() {
  return new Date().toISOString().split("T")[0];
}

// ─── WATER ───────────────────────────────────────────────
export async function getTodayWater(userId: string) {
  const [logs, goalRow] = await Promise.all([
    db
      .select({ amountMl: waterLogs.amountMl })
      .from(waterLogs)
      .where(and(eq(waterLogs.userId, userId), eq(waterLogs.date, today()))),
    db
      .select({ dailyGoalMl: waterGoals.dailyGoalMl })
      .from(waterGoals)
      .where(eq(waterGoals.userId, userId))
      .limit(1),
  ]);

  const consumed = logs.reduce((acc, r) => acc + r.amountMl, 0);
  const goal = goalRow[0]?.dailyGoalMl ?? 2500;
  return { consumed, goal };
}

// ─── SLEEP ───────────────────────────────────────────────
export async function getTodaySleep(userId: string) {
  const row = await db
    .select({
      durationMinutes: sleepLogs.durationMinutes,
      quality: sleepLogs.quality,
    })
    .from(sleepLogs)
    .where(and(eq(sleepLogs.userId, userId), eq(sleepLogs.date, today())))
    .limit(1);

  const entry = row[0];
  const hours = entry?.durationMinutes
    ? Math.round((entry.durationMinutes / 60) * 10) / 10
    : null;

  const qualityMap: Record<number, string> = {
    1: "poor",
    2: "poor",
    3: "fair",
    4: "good",
    5: "great",
  };

  return {
    hours,
    quality: entry?.quality ? (qualityMap[entry.quality] ?? null) : null,
  };
}

// ─── ACTIVITY ────────────────────────────────────────────
export async function getTodayActivity(userId: string) {
  const rows = await db
    .select({
      durationMinutes: activityLogs.durationMinutes,
      caloriesBurned: activityLogs.caloriesBurned,
    })
    .from(activityLogs)
    .where(
      and(eq(activityLogs.userId, userId), eq(activityLogs.date, today())),
    );

  return {
    workouts: rows.length,
    totalMinutes: rows.reduce((a, r) => a + (r.durationMinutes ?? 0), 0),
    calories: Math.round(rows.reduce((a, r) => a + (r.caloriesBurned ?? 0), 0)),
  };
}

// ─── NUTRITION ───────────────────────────────────────────
export async function getTodayNutrition(userId: string) {
  const rows = await db
    .select({
      calories: nutritionLogs.calories,
      protein: nutritionLogs.protein,
      carbs: nutritionLogs.carbs,
      fat: nutritionLogs.fat,
    })
    .from(nutritionLogs)
    .where(
      and(eq(nutritionLogs.userId, userId), eq(nutritionLogs.date, today())),
    );

  return {
    calories: Math.round(rows.reduce((a, r) => a + (r.calories ?? 0), 0)),
    calorieGoal: 2000,
    protein: Math.round(rows.reduce((a, r) => a + (r.protein ?? 0), 0)),
    carbs: Math.round(rows.reduce((a, r) => a + (r.carbs ?? 0), 0)),
    fat: Math.round(rows.reduce((a, r) => a + (r.fat ?? 0), 0)),
  };
}

// ─── VITAMINS ────────────────────────────────────────────
export async function getTodayVitamins(userId: string) {
  const [allVitamins, takenToday] = await Promise.all([
    db
      .select({ id: vitamins.id })
      .from(vitamins)
      .where(and(eq(vitamins.userId, userId), eq(vitamins.active, true))),
    db
      .select({ id: vitaminLogs.id })
      .from(vitaminLogs)
      .where(
        and(eq(vitaminLogs.userId, userId), eq(vitaminLogs.date, today())),
      ),
  ]);

  return { taken: takenToday.length, total: allVitamins.length };
}

// ─── SKINCARE ────────────────────────────────────────────
export async function getTodaySkincare(userId: string) {
  const [logs, activeProducts] = await Promise.all([
    db
      .select({ timeOfDay: skincareLogs.timeOfDay })
      .from(skincareLogs)
      .where(
        and(eq(skincareLogs.userId, userId), eq(skincareLogs.date, today())),
      ),
    db
      .select({ id: skincareProducts.id })
      .from(skincareProducts)
      .where(
        and(
          eq(skincareProducts.userId, userId),
          eq(skincareProducts.active, true),
        ),
      ),
  ]);

  return {
    amDone: logs.some((r) => r.timeOfDay === "am"),
    pmDone: logs.some((r) => r.timeOfDay === "pm"),
    stepsCompleted: logs.length,
    totalSteps: activeProducts.length,
  };
}

// ─── HAIRCARE ────────────────────────────────────────────
export async function getTodayHaircare(userId: string) {
  const [lastWash, todayLog] = await Promise.all([
    db
      .select({ date: haircareLogs.date })
      .from(haircareLogs)
      .where(
        and(
          eq(haircareLogs.userId, userId),
          sql`lower(${haircareLogs.activity}) like '%wash%'`,
        ),
      )
      .orderBy(sql`${haircareLogs.date} desc`)
      .limit(1),
    db
      .select({ id: haircareLogs.id })
      .from(haircareLogs)
      .where(
        and(eq(haircareLogs.userId, userId), eq(haircareLogs.date, today())),
      )
      .limit(1),
  ]);

  const lastWashDaysAgo = lastWash[0]
    ? Math.floor((Date.now() - new Date(lastWash[0].date).getTime()) / 86400000)
    : null;

  return { lastWashDaysAgo, routineDone: todayLog.length > 0 };
}

// ─── JOURNAL ─────────────────────────────────────────────
export async function getTodayJournal(userId: string) {
  const row = await db
    .select({ mood: journalEntries.mood, entry: journalEntries.entry })
    .from(journalEntries)
    .where(
      and(eq(journalEntries.userId, userId), eq(journalEntries.date, today())),
    )
    .limit(1);

  const entry = row[0];
  const moodMap: Record<number, string> = {
    1: "awful",
    2: "bad",
    3: "neutral",
    4: "good",
    5: "great",
  };

  return {
    mood: entry?.mood ? (moodMap[entry.mood] ?? null) : null,
    hasEntry: !!entry?.entry,
  };
}
