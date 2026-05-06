import { db } from "@/lib/db";
import { skincareLogs, skincareProducts } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

function today() {
  return new Date().toISOString().split("T")[0];
}

// ── Types ─────────────────────────────────────────────────────
export type RoutineStep = {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  amPm: string | null;
  sortOrder: number;
  done: boolean;
  completedAt: string | null; // "08:15 AM" format
};

export type ShelfProduct = {
  id: number;
  name: string;
  category: string | null;
  percentRemaining: number | null;
  imageUrl: string | null;
  openedAt: string | null;
  expiresAt: string | null;
};

export type ConsistencyDay = {
  label: string;
  pct: number; // 0-100
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

// ── Queries ───────────────────────────────────────────────────

export async function getRoutineSteps(
  userId: string,
  timeOfDay: "am" | "pm",
): Promise<RoutineStep[]> {
  const [products, logs] = await Promise.all([
    db
      .select({
        id: skincareProducts.id,
        name: skincareProducts.name,
        brand: skincareProducts.brand,
        category: skincareProducts.category,
        amPm: skincareProducts.amPm,
        sortOrder: skincareProducts.sortOrder,
      })
      .from(skincareProducts)
      .where(
        and(
          eq(skincareProducts.userId, userId),
          eq(skincareProducts.active, true),
        ),
      )
      .orderBy(skincareProducts.sortOrder),
    db
      .select({
        productId: skincareLogs.productId,
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
    logs.filter((l) => l.productId).map((l) => [l.productId!, l.completedAt]),
  );

  const filtered = products.filter(
    (p) => !p.amPm || p.amPm === "both" || p.amPm === timeOfDay,
  );

  return filtered.map((p) => ({
    ...p,
    sortOrder: p.sortOrder ?? 0,
    done: doneMap.has(p.id),
    completedAt: doneMap.get(p.id) ?? null,
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
  let cursor = new Date(todayStr + "T12:00:00");

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
  // Get total active products for denominator
  const [totalProducts, logs] = await Promise.all([
    db
      .select({ id: skincareProducts.id })
      .from(skincareProducts)
      .where(
        and(
          eq(skincareProducts.userId, userId),
          eq(skincareProducts.active, true),
        ),
      ),
    db
      .select({ date: skincareLogs.date })
      .from(skincareLogs)
      .where(
        and(
          eq(skincareLogs.userId, userId),
          sql`${skincareLogs.date} >= ${getDateNDaysAgo(6)}`,
        ),
      ),
  ]);

  const total = totalProducts.length || 1;
  const countByDate = new Map<string, number>();
  logs.forEach((l) => {
    countByDate.set(l.date, (countByDate.get(l.date) ?? 0) + 1);
  });

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
    return {
      label: DAY_LABELS[dow === 0 ? 6 : dow - 1],
      pct: Math.min(
        Math.round(((countByDate.get(date) ?? 0) / total) * 100),
        100,
      ),
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
      category: skincareProducts.category,
      percentRemaining: skincareProducts.percentRemaining,
      imageUrl: skincareProducts.imageUrl,
      openedAt: skincareProducts.openedAt,
      expiresAt: skincareProducts.expiresAt,
    })
    .from(skincareProducts)
    .where(
      and(
        eq(skincareProducts.userId, userId),
        eq(skincareProducts.active, true),
      ),
    )
    .orderBy(skincareProducts.sortOrder)
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

  const allIds = new Set([...amSteps, ...pmSteps].map((s) => s.id));
  const doneIds = new Set(
    [...amSteps, ...pmSteps].filter((s) => s.done).map((s) => s.id),
  );

  return {
    amSteps,
    pmSteps,
    totalSteps: allIds.size,
    completedSteps: doneIds.size,
    streakDays,
    shelf,
    consistency,
  };
}
