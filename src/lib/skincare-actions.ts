"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

import {
  skincareLogs,
  skincareProducts,
  skincareRitualSteps,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

function today() {
  return new Date().toISOString().split("T")[0];
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

export async function toggleRitualStep(
  ritualStepId: number,
  productId: number,
  timeOfDay: "am" | "pm",
  done: boolean,
) {
  const userId = await getUserId();
  const dateStr = today();

  if (done) {
    await db.insert(skincareLogs).values({
      userId,
      ritualStepId,
      productId,
      date: dateStr,
      timeOfDay,
      completedAt: formatTime(new Date()),
    });
  } else {
    await db
      .delete(skincareLogs)
      .where(
        and(
          eq(skincareLogs.userId, userId),
          eq(skincareLogs.ritualStepId, ritualStepId),
          eq(skincareLogs.date, dateStr),
          eq(skincareLogs.timeOfDay, timeOfDay),
        ),
      );
  }

  revalidatePath("/skincare");
}

export async function addRitualProduct(data: {
  productId?: number;
  name: string;
  brand?: string;
  category?: string;
  amPm: "am" | "pm" | "both";
  instructions?: string;
}) {
  const userId = await getUserId();

  let productId = data.productId;

  if (productId) {
    await db
      .update(skincareProducts)
      .set({
        name: data.name,
        brand: data.brand ?? null,
        category: data.category ?? null,
        active: true,
        onShelf: true,
      })
      .where(
        and(
          eq(skincareProducts.id, productId),
          eq(skincareProducts.userId, userId),
        ),
      );
  } else {
    const inserted = await db
      .insert(skincareProducts)
      .values({
        userId,
        name: data.name,
        brand: data.brand ?? null,
        category: data.category ?? null,
        percentRemaining: 100,
        active: true,
        onShelf: true,
      })
      .returning({ id: skincareProducts.id });

    productId = inserted[0]?.id;
  }

  if (!productId) {
    throw new Error("Could not create or reuse product");
  }

  const targetTimes =
    data.amPm === "both" ? (["am", "pm"] as const) : [data.amPm];

  for (const timeOfDay of targetTimes) {
    const existing = await db.query.skincareRitualSteps.findFirst({
      where: (table, { and, eq }) =>
        and(
          eq(table.userId, userId),
          eq(table.productId, productId),
          eq(table.timeOfDay, timeOfDay),
        ),
    });

    if (existing) {
      await db
        .update(skincareRitualSteps)
        .set({
          active: true,
          instructions: data.instructions ?? existing.instructions ?? null,
        })
        .where(eq(skincareRitualSteps.id, existing.id));
    } else {
      await db.insert(skincareRitualSteps).values({
        userId,
        productId,
        timeOfDay,
        instructions: data.instructions ?? null,
        sortOrder: 0,
        active: true,
      });
    }
  }

  revalidatePath("/skincare");
}

export async function addShelfProduct(data: {
  productId?: number;
  name: string;
  brand?: string;
  category?: string;
  percentRemaining?: number;
  expiresAt?: string;
}) {
  const userId = await getUserId();

  if (data.productId) {
    await db
      .update(skincareProducts)
      .set({
        name: data.name,
        brand: data.brand ?? null,
        category: data.category ?? null,
        percentRemaining: data.percentRemaining ?? 100,
        expiresAt: data.expiresAt ?? null,
        active: true,
        onShelf: true,
      })
      .where(
        and(
          eq(skincareProducts.id, data.productId),
          eq(skincareProducts.userId, userId),
        ),
      );

    revalidatePath("/skincare");
    return;
  }

  await db.insert(skincareProducts).values({
    userId,
    name: data.name,
    brand: data.brand ?? null,
    category: data.category ?? null,
    percentRemaining: data.percentRemaining ?? 100,
    expiresAt: data.expiresAt ?? null,
    active: true,
    onShelf: true,
  });

  revalidatePath("/skincare");
}

export async function updateProductPercent(
  productId: number,
  percentRemaining: number,
) {
  const userId = await getUserId();

  await db
    .update(skincareProducts)
    .set({ percentRemaining })
    .where(
      and(
        eq(skincareProducts.id, productId),
        eq(skincareProducts.userId, userId),
      ),
    );

  revalidatePath("/skincare");
}

export async function deactivateRitualStep(
  productId: number,
  timeOfDay: "am" | "pm",
) {
  const userId = await getUserId();

  await db
    .update(skincareRitualSteps)
    .set({ active: false })
    .where(
      and(
        eq(skincareRitualSteps.userId, userId),
        eq(skincareRitualSteps.productId, productId),
        eq(skincareRitualSteps.timeOfDay, timeOfDay),
      ),
    );

  revalidatePath("/skincare");
}

export async function logRitualStepForDate(data: {
  ritualStepId: number;
  productId: number;
  timeOfDay: "am" | "pm";
  date: string; // yyyy-mm-dd
  completedAt?: string | null;
}) {
  const userId = await getUserId();

  const existing = await db.query.skincareLogs.findFirst({
    where: (table, { and, eq }) =>
      and(
        eq(table.userId, userId),
        eq(table.ritualStepId, data.ritualStepId),
        eq(table.date, data.date),
        eq(table.timeOfDay, data.timeOfDay),
      ),
  });

  if (existing) {
    await db
      .update(skincareLogs)
      .set({
        completedAt: data.completedAt ?? existing.completedAt ?? null,
      })
      .where(eq(skincareLogs.id, existing.id));
  } else {
    await db.insert(skincareLogs).values({
      userId,
      ritualStepId: data.ritualStepId,
      productId: data.productId,
      date: data.date,
      timeOfDay: data.timeOfDay,
      completedAt: data.completedAt ?? null,
    });
  }

  revalidatePath("/skincare");
}

export async function archiveShelfProduct(productId: number) {
  const userId = await getUserId();

  await db
    .update(skincareProducts)
    .set({ active: false })
    .where(
      and(
        eq(skincareProducts.id, productId),
        eq(skincareProducts.userId, userId),
      ),
    );

  revalidatePath("/skincare");
}

export async function updateShelfProduct(data: {
  productId: number;
  name: string;
  brand?: string;
  category?: string;
  percentRemaining?: number;
  expiresAt?: string;
}) {
  const userId = await getUserId();

  await db
    .update(skincareProducts)
    .set({
      name: data.name,
      brand: data.brand ?? null,
      category: data.category ?? null,
      percentRemaining: data.percentRemaining ?? 100,
      expiresAt: data.expiresAt ?? null,
    })
    .where(
      and(
        eq(skincareProducts.id, data.productId),
        eq(skincareProducts.userId, userId),
      ),
    );

  revalidatePath("/skincare");
}

export async function removeShelfOnly(productId: number) {
  const userId = await getUserId();

  await db
    .update(skincareProducts)
    .set({ onShelf: false })
    .where(
      and(
        eq(skincareProducts.id, productId),
        eq(skincareProducts.userId, userId),
      ),
    );

  revalidatePath("/skincare");
}

export async function archiveProductEverywhere(productId: number) {
  const userId = await getUserId();

  await db
    .update(skincareRitualSteps)
    .set({ active: false })
    .where(
      and(
        eq(skincareRitualSteps.userId, userId),
        eq(skincareRitualSteps.productId, productId),
      ),
    );

  await db
    .update(skincareProducts)
    .set({
      active: false,
      onShelf: false,
    })
    .where(
      and(
        eq(skincareProducts.id, productId),
        eq(skincareProducts.userId, userId),
      ),
    );

  revalidatePath("/skincare");
}

export async function purgeProductEverywhere(productId: number) {
  const userId = await getUserId();

  await db
    .delete(skincareRitualSteps)
    .where(
      and(
        eq(skincareRitualSteps.userId, userId),
        eq(skincareRitualSteps.productId, productId),
      ),
    );

  await db
    .delete(skincareLogs)
    .where(
      and(
        eq(skincareLogs.userId, userId),
        eq(skincareLogs.productId, productId),
      ),
    );

  await db
    .delete(skincareProducts)
    .where(
      and(
        eq(skincareProducts.id, productId),
        eq(skincareProducts.userId, userId),
      ),
    );

  revalidatePath("/skincare");
}
