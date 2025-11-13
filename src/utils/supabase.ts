import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/db.types';

const supabaseUrl = process.env.SUPABASE_URL as string;
const serviceRoleSecret = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient<Database>(supabaseUrl, serviceRoleSecret, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export default supabase;