import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cduuwyrtbtduumwgmydp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdXV3eXJ0YnRkdXVtd2dteWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNzg2NDYsImV4cCI6MjA5Nzc1NDY0Nn0.-wmuaUF63I_py-DjZlR-YwZ6xAJKzNCbOq8n0C0akR0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
