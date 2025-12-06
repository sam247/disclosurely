import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export async function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Fail fast in server context to avoid silent misconfigurations.
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl as string, supabaseAnonKey as string, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: any) {
        cookieStore.delete(name);
      }
    }
  });
}

