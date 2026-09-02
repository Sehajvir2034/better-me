import { db } from "@/lib/db";
import { sleepLogs, sleepNaps, sleepSettings } from "@/db/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { getSleepOverview } from "@/lib/sleep";

function toDateString(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function daysAgoDateString(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toDateString(d);
}

export async function getSleepSettings(userId: string) {
  const rows = await db
    .select()
    .from(sleepSettings)
    .where(eq(sleepSettings.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getLatestSleepLog(userId: string) {
  const rows = await db
    .select()
    .from(sleepLogs)
    .where(eq(sleepLogs.userId, userId))
    .orderBy(
      desc(sleepLogs.sleepDate),
      desc(sleepLogs.loggedAt),
      desc(sleepLogs.id),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function getSleepLogByDate(userId: string, sleepDate?: string) {
  const targetDate = sleepDate ?? toDateString();

  const rows = await db
    .select()
    .from(sleepLogs)
    .where(
      and(eq(sleepLogs.userId, userId), eq(sleepLogs.sleepDate, targetDate)),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function getRecentSleepLogs(userId: string, days = 30) {
  const fromDate = daysAgoDateString(days - 1);

  return db
    .select()
    .from(sleepLogs)
    .where(
      and(eq(sleepLogs.userId, userId), gte(sleepLogs.sleepDate, fromDate)),
    )
    .orderBy(
      desc(sleepLogs.sleepDate),
      desc(sleepLogs.loggedAt),
      desc(sleepLogs.id),
    );
}

export async function getSleepLogsInRange(
  userId: string,
  fromDate: string,
  toDate: string,
) {
  return db
    .select()
    .from(sleepLogs)
    .where(
      and(
        eq(sleepLogs.userId, userId),
        gte(sleepLogs.sleepDate, fromDate),
        lte(sleepLogs.sleepDate, toDate),
      ),
    )
    .orderBy(
      desc(sleepLogs.sleepDate),
      desc(sleepLogs.loggedAt),
      desc(sleepLogs.id),
    );
}

export async function getRecentSleepNaps(userId: string, days = 30) {
  const fromDate = daysAgoDateString(days - 1);

  return db
    .select()
    .from(sleepNaps)
    .where(and(eq(sleepNaps.userId, userId), gte(sleepNaps.napDate, fromDate)))
    .orderBy(
      desc(sleepNaps.napDate),
      desc(sleepNaps.loggedAt),
      desc(sleepNaps.id),
    );
}

export async function getSleepNapsInRange(
  userId: string,
  fromDate: string,
  toDate: string,
) {
  return db
    .select()
    .from(sleepNaps)
    .where(
      and(
        eq(sleepNaps.userId, userId),
        gte(sleepNaps.napDate, fromDate),
        lte(sleepNaps.napDate, toDate),
      ),
    )
    .orderBy(
      desc(sleepNaps.napDate),
      desc(sleepNaps.loggedAt),
      desc(sleepNaps.id),
    );
}

export async function getTodaySleep(userId: string) {
  const todayDate = toDateString();
  return getSleepLogByDate(userId, todayDate);
}

export async function getSleepOverviewData(userId: string) {
  const [latestLog, settings, recentLogs, recentNaps] = await Promise.all([
    getLatestSleepLog(userId),
    getSleepSettings(userId),
    getRecentSleepLogs(userId, 30),
    getRecentSleepNaps(userId, 30),
  ]);

  const overview = getSleepOverview(
    latestLog,
    settings,
    recentLogs,
    recentNaps,
  );

  return {
    latestLog,
    settings,
    recentLogs,
    recentNaps,
    overview,
  };
}

export async function getSleepPageData(userId: string) {
  const [settings, logs, naps] = await Promise.all([
    getSleepSettings(userId),
    getRecentSleepLogs(userId, 30),
    getRecentSleepNaps(userId, 30),
  ]);

  const latestLog = logs[0] ?? null;
  const overview = getSleepOverview(latestLog, settings, logs, naps);

  return {
    settings,
    latestLog,
    logs,
    naps,
    overview,
  };
}
