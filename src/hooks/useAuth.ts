import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface GuestSession {
  guestId: string;
  fullName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  token: string;
  authenticatedAt: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for guest session in localStorage first
    const storedGuestSession = localStorage.getItem("guestSession");
    if (storedGuestSession) {
      try {
        const parsed = JSON.parse(storedGuestSession) as GuestSession;
        setGuestSession(parsed);
        setLoading(false);
        return; // Guest session found, no need to check Supabase auth
      } catch (e) {
        console.error("Error parsing guest session:", e);
        localStorage.removeItem("guestSession");
      }
    }

    // Set up auth state listener for Supabase users
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    // Clear guest session
    localStorage.removeItem("guestSession");
    setGuestSession(null);
    
    // Sign out from Supabase if there's a session
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  // Helper to check if user is authenticated (either Supabase or guest)
  const isAuthenticated = Boolean(user || guestSession);

  return {
    user,
    session,
    guestSession,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  };
};
