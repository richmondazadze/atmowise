import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, doublePrecision, smallint, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (optional anonymous)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  anonId: text("anon_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  sensitivity: jsonb("sensitivity").$type<{
    asthma?: boolean;
    pregnant?: boolean;
    ageGroup?: string;
    cardiopulmonary?: boolean;
  }>(),
  savedPlaces: jsonb("saved_places").$type<Array<{
    name: string;
    lat: number;
    lon: number;
  }>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Air readings table (cached external API results)
export const airReads = pgTable("air_reads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  lat: doublePrecision("lat"),
  lon: doublePrecision("lon"),
  source: text("source"), // openaq/openweather/airnow
  timestamp: timestamp("timestamp", { withTimezone: true }),
  pm25: doublePrecision("pm25"),
  pm10: doublePrecision("pm10"),
  o3: doublePrecision("o3"),
  no2: doublePrecision("no2"),
  aqi: integer("aqi"),
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Symptoms table
export const symptoms = pgTable("symptoms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  timestamp: timestamp("timestamp", { withTimezone: true }).default(sql`now()`),
  label: text("label"),
  severity: smallint("severity"), // 1..5
  note: text("note"),
  aiSummary: text("ai_summary"),
  aiAction: text("ai_action"),
  aiSeverity: text("ai_severity"),
  linkedAirId: uuid("linked_air_id").references(() => airReads.id),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Tips table
export const tips = pgTable("tips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tag: text("tag"),
  content: text("content"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Resources table
export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title"),
  type: text("type"),
  tags: text("tags").array(),
  url: text("url"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Saved places table (optional normalized)
export const savedPlaces = pgTable("saved_places", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name"),
  lat: doublePrecision("lat"),
  lon: doublePrecision("lon"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
});

export const insertAirReadSchema = createInsertSchema(airReads).omit({
  id: true,
  createdAt: true,
});

export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
  createdAt: true,
  timestamp: true,
});

export const insertTipSchema = createInsertSchema(tips).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

export const insertSavedPlaceSchema = createInsertSchema(savedPlaces).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertAirRead = z.infer<typeof insertAirReadSchema>;
export type AirRead = typeof airReads.$inferSelect;

export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;

export type InsertTip = z.infer<typeof insertTipSchema>;
export type Tip = typeof tips.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertSavedPlace = z.infer<typeof insertSavedPlaceSchema>;
export type SavedPlace = typeof savedPlaces.$inferSelect;
