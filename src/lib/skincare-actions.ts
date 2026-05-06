"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { skincareLogs, skincareProducts } from "@/db/schema";
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
  productId: number,
  timeOfDay: "am" | "pm",
  done: boolean,
) {
  const userId = await getUserId();
  const dateStr = today();

  if (done) {
    // Mark as done — insert log
    await db.insert(skincareLogs).values({
      userId,
      productId,
      date: dateStr,
      timeOfDay,
      completedAt: formatTime(new Date()),
    });
  } else {
    // Unmark — delete log
    await db
      .delete(skincareLogs)
      .where(
        and(
          eq(skincareLogs.userId, userId),
          eq(skincareLogs.productId, productId),
          eq(skincareLogs.date, dateStr),
          eq(skincareLogs.timeOfDay, timeOfDay),
        ),
      );
  }

  revalidatePath("/skincare");
}

export async function addRitualProduct(data: {
  name: string;
  brand?: string;
  category?: string;
  amPm: "am" | "pm" | "both";
  instructions?: string;
}) {
  const userId = await getUserId();

  await db.insert(skincareProducts).values({
    userId,
    name: data.name,
    brand: data.brand ?? null,
    category: data.category ?? null,
    amPm: data.amPm,
    instructions: data.instructions ?? null,
    active: true,
  });

  revalidatePath("/skincare");
}

export async function addShelfProduct(data: {
  name: string;
  category?: string;
  brand?: string;
  amPm?: string;
  percentRemaining?: number;
  imageUrl?: string;
  expiresAt?: string;
}) {
  const userId = await getUserId();

  await db.insert(skincareProducts).values({
    userId,
    name: data.name,
    category: data.category ?? null,
    brand: data.brand ?? null,
    amPm: data.amPm ?? "both",
    percentRemaining: data.percentRemaining ?? 100,
    imageUrl: data.imageUrl ?? null,
    expiresAt: data.expiresAt ?? null,
    active: true,
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
