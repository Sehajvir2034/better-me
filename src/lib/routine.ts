// src/lib/routine.ts
"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { routineItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function toggleRoutineItem(id: string, done: boolean) {
  await db.update(routineItems).set({ done }).where(eq(routineItems.id, id));

  revalidatePath("/dashboard");
}
