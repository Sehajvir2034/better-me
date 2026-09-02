import type { SleepLog, SleepNap, SleepSettings } from "@/db/schema";

const MS_IN_MINUTE = 1000 * 60;
const MINUTES_IN_DAY = 1440;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function diffMinutes(later?: Date | null, earlier?: Date | null) {
  if (!later || !earlier) return 0;
  return Math.max(
    0,
    Math.round((later.getTime() - earlier.getTime()) / MS_IN_MINUTE),
  );
}

function parseClockTime(value?: string | null) {
  if (!value) return null;
  const [hh, mm] = value.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

function circularMinutesDifference(a?: string | null, b?: string | null) {
  const aMinutes = parseClockTime(a);
  const bMinutes = parseClockTime(b);
  if (aMinutes == null || bMinutes == null) return 0;

  const diff = Math.abs(aMinutes - bMinutes);
  return Math.min(diff, MINUTES_IN_DAY - diff);
}

function dateToClockString(date?: Date | null) {
  if (!date) return null;
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export function getTimeInBedMinutes(
  log: Pick<SleepLog, "bedTime" | "outOfBedTime" | "wakeTime">,
) {
  const end = log.outOfBedTime ?? log.wakeTime ?? null;
  return diffMinutes(end, log.bedTime);
}

export function getSleepLatencyMinutes(
  log: Pick<SleepLog, "attemptedSleepTime" | "fellAsleepTime">,
) {
  if (!log.attemptedSleepTime || !log.fellAsleepTime) return 0;
  return diffMinutes(log.fellAsleepTime, log.attemptedSleepTime);
}

export function getSleepDurationMinutes(
  log: Pick<
    SleepLog,
    "fellAsleepTime" | "bedTime" | "wakeTime" | "awakeMinutes"
  >,
) {
  const start = log.fellAsleepTime ?? log.bedTime ?? null;
  if (!start || !log.wakeTime) return 0;

  const total = diffMinutes(log.wakeTime, start);
  return Math.max(0, total - (log.awakeMinutes ?? 0));
}

export function getSleepEfficiency(
  log: Pick<
    SleepLog,
    "bedTime" | "outOfBedTime" | "wakeTime" | "fellAsleepTime" | "awakeMinutes"
  >,
) {
  const timeInBed = getTimeInBedMinutes(log);
  if (timeInBed <= 0) return 0;

  const sleepDuration = getSleepDurationMinutes(log);
  return Math.round((sleepDuration / timeInBed) * 100);
}

export function getSleepDebtMinutes(
  log: Pick<
    SleepLog,
    "fellAsleepTime" | "bedTime" | "wakeTime" | "awakeMinutes"
  >,
  settings?: Pick<SleepSettings, "targetSleepMinutes"> | null,
) {
  const target = settings?.targetSleepMinutes ?? 480;
  const actual = getSleepDurationMinutes(log);
  return Math.max(0, target - actual);
}

export function getTotalNapMinutes(naps: SleepNap[]) {
  return naps.reduce((sum, nap) => sum + (nap.durationMinutes ?? 0), 0);
}

export function getAverageNapMinutes(naps: SleepNap[]) {
  if (!naps.length) return 0;
  return Math.round(getTotalNapMinutes(naps) / naps.length);
}

export function getAverageSleepDuration(logs: SleepLog[]) {
  if (!logs.length) return 0;
  const total = logs.reduce(
    (sum, log) => sum + getSleepDurationMinutes(log),
    0,
  );
  return Math.round(total / logs.length);
}

export function getAverageSleepEfficiency(logs: SleepLog[]) {
  if (!logs.length) return 0;
  const total = logs.reduce((sum, log) => sum + getSleepEfficiency(log), 0);
  return Math.round(total / logs.length);
}

export function getRollingSleepDebt(
  logs: SleepLog[],
  settings?: SleepSettings | null,
) {
  return logs.reduce((sum, log) => sum + getSleepDebtMinutes(log, settings), 0);
}

export function getConsistencyScore(
  logs: SleepLog[],
  settings?: Pick<SleepSettings, "targetBedtime" | "targetWakeTime"> | null,
) {
  if (!logs.length) return 0;

  const bedtimeTarget = settings?.targetBedtime ?? null;
  const wakeTarget = settings?.targetWakeTime ?? null;

  const bedtimePenalty = logs.reduce((sum, log) => {
    const actual = dateToClockString(log.bedTime);
    if (!actual || !bedtimeTarget) return sum;
    return sum + circularMinutesDifference(actual, bedtimeTarget);
  }, 0);

  const wakePenalty = logs.reduce((sum, log) => {
    const actual = dateToClockString(log.wakeTime);
    if (!actual || !wakeTarget) return sum;
    return sum + circularMinutesDifference(actual, wakeTarget);
  }, 0);

  const comparisons =
    (bedtimeTarget ? logs.length : 0) + (wakeTarget ? logs.length : 0);

  if (comparisons === 0) return 70;

  const avgPenalty = (bedtimePenalty + wakePenalty) / comparisons;
  return Math.round(clamp(100 - avgPenalty / 1.8, 0, 100));
}

export function getSleepScore(
  log: SleepLog,
  settings?: SleepSettings | null,
  recentLogs: SleepLog[] = [],
) {
  const target = settings?.targetSleepMinutes ?? 480;
  const duration = getSleepDurationMinutes(log);

  const durationScore = clamp((duration / target) * 100, 0, 100);
  const efficiencyScore = clamp(getSleepEfficiency(log), 0, 100);

  const qualityScore = log.sleepQuality
    ? clamp((log.sleepQuality / 5) * 100, 0, 100)
    : 70;

  const energyScore = log.morningEnergy
    ? clamp((log.morningEnergy / 5) * 100, 0, 100)
    : 70;

  const consistencyScore = recentLogs.length
    ? getConsistencyScore(recentLogs.slice(0, 7), settings)
    : 70;

  return Math.round(
    durationScore * 0.4 +
      qualityScore * 0.2 +
      efficiencyScore * 0.2 +
      consistencyScore * 0.1 +
      energyScore * 0.1,
  );
}

export function formatMinutesAsSleep(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function getSleepStatus(log: SleepLog, settings?: SleepSettings | null) {
  const score = getSleepScore(log, settings);

  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 55) return "fair";
  return "poor";
}

export function getSleepOverview(
  latestLog: SleepLog | null,
  settings?: SleepSettings | null,
  recentLogs: SleepLog[] = [],
  recentNaps: SleepNap[] = [],
) {
  const last7Logs = recentLogs.slice(0, 7);
  const last30Logs = recentLogs.slice(0, 30);

  if (!latestLog) {
    return {
      hasData: false,
      score: 0,
      status: "none" as const,
      sleepDurationMinutes: 0,
      timeInBedMinutes: 0,
      sleepLatencyMinutes: 0,
      sleepEfficiency: 0,
      sleepDebtMinutes: 0,
      avg7dSleepMinutes: getAverageSleepDuration(last7Logs),
      avg30dSleepMinutes: getAverageSleepDuration(last30Logs),
      avg7dEfficiency: getAverageSleepEfficiency(last7Logs),
      avgNapMinutes: getAverageNapMinutes(recentNaps),
      totalNapMinutes: getTotalNapMinutes(recentNaps),
      consistencyScore: getConsistencyScore(last7Logs, settings),
      rollingSleepDebtMinutes: getRollingSleepDebt(last7Logs, settings),
    };
  }

  const score = getSleepScore(latestLog, settings, last7Logs);

  return {
    hasData: true,
    score,
    status: getSleepStatus(latestLog, settings) as
      | "excellent"
      | "good"
      | "fair"
      | "poor",
    sleepDurationMinutes: getSleepDurationMinutes(latestLog),
    timeInBedMinutes: getTimeInBedMinutes(latestLog),
    sleepLatencyMinutes: getSleepLatencyMinutes(latestLog),
    sleepEfficiency: getSleepEfficiency(latestLog),
    sleepDebtMinutes: getSleepDebtMinutes(latestLog, settings),
    avg7dSleepMinutes: getAverageSleepDuration(last7Logs),
    avg30dSleepMinutes: getAverageSleepDuration(last30Logs),
    avg7dEfficiency: getAverageSleepEfficiency(last7Logs),
    avgNapMinutes: getAverageNapMinutes(recentNaps),
    totalNapMinutes: getTotalNapMinutes(recentNaps),
    consistencyScore: getConsistencyScore(last7Logs, settings),
    rollingSleepDebtMinutes: getRollingSleepDebt(last7Logs, settings),
  };
}

export function getBestSleepLog(
  logs: SleepLog[],
  settings?: SleepSettings | null,
) {
  if (!logs.length) return null;

  return [...logs].sort(
    (a, b) =>
      getSleepScore(b, settings, logs) - getSleepScore(a, settings, logs),
  )[0];
}

export function getWorstSleepLog(
  logs: SleepLog[],
  settings?: SleepSettings | null,
) {
  if (!logs.length) return null;

  return [...logs].sort(
    (a, b) =>
      getSleepScore(a, settings, logs) - getSleepScore(b, settings, logs),
  )[0];
}

export type SleepOverview = ReturnType<typeof getSleepOverview>;
