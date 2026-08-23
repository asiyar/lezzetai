import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const familyLists = mysqlTable("family_lists", {
  id: int("id").autoincrement().primaryKey(),
  inviteCode: varchar("inviteCode", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 120 }).notNull(),
  ownerName: varchar("ownerName", { length: 80 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const familyListItems = mysqlTable("family_list_items", {
  id: int("id").autoincrement().primaryKey(),
  listId: int("listId").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  checked: boolean("checked").default(false).notNull(),
  updatedBy: varchar("updatedBy", { length: 80 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FamilyList = typeof familyLists.$inferSelect;
export type FamilyListItem = typeof familyListItems.$inferSelect;
