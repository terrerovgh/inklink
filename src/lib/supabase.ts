import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables. URL:", !!supabaseUrl, "Key:", !!supabaseAnonKey);
}

// Fallback to avoid crash during build/dev if env vars are missing
// The client will fail if used, but won't crash the app on startup
export const supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
    {
        auth: {
            flowType: 'pkce',
            persistSession: true, // Persist in localStorage/cookies
            detectSessionInUrl: true,
        }
    }
);
