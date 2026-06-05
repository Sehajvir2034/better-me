import { db } from "@/lib/db";
import {
  skincareLogs,
  skincareProducts,
  skincareRitualSteps,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

function today() {
  return new Date().toISOString().split("T")[0];
}

export type RoutineStep = {
  id: number; // ritual step id
  productId: number;
  name: string;
  brand: string | null;
  category: string | null;
  amPm: "am" | "pm";
  sortOrder: number;
  done: boolean;
  completedAt: string | null;
};

export type ShelfProduct = {
  id: number;
  name: string;
  brand?: string | null;
  category: string | null;
  percentRemaining: number | null;
  imageUrl: string | null;
  openedAt: string | null;
  expiresAt: string | null;
  createdAt: Date | null;
};

export type ConsistencyDay = {
  label: string;
  pct: number;
  isToday: boolean;
};

export type SkincarePageData = {
  amSteps: RoutineStep[];
  pmSteps: RoutineStep[];
  totalSteps: number;
  completedSteps: number;
  streakDays: number;
  shelf: ShelfProduct[];
  consistency: ConsistencyDay[];
};

export async function getRoutineSteps(
  userId: string,
  timeOfDay: "am" | "pm",
): Promise<RoutineStep[]> {
  const [steps, logs] = await Promise.all([
    db
      .select({
        id: skincareRitualSteps.id,
        productId: skincareProducts.id,
        name: skincareProducts.name,
        brand: skincareProducts.brand,
        category: skincareProducts.category,
        amPm: skincareRitualSteps.timeOfDay,
        sortOrder: skincareRitualSteps.sortOrder,
      })
      .from(skincareRitualSteps)
      .innerJoin(
        skincareProducts,
        eq(skincareRitualSteps.productId, skincareProducts.id),
      )
      .where(
        and(
          eq(skincareRitualSteps.userId, userId),
          eq(skincareRitualSteps.timeOfDay, timeOfDay),
          eq(skincareRitualSteps.active, true),
          eq(skincareProducts.active, true),
        ),
      )
      .orderBy(skincareRitualSteps.sortOrder),
    db
      .select({
        ritualStepId: skincareLogs.ritualStepId,
        completedAt: skincareLogs.completedAt,
      })
      .from(skincareLogs)
      .where(
        and(
          eq(skincareLogs.userId, userId),
          eq(skincareLogs.date, today()),
          eq(skincareLogs.timeOfDay, timeOfDay),
        ),
      ),
  ]);

  const doneMap = new Map(
    logs
      .filter((l) => l.ritualStepId)
      .map((l) => [l.ritualStepId!, l.completedAt]),
  );

  return steps.map((step) => ({
    ...step,
    amPm: step.amPm === "pm" ? "pm" : "am",
    sortOrder: step.sortOrder ?? 0,
    done: doneMap.has(step.id),
    completedAt: doneMap.get(step.id) ?? null,
  }));
}

export async function getStreakDays(userId: string): Promise<number> {
  const logs = await db
    .selectDistinct({ date: skincareLogs.date })
    .from(skincareLogs)
    .where(eq(skincareLogs.userId, userId))
    .orderBy(desc(skincareLogs.date))
    .limit(60);

  const dates = new Set(logs.map((l) => l.date));
  const todayStr = today();
  let streak = 0;
  const cursor = new Date(todayStr + "T12:00:00");

  while (true) {
    const ds = cursor.toISOString().split("T")[0];
    if (dates.has(ds)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function getConsistencyData(
  userId: string,
): Promise<ConsistencyDay[]> {
  const [totalSteps, logs] = await Promise.all([
    db
      .select({ id: skincareRitualSteps.id })
      .from(skincareRitualSteps)
      .innerJoin(
        skincareProducts,
        eq(skincareRitualSteps.productId, skincareProducts.id),
      )
      .where(
        and(
          eq(skincareRitualSteps.userId, userId),
          eq(skincareRitualSteps.active, true),
          eq(skincareProducts.active, true),
        ),
      ),
    db
      .select({
        date: skincareLogs.date,
        productId: skincareLogs.productId,
        timeOfDay: skincareLogs.timeOfDay,
      })
      .from(skincareLogs)
      .where(
        and(
          eq(skincareLogs.userId, userId),
          sql`${skincareLogs.date} >= ${getDateNDaysAgo(6)}`,
        ),
      ),
  ]);

  const total = totalSteps.length || 1;
  const completedByDate = new Map<string, Set<string>>();

  for (const log of logs) {
    if (!log.productId || !log.timeOfDay) continue;

    if (!completedByDate.has(log.date)) {
      completedByDate.set(log.date, new Set<string>());
    }

    completedByDate.get(log.date)!.add(`${log.productId}-${log.timeOfDay}`);
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const todayStr = today();
  const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

  return days.map((date) => {
    const d = new Date(date + "T12:00:00");
    const dow = d.getDay();
    const completedCount = completedByDate.get(date)?.size ?? 0;

    return {
      label: DAY_LABELS[dow === 0 ? 6 : dow - 1],
      pct: Math.round((completedCount / total) * 100),
      isToday: date === todayStr,
    };
  });
}

function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export async function getShelfProducts(
  userId: string,
): Promise<ShelfProduct[]> {
  return db
    .select({
      id: skincareProducts.id,
      name: skincareProducts.name,
      brand: skincareProducts.brand,
      category: skincareProducts.category,
      percentRemaining: skincareProducts.percentRemaining,
      imageUrl: skincareProducts.imageUrl,
      openedAt: skincareProducts.openedAt,
      expiresAt: skincareProducts.expiresAt,
      createdAt: skincareProducts.createdAt,
    })
    .from(skincareProducts)
    .where(
      and(
        eq(skincareProducts.userId, userId),
        eq(skincareProducts.active, true),
        eq(skincareProducts.onShelf, true),
      ),
    )
    .orderBy(desc(skincareProducts.createdAt))
    .limit(6);
}

export async function getSkincarePageData(
  userId: string,
): Promise<SkincarePageData> {
  const [amSteps, pmSteps, streakDays, shelf, consistency] = await Promise.all([
    getRoutineSteps(userId, "am"),
    getRoutineSteps(userId, "pm"),
    getStreakDays(userId),
    getShelfProducts(userId),
    getConsistencyData(userId),
  ]);

  const allSteps = [...amSteps, ...pmSteps];
  const doneSteps = allSteps.filter((s) => s.done);

  return {
    amSteps,
    pmSteps,
    totalSteps: allSteps.length,
    completedSteps: doneSteps.length,
    streakDays,
    shelf,
    consistency,
  };
}
