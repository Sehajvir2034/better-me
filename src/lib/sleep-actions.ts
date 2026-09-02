"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sleepLogs, sleepNaps } from "@/db/schema";

export type SleepLogActionState = {
  success: boolean;
  error?: string;
};

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getRequiredString(formData, key);
  return value || null;
}

function getOptionalInteger(formData: FormData, key: string) {
  const raw = getRequiredString(formData, key);

  if (!raw) {
    return null;
  }

  const value = Number(raw);
  return Number.isInteger(value) ? value : null;
}

function getRequiredPositiveInteger(formData: FormData, key: string) {
  const raw = getRequiredString(formData, key);
  const value = Number(raw);

  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function getCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function toDateTime(sleepDate: string, time: string | null) {
  if (!time) {
    return null;
  }

  const date = new Date(`${sleepDate}T${time}:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function toNextDayIfNeeded(value: Date | null, reference: Date | null) {
  if (!value || !reference) {
    return value;
  }

  if (value.getTime() < reference.getTime()) {
    value.setDate(value.getDate() + 1);
  }

  return value;
}

async function getAuthenticatedUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user.id ?? null;
}

export async function saveSleepLog(
  _: SleepLogActionState,
  formData: FormData,
): Promise<SleepLogActionState> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      error: "Your session has expired. Please sign in again.",
    };
  }

  const sleepDate = getRequiredString(formData, "sleepDate");

  if (!sleepDate) {
    return {
      success: false,
      error: "Please choose the date for this sleep entry.",
    };
  }

  const bedTimeInput = getOptionalString(formData, "bedTime");
  const attemptedSleepInput = getOptionalString(formData, "attemptedSleepTime");
  const fellAsleepInput = getOptionalString(formData, "fellAsleepTime");
  const wakeTimeInput = getOptionalString(formData, "wakeTime");
  const outOfBedInput = getOptionalString(formData, "outOfBedTime");

  const bedTime = toDateTime(sleepDate, bedTimeInput);

  let attemptedSleepTime = toDateTime(sleepDate, attemptedSleepInput);
  let fellAsleepTime = toDateTime(sleepDate, fellAsleepInput);
  let wakeTime = toDateTime(sleepDate, wakeTimeInput);
  let outOfBedTime = toDateTime(sleepDate, outOfBedInput);

  attemptedSleepTime = toNextDayIfNeeded(attemptedSleepTime, bedTime);

  fellAsleepTime = toNextDayIfNeeded(
    fellAsleepTime,
    attemptedSleepTime ?? bedTime,
  );

  wakeTime = toNextDayIfNeeded(
    wakeTime,
    fellAsleepTime ?? attemptedSleepTime ?? bedTime,
  );

  outOfBedTime = toNextDayIfNeeded(
    outOfBedTime,
    wakeTime ?? fellAsleepTime ?? attemptedSleepTime ?? bedTime,
  );

  if (!bedTime || !wakeTime) {
    return {
      success: false,
      error: "Bedtime and wake time are required.",
    };
  }

  if (wakeTime.getTime() <= bedTime.getTime()) {
    return {
      success: false,
      error: "Wake time must occur after bedtime.",
    };
  }

  const awakeningsCount = getOptionalInteger(formData, "awakeningsCount") ?? 0;
  const awakeMinutes = getOptionalInteger(formData, "awakeMinutes") ?? 0;
  const sleepQuality = getOptionalInteger(formData, "sleepQuality");
  const morningEnergy = getOptionalInteger(formData, "morningEnergy");
  const morningMood = getOptionalInteger(formData, "morningMood");

  if (awakeningsCount < 0 || awakeMinutes < 0) {
    return {
      success: false,
      error: "Awakenings and awake minutes cannot be negative.",
    };
  }

  if (
    [sleepQuality, morningEnergy, morningMood].some(
      (value) => value !== null && (value < 1 || value > 5),
    )
  ) {
    return {
      success: false,
      error: "Ratings must be between 1 and 5.",
    };
  }

  const payload = {
    userId,
    sleepDate,
    bedTime,
    attemptedSleepTime,
    fellAsleepTime,
    wakeTime,
    outOfBedTime,
    awakeningsCount,
    awakeMinutes,
    sleepQuality,
    morningEnergy,
    morningMood,
    notes: getOptionalString(formData, "notes"),
    hadLateCaffeine: getCheckbox(formData, "hadLateCaffeine"),
    hadAlcohol: getCheckbox(formData, "hadAlcohol"),
    hadLateMeal: getCheckbox(formData, "hadLateMeal"),
    hadWorkout: getCheckbox(formData, "hadWorkout"),
    hadHighStress: getCheckbox(formData, "hadHighStress"),
    hadLateScreenTime: getCheckbox(formData, "hadLateScreenTime"),
    source: "manual",
    updatedAt: new Date(),
  };

  const existing = await db
    .select({ id: sleepLogs.id })
    .from(sleepLogs)
    .where(
      and(eq(sleepLogs.userId, userId), eq(sleepLogs.sleepDate, sleepDate)),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(sleepLogs)
      .set(payload)
      .where(
        and(eq(sleepLogs.id, existing[0].id), eq(sleepLogs.userId, userId)),
      );
  } else {
    await db.insert(sleepLogs).values(payload);
  }

  revalidatePath("/sleep");

  return { success: true };
}

export async function deleteSleepLog(
  _: SleepLogActionState,
  formData: FormData,
): Promise<SleepLogActionState> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      error: "Your session has expired. Please sign in again.",
    };
  }

  const logId = getRequiredPositiveInteger(formData, "logId");

  if (logId === null) {
    return {
      success: false,
      error: "Invalid sleep log.",
    };
  }

  const deleted = await db
    .delete(sleepLogs)
    .where(and(eq(sleepLogs.id, logId), eq(sleepLogs.userId, userId)))
    .returning({ id: sleepLogs.id });

  if (!deleted[0]) {
    return {
      success: false,
      error: "That sleep log no longer exists or cannot be deleted.",
    };
  }

  revalidatePath("/sleep");

  return { success: true };
}

export async function deleteSleepNap(
  _: SleepLogActionState,
  formData: FormData,
): Promise<SleepLogActionState> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      success: false,
      error: "Your session has expired. Please sign in again.",
    };
  }

  const napId = getRequiredPositiveInteger(formData, "napId");

  if (napId === null) {
    return {
      success: false,
      error: "Invalid nap log.",
    };
  }

  const deleted = await db
    .delete(sleepNaps)
    .where(and(eq(sleepNaps.id, napId), eq(sleepNaps.userId, userId)))
    .returning({ id: sleepNaps.id });

  if (!deleted[0]) {
    return {
      success: false,
      error: "That nap no longer exists or cannot be deleted.",
    };
  }

  revalidatePath("/sleep");

  return { success: true };
}

// "use server";

// import { revalidatePath } from "next/cache";
// import { headers } from "next/headers";
// import { auth } from "@/lib/auth";
// import { db } from "@/lib/db";
// import { sleepLogs, sleepNaps } from "@/db/schema";
// import { and, eq } from "drizzle-orm";

// export type SleepLogActionState = {
//   success: boolean;
//   error?: string;
// };

// function getRequiredString(formData: FormData, key: string) {
//   const value = formData.get(key);
//   return typeof value === "string" ? value.trim() : "";
// }

// function getOptionalString(formData: FormData, key: string) {
//   const value = getRequiredString(formData, key);
//   return value || null;
// }

// function getOptionalInteger(formData: FormData, key: string) {
//   const raw = getRequiredString(formData, key);
//   if (!raw) return null;

//   const value = Number(raw);
//   return Number.isInteger(value) ? value : null;
// }

// function getRequiredPositiveInteger(formData: FormData, key: string) {
//   const raw = getRequiredString(formData, key);
//   const value = Number(raw);

//   return Number.isSafeInteger(value) && value > 0 ? value : null;
// }

// function toDateTime(sleepDate: string, time: string | null) {
//   if (!time) return null;

//   const date = new Date(`${sleepDate}T${time}:00`);
//   return Number.isNaN(date.getTime()) ? null : date;
// }

// function toNextDayIfNeeded(value: Date | null, reference: Date | null) {
//   if (!value || !reference) return value;

//   if (value.getTime() < reference.getTime()) {
//     value.setDate(value.getDate() + 1);
//   }

//   return value;
// }

// function getCheckbox(formData: FormData, key: string) {
//   return formData.get(key) === "on";
// }

// export async function saveSleepLog(
//   _: SleepLogActionState,
//   formData: FormData,
// ): Promise<SleepLogActionState> {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session) {
//     return {
//       success: false,
//       error: "Your session has expired. Please sign in again.",
//     };
//   }

//   const userId = session.user.id;
//   const sleepDate = getRequiredString(formData, "sleepDate");

//   if (!sleepDate) {
//     return {
//       success: false,
//       error: "Please choose the date for this sleep entry.",
//     };
//   }

//   const bedTimeInput = getOptionalString(formData, "bedTime");
//   const attemptedSleepInput = getOptionalString(formData, "attemptedSleepTime");
//   const fellAsleepInput = getOptionalString(formData, "fellAsleepTime");
//   const wakeTimeInput = getOptionalString(formData, "wakeTime");
//   const outOfBedInput = getOptionalString(formData, "outOfBedTime");

//   const bedTime = toDateTime(sleepDate, bedTimeInput);

//   let attemptedSleepTime = toDateTime(sleepDate, attemptedSleepInput);
//   let fellAsleepTime = toDateTime(sleepDate, fellAsleepInput);
//   let wakeTime = toDateTime(sleepDate, wakeTimeInput);
//   let outOfBedTime = toDateTime(sleepDate, outOfBedInput);

//   attemptedSleepTime = toNextDayIfNeeded(attemptedSleepTime, bedTime);
//   fellAsleepTime = toNextDayIfNeeded(
//     fellAsleepTime,
//     attemptedSleepTime ?? bedTime,
//   );
//   wakeTime = toNextDayIfNeeded(
//     wakeTime,
//     fellAsleepTime ?? attemptedSleepTime ?? bedTime,
//   );
//   outOfBedTime = toNextDayIfNeeded(
//     outOfBedTime,
//     wakeTime ?? fellAsleepTime ?? attemptedSleepTime ?? bedTime,
//   );

//   if (!bedTime || !wakeTime) {
//     return {
//       success: false,
//       error: "Bedtime and wake time are required.",
//     };
//   }

//   if (wakeTime.getTime() <= bedTime.getTime()) {
//     return {
//       success: false,
//       error: "Wake time must occur after bedtime.",
//     };
//   }

//   const awakeningsCount = getOptionalInteger(formData, "awakeningsCount") ?? 0;
//   const awakeMinutes = getOptionalInteger(formData, "awakeMinutes") ?? 0;
//   const sleepQuality = getOptionalInteger(formData, "sleepQuality");
//   const morningEnergy = getOptionalInteger(formData, "morningEnergy");
//   const morningMood = getOptionalInteger(formData, "morningMood");

//   if (awakeningsCount < 0 || awakeMinutes < 0) {
//     return {
//       success: false,
//       error: "Awakenings and awake minutes cannot be negative.",
//     };
//   }

//   if (
//     [sleepQuality, morningEnergy, morningMood].some(
//       (value) => value !== null && (value < 1 || value > 5),
//     )
//   ) {
//     return {
//       success: false,
//       error: "Ratings must be between 1 and 5.",
//     };
//   }

//   const payload = {
//     userId,
//     sleepDate,
//     bedTime,
//     attemptedSleepTime,
//     fellAsleepTime,
//     wakeTime,
//     outOfBedTime,

//     awakeningsCount,
//     awakeMinutes,

//     sleepQuality,
//     morningEnergy,
//     morningMood,

//     notes: getOptionalString(formData, "notes"),

//     hadLateCaffeine: getCheckbox(formData, "hadLateCaffeine"),
//     hadAlcohol: getCheckbox(formData, "hadAlcohol"),
//     hadLateMeal: getCheckbox(formData, "hadLateMeal"),
//     hadWorkout: getCheckbox(formData, "hadWorkout"),
//     hadHighStress: getCheckbox(formData, "hadHighStress"),
//     hadLateScreenTime: getCheckbox(formData, "hadLateScreenTime"),

//     source: "manual",
//     updatedAt: new Date(),
//   };

//   const existing = await db
//     .select({ id: sleepLogs.id })
//     .from(sleepLogs)
//     .where(
//       and(eq(sleepLogs.userId, userId), eq(sleepLogs.sleepDate, sleepDate)),
//     )
//     .limit(1);

//   if (existing[0]) {
//     await db
//       .update(sleepLogs)
//       .set(payload)
//       .where(eq(sleepLogs.id, existing[0].id));
//   } else {
//     await db.insert(sleepLogs).values(payload);
//   }

//   revalidatePath("/sleep");

//   return { success: true };
// }

// export async function deleteSleepLog(
//   _: SleepLogActionState,
//   formData: FormData,
// ): Promise<SleepLogActionState> {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session) {
//     return {
//       success: false,
//       error: "Your session has expired. Please sign in again.",
//     };
//   }

//   const logId = getRequiredString(formData, "logId");

//   if (!logId) {
//     return {
//       success: false,
//       error: "Sleep log not found.",
//     };
//   }

//   const deleted = await db
//     .delete(sleepLogs)
//     .where(and(eq(sleepLogs.id, logId), eq(sleepLogs.userId, session.user.id)))
//     .returning({ id: sleepLogs.id });

//   if (!deleted[0]) {
//     return {
//       success: false,
//       error: "That sleep log no longer exists or cannot be deleted.",
//     };
//   }

//   revalidatePath("/sleep");

//   return { success: true };
// }

// export async function deleteSleepNap(
//   _: SleepLogActionState,
//   formData: FormData,
// ): Promise<SleepLogActionState> {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session) {
//     return {
//       success: false,
//       error: "Your session has expired. Please sign in again.",
//     };
//   }

//   const napId = getRequiredPositiveInteger(formData, "napId");

//   if (napId === null) {
//     return {
//       success: false,
//       error: "Invalid nap log.",
//     };
//   }

//   const deleted = await db
//     .delete(sleepNaps)
//     .where(and(eq(sleepNaps.id, napId), eq(sleepNaps.userId, session.user.id)))
//     .returning({ id: sleepNaps.id });

//   if (!deleted[0]) {
//     return {
//       success: false,
//       error: "That nap no longer exists or cannot be deleted.",
//     };
//   }

//   revalidatePath("/sleep");

//   return { success: true };
// }
