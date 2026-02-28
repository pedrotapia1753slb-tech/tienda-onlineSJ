import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: { users }, error: err0 } = await supabase.auth.admin.listUsers();
  
  // Or just use the anon key if RLS allows it, but RLS probably requires auth.
  // We can't act as a user easily from Node without signing in.
}
run();
