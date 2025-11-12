// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  type?: string | null; // 'player' | 'organizer' | 'technician' or null
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserFromDb = async (id: string) => {
    // fetch user row from `users` table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      setUser(data as User);
    } else {
      // fallback: minimal user from auth
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || null });
      } else {
        setUser(null);
      }
    }
  };

  const refreshUser = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (session?.user) {
      await fetchUserFromDb(session.user.id);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (session?.user && mounted) {
        await fetchUserFromDb(session.user.id);
      } else if (mounted) {
        setUser(null);
      }
      setLoading(false);
    };
    init();

    // listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserFromDb(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
