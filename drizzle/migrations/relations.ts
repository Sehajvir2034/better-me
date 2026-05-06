import { relations } from "drizzle-orm/relations";
import { user, nutritionLogs, sleepLogs, skincareLogs, activityLogs, vitaminLogs, vitamins, journalEntries, account, waterGoals, waterLogs, haircareLogs, session, skincareProducts } from "./schema";

export const nutritionLogsRelations = relations(nutritionLogs, ({one}) => ({
	user: one(user, {
		fields: [nutritionLogs.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	nutritionLogs: many(nutritionLogs),
	sleepLogs: many(sleepLogs),
	skincareLogs: many(skincareLogs),
	activityLogs: many(activityLogs),
	vitaminLogs: many(vitaminLogs),
	journalEntries: many(journalEntries),
	accounts: many(account),
	waterGoals: many(waterGoals),
	waterLogs: many(waterLogs),
	vitamins: many(vitamins),
	haircareLogs: many(haircareLogs),
	sessions: many(session),
	skincareProducts: many(skincareProducts),
}));

export const sleepLogsRelations = relations(sleepLogs, ({one}) => ({
	user: one(user, {
		fields: [sleepLogs.userId],
		references: [user.id]
	}),
}));

export const skincareLogsRelations = relations(skincareLogs, ({one}) => ({
	user: one(user, {
		fields: [skincareLogs.userId],
		references: [user.id]
	}),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	user: one(user, {
		fields: [activityLogs.userId],
		references: [user.id]
	}),
}));

export const vitaminLogsRelations = relations(vitaminLogs, ({one}) => ({
	user: one(user, {
		fields: [vitaminLogs.userId],
		references: [user.id]
	}),
	vitamin: one(vitamins, {
		fields: [vitaminLogs.vitaminId],
		references: [vitamins.id]
	}),
}));

export const vitaminsRelations = relations(vitamins, ({one, many}) => ({
	vitaminLogs: many(vitaminLogs),
	user: one(user, {
		fields: [vitamins.userId],
		references: [user.id]
	}),
}));

export const journalEntriesRelations = relations(journalEntries, ({one}) => ({
	user: one(user, {
		fields: [journalEntries.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const waterGoalsRelations = relations(waterGoals, ({one}) => ({
	user: one(user, {
		fields: [waterGoals.userId],
		references: [user.id]
	}),
}));

export const waterLogsRelations = relations(waterLogs, ({one}) => ({
	user: one(user, {
		fields: [waterLogs.userId],
		references: [user.id]
	}),
}));

export const haircareLogsRelations = relations(haircareLogs, ({one}) => ({
	user: one(user, {
		fields: [haircareLogs.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const skincareProductsRelations = relations(skincareProducts, ({one}) => ({
	user: one(user, {
		fields: [skincareProducts.userId],
		references: [user.id]
	}),
}));