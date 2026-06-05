import { pgTable, foreignKey, serial, date, text, real, timestamp, integer, jsonb, boolean, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const routineCategory = pgEnum("routine_category", ['vitamins', 'skincare', 'haircare', 'nutrition', 'exercise'])
export const supplementStatus = pgEnum("supplement_status", ['taken', 'skipped'])
export const supplementTime = pgEnum("supplement_time", ['morning', 'afternoon', 'evening', 'night'])


export const nutritionLogs = pgTable("nutrition_logs", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	mealType: text("meal_type"),
	foodName: text("food_name").notNull(),
	calories: real(),
	protein: real(),
	carbs: real(),
	fat: real(),
	fiber: real(),
	notes: text(),
	loggedAt: timestamp("logged_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "nutrition_logs_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const sleepLogs = pgTable("sleep_logs", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	bedtime: timestamp({ mode: 'string' }),
	wakeTime: timestamp("wake_time", { mode: 'string' }),
	durationMinutes: integer("duration_minutes"),
	quality: integer(),
	notes: text(),
	loggedAt: timestamp("logged_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "sleep_logs_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const skincareLogs = pgTable("skincare_logs", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	timeOfDay: text("time_of_day"),
	productsUsed: jsonb("products_used"),
	notes: text(),
	loggedAt: timestamp("logged_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "skincare_logs_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const activityLogs = pgTable("activity_logs", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	activityType: text("activity_type").notNull(),
	durationMinutes: integer("duration_minutes"),
	caloriesBurned: real("calories_burned"),
	notes: text(),
	loggedAt: timestamp("logged_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "activity_logs_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const vitaminLogs = pgTable("vitamin_logs", {
	id: serial().primaryKey().notNull(),
	vitaminId: integer("vitamin_id").notNull(),
	takenAt: timestamp("taken_at", { mode: 'string' }).defaultNow(),
	date: date().notNull(),
	userId: text("user_id").notNull(),
	status: supplementStatus().default('taken').notNull(),
	note: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "vitamin_logs_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.vitaminId],
			foreignColumns: [vitamins.id],
			name: "vitamin_logs_vitamin_id_vitamins_id_fk"
		}).onDelete("cascade"),
]);

export const journalEntries = pgTable("journal_entries", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	mood: integer(),
	entry: text(),
	gratitude: text(),
	intentions: text(),
	loggedAt: timestamp("logged_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "journal_entries_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}),
]);

export const waterGoals = pgTable("water_goals", {
	id: serial().primaryKey().notNull(),
	dailyGoalMl: integer("daily_goal_ml").default(2500).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "water_goals_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const waterLogs = pgTable("water_logs", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	amountMl: integer("amount_ml").notNull(),
	loggedAt: timestamp("logged_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "water_logs_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const vitamins = pgTable("vitamins", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	dosage: text(),
	frequency: text().default('daily').notNull(),
	timeOfDay: supplementTime("time_of_day").default('morning').notNull(),
	notes: text(),
	active: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull(),
	unit: text(),
	category: text(),
	color: text(),
	withFood: boolean("with_food").default(false),
	reminderTime: text("reminder_time"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "vitamins_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const haircareLogs = pgTable("haircare_logs", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	activity: text().notNull(),
	productsUsed: text("products_used"),
	notes: text(),
	loggedAt: timestamp("logged_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "haircare_logs_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const routineItems = pgTable("routine_items", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	label: text().notNull(),
	scheduledTime: text("scheduled_time").notNull(),
	category: routineCategory().notNull(),
	done: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	token: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}),
	unique("session_token_unique").on(table.token),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const skincareProducts = pgTable("skincare_products", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	category: text(),
	amPm: text("am_pm"),
	active: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "skincare_products_user_id_user_id_fk"
		}).onDelete("cascade"),
]);
