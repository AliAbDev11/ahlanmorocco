import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface GuestProfile {
  id: string;
  full_name: string;
  room_number: string;
  phone_number: string | null;
  check_in_date: string;
  check_out_date: string;
  is_active: boolean | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchGuestProfile(session.user.id);
          }, 0);
        } else {
          setGuestProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchGuestProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchGuestProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching guest profile:", error);
        return;
      }

      setGuestProfile(data);
    } catch (error) {
      console.error("Error fetching guest profile:", error);
    }
  };

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
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setGuestProfile(null);
      // Clear any legacy localStorage
      localStorage.removeItem("hotelGuest");
    }
    return { error };
  };

  return {
    user,
    session,
    guestProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session,
  };
};
