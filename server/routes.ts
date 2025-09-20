import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { insertSymptomSchema, insertProfileSchema } from "@shared/schema";
import { z } from "zod";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize database with seed data
  await storage.seedInitialData();

  // Get air quality data
  app.get("/api/air", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "lat and lon parameters required" });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);

      // Check cache first
      const cached = await storage.getRecentAirRead(latitude, longitude, 10);
      if (cached) {
        return res.json(cached);
      }

      // Fetch from OpenWeather API
      const owKey = process.env.OPENWEATHER_API_KEY || process.env.OW_API_KEY || "default_key";
      const owResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${owKey}`
      );

      if (!owResponse.ok) {
        // Fallback to OpenAQ
        const oaqResponse = await fetch(
          `https://api.openaq.org/v2/latest?coordinates=${latitude},${longitude}&radius=10000&parameter=pm25,pm10,no2,o3`
        );
        
        if (!oaqResponse.ok) {
          return res.status(500).json({ error: "Failed to fetch air quality data" });
        }

        const oaqData = await oaqResponse.json();
        const measurements = oaqData.results?.[0]?.measurements || [];
        
        const normalized = {
          lat: latitude,
          lon: longitude,
          source: "openaq",
          timestamp: new Date(),
          pm25: measurements.find((m: any) => m.parameter === "pm25")?.value || null,
          pm10: measurements.find((m: any) => m.parameter === "pm10")?.value || null,
          o3: measurements.find((m: any) => m.parameter === "o3")?.value || null,
          no2: measurements.find((m: any) => m.parameter === "no2")?.value || null,
          aqi: null,
          rawPayload: oaqData,
        };

        const saved = await storage.createAirRead(normalized);
        return res.json(saved);
      }

      const owData = await owResponse.json();
      const components = owData.list?.[0]?.components || {};
      const main = owData.list?.[0]?.main || {};

      const normalized = {
        lat: latitude,
        lon: longitude,
        source: "openweather",
        timestamp: new Date(),
        pm25: components.pm2_5 || null,
        pm10: components.pm10 || null,
        o3: components.o3 || null,
        no2: components.no2 || null,
        aqi: main.aqi || null,
        rawPayload: owData,
      };

      const saved = await storage.createAirRead(normalized);
      res.json(saved);

    } catch (error) {
      console.error("Air quality fetch error:", error);
      res.status(500).json({ error: "Failed to fetch air quality data" });
    }
  });

  // LLM reflection endpoint
  app.post("/api/llm/reflection", async (req, res) => {
    try {
      const { note, pm25, aqi, sensitivity } = req.body;

      if (!note) {
        return res.status(400).json({ error: "note is required" });
      }

      // Emergency regex check
      const emergencyRegex = /(can't breathe|cannot breathe|chest pain|chest tight|faint|passing out|severe shortness of breath|call 911|call emergency)/i;
      const isEmergency = emergencyRegex.test(note);

      if (isEmergency) {
        return res.json({
          summary: "This may be an emergency situation.",
          action: "Seek immediate medical attention or call emergency services.",
          severity: "high",
          explainers: "Emergency keywords detected in your symptoms."
        });
      }

      const systemPrompt = `You are a concise, empathetic, safety-first health assistant. NEVER give a medical diagnosis. If the input text indicates an emergency (e.g., 'can't breathe', 'chest pain'), respond with severity:'high' and an instruction to seek immediate medical attention. Return only valid JSON with keys: summary, action, severity, explainers.`;
      
      const userPrompt = `note="${note}", pm25=${pm25 || 'unknown'}, aqi=${aqi || 'unknown'}, sensitivity=${JSON.stringify(sensitivity || {})}`;

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 200,
      });

      const content = response.choices[0].message.content;
      let parsed;
      
      try {
        parsed = JSON.parse(content || "{}");
      } catch (parseError) {
        // Fallback response
        const severityLevel = pm25 && pm25 > 55 ? "moderate" : "low";
        parsed = {
          summary: "Your symptoms have been noted.",
          action: "Monitor your condition and consider staying indoors if air quality is poor.",
          severity: severityLevel,
          explainers: "AI analysis unavailable, showing general guidance."
        };
      }

      res.json(parsed);

    } catch (error) {
      console.error("LLM reflection error:", error);
      
      // Fallback canned response
      const fallback = {
        summary: "Your symptoms have been logged.",
        action: "Consider consulting a healthcare provider if symptoms persist.",
        severity: "moderate",
        explainers: "AI service temporarily unavailable."
      };
      
      res.json(fallback);
    }
  });

  // User profile endpoints
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Create profile error:", error);
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  app.put("/api/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Validate and sanitize the updates
      const updateData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(userId, updateData);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Symptoms endpoints
  app.get("/api/symptoms/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const symptoms = await storage.getSymptoms(userId);
      res.json(symptoms);
    } catch (error) {
      console.error("Get symptoms error:", error);
      res.status(500).json({ error: "Failed to get symptoms" });
    }
  });

  app.post("/api/symptoms", async (req, res) => {
    try {
      const symptomData = insertSymptomSchema.parse(req.body);
      const symptom = await storage.createSymptom(symptomData);
      res.json(symptom);
    } catch (error) {
      console.error("Create symptom error:", error);
      res.status(400).json({ error: "Invalid symptom data" });
    }
  });

  // Timeline data endpoint
  app.get("/api/timeline/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { lat, lon, days = 7 } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "lat and lon parameters required" });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const numDays = parseInt(days as string);

      const [airData, symptomData] = await Promise.all([
        storage.getAirReadsForTimeline(latitude, longitude, numDays),
        storage.getSymptomsForTimeline(userId, numDays)
      ]);

      res.json({ airData, symptomData });
    } catch (error) {
      console.error("Timeline data error:", error);
      res.status(500).json({ error: "Failed to get timeline data" });
    }
  });

  // Resources endpoint
  app.get("/api/resources", async (req, res) => {
    try {
      const { type } = req.query;
      const resources = await storage.getResources(type as string);
      res.json(resources);
    } catch (error) {
      console.error("Get resources error:", error);
      res.status(500).json({ error: "Failed to get resources" });
    }
  });

  // Create anonymous user
  app.post("/api/user/anonymous", async (req, res) => {
    try {
      const anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const user = await storage.createUser({ anonId });
      res.json(user);
    } catch (error) {
      console.error("Create anonymous user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
