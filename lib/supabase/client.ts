import { createClient } from "@supabase/supabase-js";
import { Thought } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      thoughts: {
        Row: Thought;
        Insert: Omit<Thought, "id" | "created_at">;
        Update: Partial<Omit<Thought, "id" | "created_at">>;
      };
      user_submissions: {
        Row: {
          id: string;
          thought_id: string;
          ip_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          thought_id: string;
          ip_hash: string;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          thought_id: string;
          ip_hash: string;
          created_at: string;
        }>;
      };
    };
  };
};

