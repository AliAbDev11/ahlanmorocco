import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface StaffInfo {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  department: string | null;
}

export const useStaffAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkStaffRole(session.user.id);
          }, 0);
        } else {
          setIsStaff(false);
          setStaffInfo(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkStaffRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkStaffRole = async (userId: string) => {
    try {
      // Check user_roles table for staff role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['admin', 'staff', 'manager']);
      
      if (roleError) {
        console.error('Error checking role:', roleError);
        setIsStaff(false);
        setLoading(false);
        return;
      }

      if (roleData && roleData.length > 0) {
        setIsStaff(true);
        
        // Get staff info
        const { data: staffData } = await supabase
          .from('staff')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (staffData) {
          setStaffInfo(staffData);
        }
      } else {
        setIsStaff(false);
      }
    } catch (error) {
      console.error('Error in checkStaffRole:', error);
      setIsStaff(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsStaff(false);
    setStaffInfo(null);
  };

  return {
    user,
    session,
    staffInfo,
    isStaff,
    loading,
    signOut
  };
};
