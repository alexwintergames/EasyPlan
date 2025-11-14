import { supabase } from './supabase';

export const testSupabase = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log('Conexão Supabase OK', { data, error });
  } catch (err) {
    console.log('Erro de rede Supabase', err);
  }
};

testSupabase();
