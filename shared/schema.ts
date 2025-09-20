import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, doublePrecision, smallint, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (optional anonymous)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  supabaseId: text("supabase_id").unique(),
  anonId: text("anon_id"),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  sensitivity: jsonb("sensitivity").$type<{
    asthma?: boolean;
    copd?: boolean;
    smoker?: boolean;
    pregnant?: boolean;
    ageGroup?: 'child' | 'adult' | 'elderly';
    cardiopulmonary?: boolean;
    heartDisease?: boolean;
    diabetes?: boolean;
  }>(),
  notifications: jsonb("notifications").$type<{
    airQualityAlerts?: boolean;
    healthTips?: boolean;
    weeklyReports?: boolean;
  }>(),
  savedPlaces: jsonb("saved_places").$type<Array<{
    name: string;
    lat: number;
    lon: number;
  }>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Saved places table
export const savedPlaces = pgTable("saved_places", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // home, work, gym, school, custom
  lat: doublePrecision("lat").notNull(),
  lon: doublePrecision("lon").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Air readings table (cached external API results)
export const airReads = pgTable("air_reads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  lat: doublePrecision("lat").notNull(),
  lon: doublePrecision("lon").notNull(),
  source: text("source").notNull(), // openweather/airnow/demo
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  pm25: doublePrecision("pm25"),
  pm10: doublePrecision("pm10"),
  o3: doublePrecision("o3"),
  no2: doublePrecision("no2"),
  aqi: integer("aqi"),
  category: text("category"), // Good, Moderate, Unhealthy, etc.
  dominantPollutant: text("dominant_pollutant"), // PM2.5, O3, NO2, etc.
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Symptoms table
export const symptoms = pgTable("symptoms", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp", { withTimezone: true }).default(sql`now()`),
  label: text("label"),
  severity: smallint("severity"), // 1..5
  note: text("note"),
  aiSummary: text("ai_summary"),
  aiAction: text("ai_action"),
  aiSeverity: text("ai_severity"),
  linkedAirId: uuid("linked_air_id").references(() => airReads.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
});

// Tips table
export const tips = pgTable("tips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
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

// User interactions table (tracks user engagement with tips and resources)
export const userInteractions = pgTable("user_interactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'tip_viewed', 'resource_accessed', 'tip_helpful', etc.
  targetId: uuid("target_id").notNull(), // ID of the tip or resource
  targetType: text("target_type").notNull(), // 'tip' or 'resource'
  metadata: jsonb("metadata"), // Additional data like rating, feedback, etc.
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

export const insertUserInteractionSchema = createInsertSchema(userInteractions).omit({
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

export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;
export type UserInteraction = typeof userInteractions.$inferSelect;
