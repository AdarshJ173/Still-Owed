import { createClient } from "@supabase/supabase-js";
import { setStoredUserId } from "./api";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://dxhuxvmvjilewcthmmkl.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4aHV4dm12amlsZXdjdGhtbWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjM3NjUsImV4cCI6MjEwNTIzOTc2NX0.lt_g4tAGxIFYxoILBAg7DERILzSmCN0RH1ObY_6wg7A";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Sync auth state with client API requests
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user?.id) {
    setStoredUserId(session.user.id);
  }
});

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const redirectTo = `${window.location.origin}/cases`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  return { error: error ? new Error(error.message) : null };
}

export async function signOut(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error ? new Error(error.message) : null };
}
