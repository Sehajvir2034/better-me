"use server";
import { db } from "@/lib/db";
import { vitamins, vitaminLogs } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assignColor } from "@/lib/supplements-knowledge";

function todayString() {
  return new Date().toISOString().split("T")[0];
}

// ── Types ─────────────────────────────────────────────────

export type NewVitamin = {
  name: string;
  dosage?: string;
  unit?: string;
  category?: string;
  color?: string;
  frequency: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  reminderTime?: string;
  withFood: boolean;
  notes?: string;
};

export interface Supplement {
  id: number;
  name: string;
  dosage: string | null;
  unit: string | null;
  color: string | null;
  timeOfDay: string;
  reminderTime: string | null;
  withFood: boolean | null;
  frequency: string;
  notes: string | null;
}

// ── Queries ───────────────────────────────────────────────

export async function getSupplements(userId: string) {
  return db
    .select()
    .from(vitamins)
    .where(and(eq(vitamins.userId, userId), eq(vitamins.active, true)))
    .orderBy(
      sql`CASE "time_of_day"
        WHEN 'morning'   THEN 1
        WHEN 'afternoon' THEN 2
        WHEN 'evening'   THEN 3
        WHEN 'night'     THEN 4
        ELSE 5
      END`,
      vitamins.createdAt,
    );
}

export async function getSupplementLogs(userId: string, date: string) {
  return db
    .select({
      log: vitaminLogs,
      supplement: vitamins,
    })
    .from(vitaminLogs)
    .innerJoin(vitamins, eq(vitaminLogs.vitaminId, vitamins.id))
    .where(and(eq(vitaminLogs.userId, userId), eq(vitaminLogs.date, date)));
}

export async function getSupplementLogsRange(
  userId: string,
  from: string,
  to: string,
) {
  return db
    .select()
    .from(vitaminLogs)
    .where(
      and(
        eq(vitaminLogs.userId, userId),
        sql`${vitaminLogs.date} >= ${from}`,
        sql`${vitaminLogs.date} <= ${to}`,
      ),
    );
}

// 30-day adherence % per supplement
export async function getAdherence(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const from = thirtyDaysAgo.toISOString().split("T")[0];
  const to = todayString();

  const supplements = await getSupplements(userId);
  const logs = await getSupplementLogsRange(userId, from, to);

  return supplements.map((s) => {
    const createdDate = s.createdAt?.toISOString().split("T")[0] ?? from;
    const suppLogs = logs.filter(
      (l) => l.vitaminId === s.id && l.status === "taken",
    );
    // Only count days since supplement was added
    const daysActive = Math.max(
      1,
      Math.ceil(
        (new Date(to).getTime() - new Date(createdDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
    const adherence = Math.round((suppLogs.length / daysActive) * 100);
    return {
      supplement: s,
      adherence: Math.min(adherence, 100),
      takenCount: suppLogs.length,
    };
  });
}

// Streak for a single supplement
export async function getSupplementStreak(
  userId: string,
  vitaminId: number,
): Promise<number> {
  const logs = await db
    .select()
    .from(vitaminLogs)
    .where(
      and(
        eq(vitaminLogs.userId, userId),
        eq(vitaminLogs.vitaminId, vitaminId),
        eq(vitaminLogs.status, "taken"),
      ),
    )
    .orderBy(desc(vitaminLogs.date));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i <= logs.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().split("T")[0];
    if (logs.find((l) => l.date === expectedStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Week view — taken/total per day for last 7 days
export async function getWeekSummary(userId: string) {
  const supplements = await getSupplements(userId);

  // Always start from Monday of current week
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const monday = new Date(today);
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    // ← Use local date string instead of ISO (avoids UTC offset issue)
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const from = days[0];
  const to = days[6];
  const logs = await getSupplementLogsRange(userId, from, to);

  return days.map((date) => {
    const activeOnDate = supplements.filter(
      (s) =>
        s.createdAt &&
        new Date(s.createdAt).toISOString().split("T")[0] <= date,
    );

    const taken = logs.filter(
      (l) => l.date === date && l.status === "taken",
    ).length;

    return { date, taken, total: activeOnDate.length };
  });
}

// ── Actions ───────────────────────────────────────────────

const DEFAULT_TIMES: Record<string, string> = {
  morning: "08:00",
  afternoon: "13:00",
  evening: "18:00",
  night: "21:00",
};

export async function addSupplement(userId: string, data: NewVitamin) {
  // Count existing to assign color
  const existing = await db
    .select({ id: vitamins.id })
    .from(vitamins)
    .where(eq(vitamins.userId, userId));

  const color = data.color ?? assignColor(existing.length);
  const reminderTime = data.reminderTime ?? DEFAULT_TIMES[data.timeOfDay];

  const [supplement] = await db
    .insert(vitamins)
    .values({ userId, ...data, color, reminderTime })
    .returning();

  revalidatePath("/vitamin");
  revalidatePath("/dashboard");
  return supplement;
}

export async function updateSupplement(id: number, data: Partial<NewVitamin>) {
  const [supplement] = await db
    .update(vitamins)
    .set(data)
    .where(eq(vitamins.id, id))
    .returning();

  revalidatePath("/vitamin");
  revalidatePath("/dashboard");
  return supplement;
}

export async function deleteSupplement(id: number) {
  await db
    .update(vitamins)
    .set({ active: false }) // soft delete — preserves log history
    .where(eq(vitamins.id, id));

  revalidatePath("/vitamin");
  revalidatePath("/dashboard");
}

export async function logSupplement(
  userId: string,
  vitaminId: number,
  status: "taken" | "skipped" = "taken",
  date?: string,
) {
  // Upsert — if already logged today, update status
  const existing = await db
    .select()
    .from(vitaminLogs)
    .where(
      and(
        eq(vitaminLogs.userId, userId),
        eq(vitaminLogs.vitaminId, vitaminId),
        eq(vitaminLogs.date, date ?? todayString()),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const [log] = await db
      .update(vitaminLogs)
      .set({ status, takenAt: new Date() })
      .where(eq(vitaminLogs.id, existing[0].id))
      .returning();
    revalidatePath("/vitamin");
    return log;
  }

  const [log] = await db
    .insert(vitaminLogs)
    .values({
      userId,
      vitaminId,
      date: date ?? todayString(),
      status,
      takenAt: new Date(),
    })
    .returning();

  revalidatePath("/vitamin");
  revalidatePath("/dashboard");
  return log;
}

export async function unlogSupplement(
  userId: string,
  vitaminId: number,
  date?: string,
) {
  await db
    .delete(vitaminLogs)
    .where(
      and(
        eq(vitaminLogs.userId, userId),
        eq(vitaminLogs.vitaminId, vitaminId),
        eq(vitaminLogs.date, date ?? todayString()),
      ),
    );

  revalidatePath("/vitamin");
  revalidatePath("/dashboard");
}
