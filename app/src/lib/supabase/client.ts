import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const getSupabaseClient = () => {
  if (!hasSupabaseConfig) {
    // ビルド時や環境変数が設定されていない場合は、ダミークライアントを返す
    // 実際の使用時にはhasSupabaseConfigでチェックしているため、この関数は呼ばれないはず
    throw new Error("Supabase credentials are missing in environment variables.");
  }

  if (!client) {
    client = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }

  return client;
};
