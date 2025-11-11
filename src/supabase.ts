import { createClient } from '@supabase/supabase-js';

// Substitua pelas tuas variáveis de ambiente no arquivo .env ou no Secret do Expo
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lkmdhrshwrjexqymsxxq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrbWRocnNod3JqZXhxeW1zeHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3Nzk5MjYsImV4cCI6MjA3ODM1NTkyNn0.8MZjhlQozXTVqgMUl33W399_kB1xEXLy2_AxtvrlZFo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);