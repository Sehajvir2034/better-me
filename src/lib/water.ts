"use server";
import { db } from "@/lib/db";
import { waterLogs, waterGoals } from "@/db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function todayString() {
  return new Date().toISOString().split("T")[0]; // "2026-04-15"
}

// ── Queries ──────────────────────────────────────────────

export async function getWaterEntriesToday(userId: string) {
  return db
    .select()
    .from(waterLogs)
    .where(and(eq(waterLogs.userId, userId), eq(waterLogs.date, todayString())))
    .orderBy(desc(waterLogs.loggedAt));
}

export async function getWaterGoal(userId: string): Promise<number> {
  const result = await db
    .select()
    .from(waterGoals)
    .where(eq(waterGoals.userId, userId))
    .limit(1);
  return result[0]?.dailyGoalMl ?? 3000; // fallback 3L
}

export async function getWaterHistory(userId: string) {
  return db
    .select({
      date: sql<string>`${waterLogs.date}`.as("date"),
      total: sql<number>`SUM(${waterLogs.amountMl})`.as("total"),
    })
    .from(waterLogs)
    .where(eq(waterLogs.userId, userId))
    .groupBy(waterLogs.date)
    .orderBy(sql`${waterLogs.date} DESC`);
}
export async function getWaterAllEntries(userId: string) {
  return db
    .select()
    .from(waterLogs)
    .where(eq(waterLogs.userId, userId))
    .orderBy(desc(waterLogs.loggedAt));
}

export async function updateWaterGoal(userId: string, ml: number) {
  const existing = await db
    .select()
    .from(waterGoals)
    .where(eq(waterGoals.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(waterGoals)
      .set({ dailyGoalMl: ml, updatedAt: new Date() })
      .where(eq(waterGoals.userId, userId));
  } else {
    await db.insert(waterGoals).values({
      userId,
      dailyGoalMl: ml,
      updatedAt: new Date(),
    });
  }
  revalidatePath("/water");
  revalidatePath("/dashboard");
}

export async function getWaterStreak(
  userId: string,
  goalMl: number,
): Promise<number> {
  const history = await getWaterHistory(userId);
  let streak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start checking from yesterday — today is still in progress
  for (let i = 1; i <= history.length + 1; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().split("T")[0];

    const entry = history.find((h) => h.date === expectedStr);
    if (entry && Number(entry.total) >= goalMl) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ── Actions ──────────────────────────────────────────────

export async function logWater(userId: string, ml: number, date?: string) {
  const [entry] = await db
    .insert(waterLogs)
    .values({
      userId,
      amountMl: ml,
      date: date ?? todayString(),
      loggedAt: new Date(),
    })
    .returning(); // ← returns the inserted row with id

  revalidatePath("/water");
  revalidatePath("/dashboard");
  return entry; // ← now entry.id exists
}

export async function deleteWaterEntry(id: number) {
  const [entry] = await db
    .delete(waterLogs)
    .where(eq(waterLogs.id, id))
    .returning(); // ← returns deleted row (useful for undo)

  revalidatePath("/water");
  revalidatePath("/dashboard");
  return entry; // ← optional but good to have
}
