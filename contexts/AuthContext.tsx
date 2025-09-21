"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSigningIn: boolean;
  signUp: (email: string, password: string, firstName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
        }
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false on initial load or when we have a definitive state
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(false);
        }
        
        // Reset signing in state when auth state changes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setIsSigningIn(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      // If signup successful and we have a user and firstName, create profile immediately
      if (data.user && firstName) {
        try {
          // Create profile with first name using Supabase user ID directly
          await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              displayName: firstName,
              sensitivity: {
                ageGroup: 'adult',
                asthma: false,
                copd: false,
                smoker: false,
                pregnant: false,
                cardiopulmonary: false,
                heartDisease: false,
                diabetes: false
              },
              notifications: {
                airQualityAlerts: true,
                healthTips: true,
                weeklyReports: true
              },
              isCompleted: false
            })
          });
        } catch (profileError) {
          console.warn('Failed to create profile during signup:', profileError);
          // Don't fail signup if profile creation fails
        }
      }
      
      return { error };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        error: { message: "An unexpected error occurred during sign up" },
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        error: { message: "An unexpected error occurred during sign in" },
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsSigningIn(true);
      
      // Get the current origin and port
      const currentOrigin = window.location.origin;
      console.log("OAuth redirect to:", `${currentOrigin}/dashboard`);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${currentOrigin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error("OAuth error:", error);
        setIsSigningIn(false);
        return { error };
      }
      
      // Don't reset isSigningIn here - let the auth state change handler do it
      // This prevents the loading state from flickering during OAuth redirect
      return { error: null };
    } catch (error) {
      console.error("Google sign in error:", error);
      setIsSigningIn(false);
      return {
        error: {
          message: "An unexpected error occurred during Google sign in",
        },
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    isSigningIn,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
