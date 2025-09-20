import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (we'll generate these later)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          anon_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          anon_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          anon_id?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          sensitivity: any;
          saved_places: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          sensitivity?: any;
          saved_places?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          sensitivity?: any;
          saved_places?: any;
          created_at?: string;
        };
      };
      air_reads: {
        Row: {
          id: string;
          lat: number | null;
          lon: number | null;
          source: string | null;
          timestamp: string | null;
          pm25: number | null;
          pm10: number | null;
          o3: number | null;
          no2: number | null;
          aqi: number | null;
          raw_payload: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          lat?: number | null;
          lon?: number | null;
          source?: string | null;
          timestamp?: string | null;
          pm25?: number | null;
          pm10?: number | null;
          o3?: number | null;
          no2?: number | null;
          aqi?: number | null;
          raw_payload?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          lat?: number | null;
          lon?: number | null;
          source?: string | null;
          timestamp?: string | null;
          pm25?: number | null;
          pm10?: number | null;
          o3?: number | null;
          no2?: number | null;
          aqi?: number | null;
          raw_payload?: any;
          created_at?: string;
        };
      };
      symptoms: {
        Row: {
          id: string;
          user_id: string | null;
          timestamp: string;
          label: string | null;
          severity: number | null;
          note: string | null;
          ai_summary: string | null;
          ai_action: string | null;
          ai_severity: string | null;
          linked_air_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          timestamp?: string;
          label?: string | null;
          severity?: number | null;
          note?: string | null;
          ai_summary?: string | null;
          ai_action?: string | null;
          ai_severity?: string | null;
          linked_air_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          timestamp?: string;
          label?: string | null;
          severity?: number | null;
          note?: string | null;
          ai_summary?: string | null;
          ai_action?: string | null;
          ai_severity?: string | null;
          linked_air_id?: string | null;
          created_at?: string;
        };
      };
      tips: {
        Row: {
          id: string;
          tag: string | null;
          content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tag?: string | null;
          content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tag?: string | null;
          content?: string | null;
          created_at?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          title: string | null;
          type: string | null;
          tags: string[] | null;
          url: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title?: string | null;
          type?: string | null;
          tags?: string[] | null;
          url?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string | null;
          type?: string | null;
          tags?: string[] | null;
          url?: string | null;
          phone?: string | null;
          created_at?: string;
        };
      };
      saved_places: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          lat: number | null;
          lon: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          lat?: number | null;
          lon?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          lat?: number | null;
          lon?: number | null;
          created_at?: string;
        };
      };
    };
  };
};
