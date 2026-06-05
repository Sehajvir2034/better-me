"use server";
import {
  getSupplements,
  getSupplementLogs,
  logSupplement,
  unlogSupplement,
} from "@/lib/vitamin";
import type { RoutineItemData } from "@/components/dashboard/routine-panel";
import { use } from "react";

export async function getRoutineItems(
  userId: string,
  today: string,
): Promise<RoutineItemData[]> {
  const [supplements, logs] = await Promise.all([
    getSupplements(userId),
    getSupplementLogs(userId, today),
  ]);

  const supplementItems: RoutineItemData[] = supplements.map((s) => {
    const log = logs.find((l) => l.supplement.id === s.id);
    return {
      id: `supplement-${s.id}`,
      supplementId: s.id,
      label: [s.name, s.dosage, s.unit].filter(Boolean).join(" "),
      scheduledTime: s.reminderTime ?? "08:00",
      category: "vitamins" as const,
      done: log?.log.status === "taken",
    };
  });

  return supplementItems.sort((a, b) =>
    a.scheduledTime.localeCompare(b.scheduledTime),
  );
}

export async function toggleRoutineItem(
  userId: string,
  item: RoutineItemData,
  done: boolean,
  today: string,
) {
  if (item.category === "vitamins" && item.supplementId) {
    if (done) {
      await logSupplement(userId, item.supplementId, "taken", today);
    } else {
      await unlogSupplement(userId, item.supplementId, today);
    }
  }
  // future: handle skincare, haircare toggles here
}
