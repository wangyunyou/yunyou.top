import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gibdjdyrwuofrtknrwrx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYmRqZHlyd3VvZnJ0a25yd3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDk1ODMsImV4cCI6MjA5NDAyNTU4M30.7k2XemxeFTvEeTOft3h9zZ1P59CrzOnCRnN2JbfWshg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
