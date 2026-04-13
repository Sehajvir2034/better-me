import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  date,
  serial,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("routine_category", [
  "vitamins",
  "skincare",
  "haircare",
  "nutrition",
  "exercise",
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
    .references(() => user.id, { onDelete: "cascade" }), // ← add
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency").notNull(),
  timeOfDay: text("time_of_day"),
  notes: text("notes"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vitaminLogs = pgTable("vitamin_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // ← add
  vitaminId: integer("vitamin_id").references(() => vitamins.id),
  takenAt: timestamp("taken_at").defaultNow(),
  date: date("date").notNull(),
});

// ── Nutrition ─────────────────────────────────────────────
export const nutritionLogs = pgTable("nutrition_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // ← add
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
    .references(() => user.id, { onDelete: "cascade" }), // ← add
  date: date("date").notNull(),
  amountMl: integer("amount_ml").notNull(),
  loggedAt: timestamp("logged_at").defaultNow(),
});

export const waterGoals = pgTable("water_goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // ← add
  dailyGoalMl: integer("daily_goal_ml").notNull().default(2500),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Skin Care ─────────────────────────────────────────────
export const skincareProducts = pgTable("skincare_products", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // ← add
  name: text("name").notNull(),
  category: text("category"),
  amPm: text("am_pm"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skincareLogs = pgTable("skincare_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // ← add
  date: date("date").notNull(),
  timeOfDay: text("time_of_day"),
  productsUsed: jsonb("products_used"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Hair Care ─────────────────────────────────────────────
export const haircareLogs = pgTable("haircare_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // ← add
  date: date("date").notNull(),
  activity: text("activity").notNull(),
  productsUsed: text("products_used"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Sleep ─────────────────────────────────────────────────
export const sleepLogs = pgTable("sleep_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // ← add
  date: date("date").notNull(),
  bedtime: timestamp("bedtime"),
  wakeTime: timestamp("wake_time"),
  durationMinutes: integer("duration_minutes"),
  quality: integer("quality"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Physical Activity ─────────────────────────────────────
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // ← add
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
    .references(() => user.id, { onDelete: "cascade" }), // ← add
  date: date("date").notNull(),
  mood: integer("mood"),
  entry: text("entry"),
  gratitude: text("gratitude"),
  intentions: text("intentions"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

export const routineItems = pgTable("routine_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  label: text("label").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  category: categoryEnum("category").notNull(), // ← now infers the union
  done: boolean("done").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
