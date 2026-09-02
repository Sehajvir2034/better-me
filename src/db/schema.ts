import { getSleepOverview } from "@/lib/sleep";
import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  date,
  serial,
  uniqueIndex,
  index,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// ── Enums ─────────────────────────────────────────────────
export const categoryEnum = pgEnum("routine_category", [
  "vitamins",
  "skincare",
  "haircare",
  "nutrition",
  "exercise",
]);

export const supplementTimeEnum = pgEnum("supplement_time", [
  "morning",
  "afternoon",
  "evening",
  "night",
]);

export const supplementStatusEnum = pgEnum("supplement_status", [
  "taken",
  "skipped",
]);

// ── Better Auth Tables ────────────────────────────────────
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ── Vitamins ──────────────────────────────────────────────
export const vitamins = pgTable("vitamins", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dosage: text("dosage"),
  unit: text("unit"),
  category: text("category"),
  color: text("color"),
  frequency: text("frequency").notNull().default("daily"),
  timeOfDay: supplementTimeEnum("time_of_day").notNull().default("morning"),
  reminderTime: text("reminder_time"),
  withFood: boolean("with_food").default(false),
  notes: text("notes"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vitaminLogs = pgTable("vitamin_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  vitaminId: integer("vitamin_id")
    .notNull()
    .references(() => vitamins.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: supplementStatusEnum("status").notNull().default("taken"),
  takenAt: timestamp("taken_at").defaultNow(),
  note: text("note"),
});

// ── Nutrition ─────────────────────────────────────────────
export const nutritionLogs = pgTable("nutrition_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mealType: text("meal_type"),
  foodName: text("food_name").notNull(),
  calories: real("calories"),
  protein: real("protein"),
  carbs: real("carbs"),
  fat: real("fat"),
  fiber: real("fiber"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Water ─────────────────────────────────────────────────
export const waterLogs = pgTable("water_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  amountMl: integer("amount_ml").notNull(),
  loggedAt: timestamp("logged_at").defaultNow(),
});

export const waterGoals = pgTable("water_goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  dailyGoalMl: integer("daily_goal_ml").notNull().default(2500),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Skin Care ─────────────────────────────────────────────
export const skincareProducts = pgTable("skincare_products", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  brand: text("brand"),
  category: text("category"),
  amPm: text("am_pm"),
  instructions: text("instructions"),
  sortOrder: integer("sort_order").default(0),
  percentRemaining: integer("percent_remaining").default(100),
  imageUrl: text("image_url"),
  openedAt: date("opened_at"),
  expiresAt: date("expires_at"),
  active: boolean("active").default(true),
  onShelf: boolean("on_shelf").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skincareLogs = pgTable("skincare_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ritualStepId: integer("ritual_step_id").references(
    () => skincareRitualSteps.id,
    {
      onDelete: "cascade",
    },
  ),
  productId: integer("product_id").references(() => skincareProducts.id, {
    onDelete: "cascade",
  }),
  date: date("date").notNull(),
  timeOfDay: text("time_of_day"),
  completedAt: text("completed_at"),
  productsUsed: jsonb("products_used"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

export const skincareRitualSteps = pgTable("skincare_ritual_steps", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => skincareProducts.id, { onDelete: "cascade" }),
  timeOfDay: text("time_of_day").notNull(),
  instructions: text("instructions"),
  sortOrder: integer("sort_order").default(0),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Hair Care ─────────────────────────────────────────────
export const haircareLogs = pgTable("haircare_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  activity: text("activity").notNull(),
  productsUsed: text("products_used"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Sleep ─────────────────────────────────────────────────
export const sleepLogs = pgTable(
  "sleep_logs",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    sleepDate: date("sleep_date").notNull(),

    bedTime: timestamp("bed_time"),
    attemptedSleepTime: timestamp("attempted_sleep_time"),
    fellAsleepTime: timestamp("fell_asleep_time"),
    wakeTime: timestamp("wake_time"),
    outOfBedTime: timestamp("out_of_bed_time"),

    awakeningsCount: integer("awakenings_count").default(0).notNull(),
    awakeMinutes: integer("awake_minutes").default(0).notNull(),

    sleepQuality: integer("sleep_quality"),
    morningEnergy: integer("morning_energy"),
    morningMood: integer("morning_mood"),

    notes: text("notes"),

    hadLateCaffeine: boolean("had_late_caffeine").default(false).notNull(),
    hadAlcohol: boolean("had_alcohol").default(false).notNull(),
    hadLateMeal: boolean("had_late_meal").default(false).notNull(),
    hadWorkout: boolean("had_workout").default(false).notNull(),
    hadHighStress: boolean("had_high_stress").default(false).notNull(),
    hadLateScreenTime: boolean("had_late_screen_time").default(false).notNull(),

    source: text("source").default("manual").notNull(),

    loggedAt: timestamp("logged_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userSleepDateIdx: uniqueIndex("sleep_logs_user_sleep_date_idx").on(
      table.userId,
      table.sleepDate,
    ),
    userLoggedAtIdx: index("sleep_logs_user_logged_at_idx").on(
      table.userId,
      table.loggedAt,
    ),
  }),
);

export const sleepNaps = pgTable(
  "sleep_naps",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    napDate: date("nap_date").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),

    refreshRating: integer("refresh_rating"),
    notes: text("notes"),

    loggedAt: timestamp("logged_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userNapDateIdx: index("sleep_naps_user_nap_date_idx").on(
      table.userId,
      table.napDate,
    ),
  }),
);

export const sleepSettings = pgTable(
  "sleep_settings",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    targetSleepMinutes: integer("target_sleep_minutes").default(480).notNull(),
    targetBedtime: text("target_bedtime"),
    targetWakeTime: text("target_wake_time"),

    bedtimeReminderEnabled: boolean("bedtime_reminder_enabled")
      .default(false)
      .notNull(),
    bedtimeReminderTime: text("bedtime_reminder_time"),

    windDownMinutes: integer("wind_down_minutes").default(30).notNull(),

    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userUniqueSleepSettingsIdx: uniqueIndex(
      "sleep_settings_user_unique_idx",
    ).on(table.userId),
  }),
);

// ── Physical Activity ─────────────────────────────────────
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  activityType: text("activity_type").notNull(),
  durationMinutes: integer("duration_minutes"),
  caloriesBurned: real("calories_burned"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Mindset Journal ───────────────────────────────────────
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mood: integer("mood"),
  entry: text("entry"),
  gratitude: text("gratitude"),
  intentions: text("intentions"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Routine ───────────────────────────────────────────────
export const routineItems = pgTable("routine_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  label: text("label").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  category: categoryEnum("category").notNull(),
  done: boolean("done").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SleepLog = typeof sleepLogs.$inferSelect;
export type SleepNap = typeof sleepNaps.$inferSelect;
export type SleepSettings = typeof sleepSettings.$inferSelect;
export type SleepOverview = ReturnType<typeof getSleepOverview>;
