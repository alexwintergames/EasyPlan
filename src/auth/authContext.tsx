// src/auth/authContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string | null; // ← aqui agora aceita null
  firstAccess?: boolean;
}

interface AuthContextProps {
  user: AuthUser | null;
  loading: boolean;
  setUser: (u: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        const authUser = session.user;

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const finalUser: AuthUser = {
          id: authUser.id,
          email: authUser.email || '',
          name: profile?.name || authUser.email?.split('@')[0] || '',
          avatar_url: profile?.avatar_url ?? null, // ← aceita null
          firstAccess: profile?.firstAccess ?? false,
        };

        setUser(finalUser);
      }
    } catch (err) {
      console.log('Erro ao carregar sessão:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
