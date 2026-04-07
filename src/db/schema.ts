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
} from "drizzle-orm/pg-core";

// ── Vitamins ──────────────────────────────────────────────
export const vitamins = pgTable("vitamins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency").notNull(), // daily, weekly, etc.
  timeOfDay: text("time_of_day"), // morning, evening, with meal
  notes: text("notes"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vitaminLogs = pgTable("vitamin_logs", {
  id: serial("id").primaryKey(),
  vitaminId: integer("vitamin_id").references(() => vitamins.id),
  takenAt: timestamp("taken_at").defaultNow(),
  date: date("date").notNull(),
});

// ── Nutrition ─────────────────────────────────────────────
export const nutritionLogs = pgTable("nutrition_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  mealType: text("meal_type"), // breakfast, lunch, dinner, snack
  foodName: text("food_name").notNull(),
  calories: real("calories"),
  protein: real("protein"), // grams
  carbs: real("carbs"), // grams
  fat: real("fat"), // grams
  fiber: real("fiber"), // grams
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Water ─────────────────────────────────────────────────
export const waterLogs = pgTable("water_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  amountMl: integer("amount_ml").notNull(),
  loggedAt: timestamp("logged_at").defaultNow(),
});

export const waterGoals = pgTable("water_goals", {
  id: serial("id").primaryKey(),
  dailyGoalMl: integer("daily_goal_ml").notNull().default(2500),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ── Skin Care ─────────────────────────────────────────────
export const skincareProducts = pgTable("skincare_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"), // cleanser, moisturizer, serum, etc.
  amPm: text("am_pm"), // AM, PM, both
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skincareLogs = pgTable("skincare_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  timeOfDay: text("time_of_day"), // AM, PM
  productsUsed: jsonb("products_used"), // array of product IDs
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Hair Care ─────────────────────────────────────────────
export const haircareLogs = pgTable("haircare_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  activity: text("activity").notNull(), // wash, oil, trim, mask
  productsUsed: text("products_used"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Sleep ─────────────────────────────────────────────────
export const sleepLogs = pgTable("sleep_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  bedtime: timestamp("bedtime"),
  wakeTime: timestamp("wake_time"),
  durationMinutes: integer("duration_minutes"),
  quality: integer("quality"), // 1–5 scale
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Physical Activity ─────────────────────────────────────
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  activityType: text("activity_type").notNull(), // calisthenics, run, walk, etc.
  durationMinutes: integer("duration_minutes"),
  caloriesBurned: real("calories_burned"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ── Mindset Journal ───────────────────────────────────────
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  mood: integer("mood"), // 1–5 scale
  entry: text("entry"),
  gratitude: text("gratitude"),
  intentions: text("intentions"),
  loggedAt: timestamp("logged_at").defaultNow(),
});
