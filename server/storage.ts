import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, desc, asc, gt } from "drizzle-orm";
import { 
  users, profiles, airReads, symptoms, tips, resources, savedPlaces,
  type User, type InsertUser, type Profile, type InsertProfile,
  type AirRead, type InsertAirRead, type Symptom, type InsertSymptom,
  type Tip, type InsertTip, type Resource, type InsertResource,
  type SavedPlace, type InsertSavedPlace
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByAnonId(anonId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile | undefined>;

  // Air reads
  getRecentAirRead(lat: number, lon: number, maxAgeMinutes?: number): Promise<AirRead | undefined>;
  createAirRead(airRead: InsertAirRead): Promise<AirRead>;
  getAirReadsForTimeline(lat: number, lon: number, days?: number): Promise<AirRead[]>;

  // Symptoms
  getSymptoms(userId: string, limit?: number): Promise<Symptom[]>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  getSymptomsForTimeline(userId: string, days?: number): Promise<Symptom[]>;

  // Tips & Resources
  getTips(tag?: string): Promise<Tip[]>;
  getResources(type?: string): Promise<Resource[]>;
  seedInitialData(): Promise<void>;

  // Saved places
  getSavedPlaces(userId: string): Promise<SavedPlace[]>;
  createSavedPlace(savedPlace: InsertSavedPlace): Promise<SavedPlace>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByAnonId(anonId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.anonId, anonId)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const result = await db.update(profiles)
      .set(updates)
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async getRecentAirRead(lat: number, lon: number, maxAgeMinutes = 10): Promise<AirRead | undefined> {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    const result = await db.select().from(airReads)
      .where(and(
        eq(airReads.lat, lat),
        eq(airReads.lon, lon),
        gt(airReads.timestamp, cutoff)
      ))
      .orderBy(desc(airReads.timestamp))
      .limit(1);
    return result[0];
  }

  async createAirRead(airRead: InsertAirRead): Promise<AirRead> {
    const result = await db.insert(airReads).values(airRead).returning();
    return result[0];
  }

  async getAirReadsForTimeline(lat: number, lon: number, days = 7): Promise<AirRead[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db.select().from(airReads)
      .where(and(
        eq(airReads.lat, lat),
        eq(airReads.lon, lon),
        gt(airReads.timestamp, cutoff)
      ))
      .orderBy(asc(airReads.timestamp));
  }

  async getSymptoms(userId: string, limit = 50): Promise<Symptom[]> {
    return await db.select().from(symptoms)
      .where(eq(symptoms.userId, userId))
      .orderBy(desc(symptoms.timestamp))
      .limit(limit);
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const result = await db.insert(symptoms).values(symptom).returning();
    return result[0];
  }

  async getSymptomsForTimeline(userId: string, days = 7): Promise<Symptom[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await db.select().from(symptoms)
      .where(and(
        eq(symptoms.userId, userId),
        gt(symptoms.timestamp, cutoff)
      ))
      .orderBy(asc(symptoms.timestamp));
  }

  async getTips(tag?: string): Promise<Tip[]> {
    if (tag) {
      return await db.select().from(tips).where(eq(tips.tag, tag));
    }
    return await db.select().from(tips);
  }

  async getResources(type?: string): Promise<Resource[]> {
    if (type) {
      return await db.select().from(resources).where(eq(resources.type, type));
    }
    return await db.select().from(resources);
  }

  async getSavedPlaces(userId: string): Promise<SavedPlace[]> {
    return await db.select().from(savedPlaces)
      .where(eq(savedPlaces.userId, userId))
      .orderBy(asc(savedPlaces.name));
  }

  async createSavedPlace(savedPlace: InsertSavedPlace): Promise<SavedPlace> {
    const result = await db.insert(savedPlaces).values(savedPlace).returning();
    return result[0];
  }

  async seedInitialData(): Promise<void> {
    // Seed tips
    const tipData = [
      { tag: "asthma", content: "Use an air purifier indoors and keep windows closed during high pollution days." },
      { tag: "pregnancy", content: "Pregnant individuals should limit outdoor activities when AQI exceeds 100." },
      { tag: "exercise", content: "Avoid outdoor exercise when PM2.5 levels are above 35 μg/m³." },
      { tag: "general", content: "Check air quality before planning outdoor activities." },
    ];

    for (const tip of tipData) {
      try {
        await db.insert(tips).values(tip).onConflictDoNothing();
      } catch (error) {
        // Ignore conflicts
      }
    }

    // Seed resources
    const resourceData = [
      {
        title: "Campus Health Center",
        type: "clinic",
        tags: ["health", "emergency"],
        phone: "(555) 012-3456",
        url: null,
      },
      {
        title: "Emergency Services",
        type: "emergency",
        tags: ["emergency", "crisis"],
        phone: "911",
        url: null,
      },
      {
        title: "Crisis Text Line",
        type: "hotline",
        tags: ["crisis", "mental-health"],
        phone: "988",
        url: "https://988lifeline.org",
      },
      {
        title: "Air Quality Tips",
        type: "education",
        tags: ["air-quality", "health"],
        phone: null,
        url: "https://www.airnow.gov/aqi/aqi-basics/",
      },
    ];

    for (const resource of resourceData) {
      try {
        await db.insert(resources).values(resource).onConflictDoNothing();
      } catch (error) {
        // Ignore conflicts
      }
    }
  }
}

export const storage = new DatabaseStorage();
