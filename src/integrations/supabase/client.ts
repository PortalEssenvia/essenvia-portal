import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const supabase = createClient<Database>(
  "https://nubpxsrhnaulmxokhrgb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51YnB4c3JobmF1bG14b2tocmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTEzNTUsImV4cCI6MjA5MzM4NzM1NX0.NAzqqXhAVC1FpfRwxV8khA5Dgu0YkQRiXohMEl2ELxY",
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);