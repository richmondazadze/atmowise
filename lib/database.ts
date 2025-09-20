import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, desc, asc, gt } from "drizzle-orm";
import { 
  users, profiles, airReads, symptoms, tips, resources, savedPlaces, userInteractions,
  type User, type InsertUser, type Profile, type InsertProfile,
  type AirRead, type InsertAirRead, type Symptom, type InsertSymptom,
  type Tip, type InsertTip, type Resource, type InsertResource,
  type SavedPlace, type InsertSavedPlace, type UserInteraction, type InsertUserInteraction
} from "@/shared/schema";

// Database connection will be initialized lazily
let sql: any = null;
let db: any = null;

function getDatabase() {
  if (!sql || !db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    console.log('🔗 Initializing database connection...');
    sql = postgres(connectionString, { max: 1 });
    db = drizzle(sql);
  }
  return { sql, db };
}

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
  getRecentAirRead(userId: string, lat: number, lon: number, maxAgeMinutes?: number): Promise<AirRead | undefined>;
  createAirRead(airRead: InsertAirRead): Promise<AirRead>;
  getAirReadsForTimeline(userId: string, lat: number, lon: number, days?: number): Promise<AirRead[]>;
  getAirReadsByUser(userId: string, limit?: number): Promise<AirRead[]>;

  // Symptoms
  getSymptoms(userId: string, limit?: number): Promise<Symptom[]>;
  getSymptomsByUser(userId: string | null, limit?: number): Promise<Symptom[]>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  updateSymptom(symptomId: string, updates: Partial<InsertSymptom>): Promise<Symptom | undefined>;
  updateSymptomAI(symptomId: string, aiData: { aiSummary?: string; aiAction?: string; aiSeverity?: string }): Promise<Symptom | undefined>;
  getSymptomsForTimeline(userId: string, days?: number): Promise<Symptom[]>;

  // Tips & Resources
  getTips(tag?: string): Promise<Tip[]>;
  getResources(type?: string): Promise<Resource[]>;
  seedInitialData(): Promise<void>;

  // Saved places
  getSavedPlaces(userId: string): Promise<SavedPlace[]>;
  createSavedPlace(savedPlace: InsertSavedPlace): Promise<SavedPlace>;
  deleteSavedPlace(placeId: string): Promise<SavedPlace | undefined>;

  // User interactions
  createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction>;
  getUserInteractions(userId: string, type?: string, limit?: number): Promise<UserInteraction[]>;
  getUserInteractionStats(userId: string): Promise<{ tipViews: number; resourceAccesses: number; helpfulTips: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { db } = getDatabase();
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByAnonId(anonId: string): Promise<User | undefined> {
    const { db } = getDatabase();
    const result = await db.select().from(users).where(eq(users.anonId, anonId)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const { db } = getDatabase();
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const { db } = getDatabase();
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const { db } = getDatabase();
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const { db } = getDatabase();
    const result = await db.update(profiles).set(updates).where(eq(profiles.userId, userId)).returning();
    return result[0];
  }

  async getRecentAirRead(userId: string, lat: number, lon: number, maxAgeMinutes = 60): Promise<AirRead | undefined> {
    const { db } = getDatabase();
    const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    
    const result = await db
      .select()
      .from(airReads)
      .where(
        and(
          eq(airReads.userId, userId),
          eq(airReads.lat, lat),
          eq(airReads.lon, lon),
          gt(airReads.timestamp, cutoffTime)
        )
      )
      .orderBy(desc(airReads.timestamp))
      .limit(1);
    
    return result[0];
  }

  async createAirRead(airRead: InsertAirRead): Promise<AirRead> {
    const { db } = getDatabase();
    const result = await db.insert(airReads).values(airRead).returning();
    return result[0];
  }

  async getAirReadsForTimeline(userId: string, lat: number, lon: number, days = 7): Promise<AirRead[]> {
    const { db } = getDatabase();
    const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await db
      .select()
      .from(airReads)
      .where(
        and(
          eq(airReads.userId, userId),
          eq(airReads.lat, lat),
          eq(airReads.lon, lon),
          gt(airReads.timestamp, cutoffTime)
        )
      )
      .orderBy(asc(airReads.timestamp));
    
    return result;
  }

  async getAirReadsByUser(userId: string, limit = 50): Promise<AirRead[]> {
    const { db } = getDatabase();
    const result = await db
      .select()
      .from(airReads)
      .where(eq(airReads.userId, userId))
      .orderBy(desc(airReads.timestamp))
      .limit(limit);
    
    return result;
  }

  async getSymptoms(userId: string, limit = 50): Promise<Symptom[]> {
    const { db } = getDatabase();
    const result = await db
      .select()
      .from(symptoms)
      .where(eq(symptoms.userId, userId))
      .orderBy(desc(symptoms.timestamp))
      .limit(limit);
    
    return result;
  }

  async getSymptomsByUser(userId: string | null, limit = 50): Promise<Symptom[]> {
    const { db } = getDatabase();
    let query = db.select().from(symptoms);
    
    if (userId) {
      query = query.where(eq(symptoms.userId, userId));
    }
    
    const result = await query
      .orderBy(desc(symptoms.timestamp))
      .limit(limit);
    
    return result;
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const { db } = getDatabase();
    const result = await db.insert(symptoms).values(symptom).returning();
    return result[0];
  }

  async updateSymptom(symptomId: string, updates: Partial<InsertSymptom>): Promise<Symptom | undefined> {
    const { db } = getDatabase();
    const result = await db.update(symptoms).set(updates).where(eq(symptoms.id, symptomId)).returning();
    return result[0];
  }

  async updateSymptomAI(symptomId: string, aiData: { aiSummary?: string; aiAction?: string; aiSeverity?: string }): Promise<Symptom | undefined> {
    const { db } = getDatabase();
    const result = await db.update(symptoms).set(aiData).where(eq(symptoms.id, symptomId)).returning();
    return result[0];
  }

  async getSymptomsForTimeline(userId: string, days = 7): Promise<Symptom[]> {
    const { db } = getDatabase();
    const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await db
      .select()
      .from(symptoms)
      .where(
        and(
          eq(symptoms.userId, userId),
          gt(symptoms.timestamp, cutoffTime)
        )
      )
      .orderBy(asc(symptoms.timestamp));
    
    return result;
  }

  async getTips(tag?: string): Promise<Tip[]> {
    const { db } = getDatabase();
    let query = db.select().from(tips);
    
    if (tag) {
      query = query.where(eq(tips.tag, tag));
    }
    
    return await query;
  }

  async getResources(type?: string): Promise<Resource[]> {
    const { db } = getDatabase();
    let query = db.select().from(resources);
    
    if (type) {
      query = query.where(eq(resources.type, type));
    }
    
    return await query;
  }

  async getSavedPlaces(userId: string): Promise<SavedPlace[]> {
    const { db } = getDatabase();
    const result = await db
      .select()
      .from(savedPlaces)
      .where(eq(savedPlaces.userId, userId))
      .orderBy(desc(savedPlaces.createdAt));
    
    return result;
  }

  async createSavedPlace(savedPlace: InsertSavedPlace): Promise<SavedPlace> {
    const { db } = getDatabase();
    const result = await db.insert(savedPlaces).values(savedPlace).returning();
    return result[0];
  }

  async deleteSavedPlace(placeId: string): Promise<SavedPlace | undefined> {
    const { db } = getDatabase();
    const result = await db.delete(savedPlaces).where(eq(savedPlaces.id, placeId)).returning();
    return result[0];
  }

  async createUserInteraction(interaction: InsertUserInteraction): Promise<UserInteraction> {
    const { db } = getDatabase();
    const result = await db.insert(userInteractions).values(interaction).returning();
    return result[0];
  }

  async getUserInteractions(userId: string, type?: string, limit = 50): Promise<UserInteraction[]> {
    const { db } = getDatabase();
    let query = db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.userId, userId))
      .orderBy(desc(userInteractions.createdAt))
      .limit(limit);
    
    if (type) {
      query = query.where(and(eq(userInteractions.userId, userId), eq(userInteractions.type, type)));
    }
    
    const result = await query;
    return result;
  }

  async getUserInteractionStats(userId: string): Promise<{ tipViews: number; resourceAccesses: number; helpfulTips: number }> {
    const { db } = getDatabase();
    
    const [tipViews, resourceAccesses, helpfulTips] = await Promise.all([
      db.select().from(userInteractions).where(and(eq(userInteractions.userId, userId), eq(userInteractions.type, 'tip_viewed'))),
      db.select().from(userInteractions).where(and(eq(userInteractions.userId, userId), eq(userInteractions.type, 'resource_accessed'))),
      db.select().from(userInteractions).where(and(eq(userInteractions.userId, userId), eq(userInteractions.type, 'tip_helpful')))
    ]);
    
    return {
      tipViews: tipViews.length,
      resourceAccesses: resourceAccesses.length,
      helpfulTips: helpfulTips.length
    };
  }

  async seedInitialData(): Promise<void> {
    const { db } = getDatabase();
    
    // Check if data already exists
    const existingTips = await db.select().from(tips).limit(1);
    if (existingTips.length > 0) {
      return; // Data already seeded
    }

    // Seed tips
    const tipsData: InsertTip[] = [
      { tag: "air-quality", content: "Check air quality before outdoor activities" },
      { tag: "health", content: "Wear masks during high pollution days" },
      { tag: "indoor", content: "Use air purifiers in your home" },
      { tag: "exercise", content: "Avoid outdoor exercise when AQI is above 100" },
    ];

    await db.insert(tips).values(tipsData);

    // Seed resources
    const resourcesData: InsertResource[] = [
      {
        title: "Emergency Services",
        type: "emergency",
        tags: ["emergency", "crisis"],
        phone: "911",
      },
      {
        title: "Crisis Text Line",
        type: "hotline",
        tags: ["crisis", "mental-health"],
        url: "https://988lifeline.org",
        phone: "988",
      },
      {
        title: "Air Quality Tips",
        type: "education",
        tags: ["air-quality", "health"],
        url: "https://www.airnow.gov/aqi/aqi-basics/",
      },
    ];

    await db.insert(resources).values(resourcesData);
  }
}

export const storage = new DatabaseStorage();
