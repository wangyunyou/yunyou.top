import { createClient } from '@supabase/supabase-js';

// 直接写死配置，确保线上线下都能直接运行
const supabaseUrl = 'https://gibdjdyrwuofrtknrwrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYmRqZHlyd3VvZnJ0a25yd3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDk1ODMsImV4cCI6MjA5NDAyNTU4M30.7k2XemxeFTvEeTOft3h9zZ1P59CrzOnCRnN2JbfWshg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
