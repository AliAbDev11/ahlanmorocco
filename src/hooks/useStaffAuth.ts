import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface StaffMember {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  role: string;
  department: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at: string | null;
}

export const useStaffAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer the staff check to avoid deadlock
          setTimeout(() => {
            checkStaffStatus(session.user.id, session.user.email);
          }, 0);
        } else {
          setStaff(null);
          setIsStaff(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkStaffStatus(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkStaffStatus = async (userId: string, userEmail?: string) => {
    try {
      // First try to find staff by user_id
      let { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error checking staff status by user_id:", error);
      }

      // If not found by user_id, try by email and link the account
      if (!data && userEmail) {
        const { data: emailData, error: emailError } = await supabase
          .from("staff")
          .select("*")
          .eq("email", userEmail)
          .eq("is_active", true)
          .maybeSingle();

        if (emailError) {
          console.error("Error checking staff status by email:", emailError);
        } else if (emailData) {
          // Found by email - update the user_id to link the accounts
          const { error: updateError } = await supabase
            .from("staff")
            .update({ user_id: userId })
            .eq("id", emailData.id);

          if (updateError) {
            console.error("Error linking staff account:", updateError);
          } else {
            console.log("Staff account linked successfully");
          }
          
          data = { ...emailData, user_id: userId };
        }
      }

      if (data) {
        setStaff(data);
        setIsStaff(true);
      } else {
        setIsStaff(false);
        setStaff(null);
      }
    } catch (err) {
      console.error("Error in checkStaffStatus:", err);
      setIsStaff(false);
      setStaff(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setStaff(null);
      setIsStaff(false);
    }
    return { error };
  };

  return {
    user,
    session,
    staff,
    loading,
    isStaff,
    signIn,
    signOut,
  };
};
