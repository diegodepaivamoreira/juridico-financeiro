import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xarsofqabasnknxywduu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_vCaSz1mA21Ar8ACEl5AT6w_oRMJvGUh";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
