import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface ManagerInfo {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  department: string | null;
  phone_number: string | null;
}

export const useManagerAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [managerInfo, setManagerInfo] = useState<ManagerInfo | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkManagerRole(session.user.id);
          }, 0);
        } else {
          setIsManager(false);
          setManagerInfo(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkManagerRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkManagerRole = async (userId: string) => {
    try {
      // Check user_roles table for manager or admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .in('role', ['admin', 'manager']);
      
      if (roleError) {
        console.error('Error checking role:', roleError);
        setIsManager(false);
        setLoading(false);
        return;
      }

      if (roleData && roleData.length > 0) {
        setIsManager(true);
        
        // Get staff info (managers are also in staff table)
        const { data: staffData } = await supabase
          .from('staff')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (staffData) {
          setManagerInfo(staffData);
        }
      } else {
        setIsManager(false);
      }
    } catch (error) {
      console.error('Error in checkManagerRole:', error);
      setIsManager(false);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsManager(false);
    setManagerInfo(null);
  };

  return {
    user,
    session,
    managerInfo,
    isManager,
    loading,
    signOut
  };
};
