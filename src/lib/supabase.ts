import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  user_id: string;
  stylist_name: string;
  service_id: string;
  date_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  service?: Service;
};
