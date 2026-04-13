import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: users } = await s.from('users').select('user_id, email, name, business_display_name');
  console.log('Users in DB:');
  console.log(JSON.stringify(users, null, 2));

  const { data: connections } = await s.from('social_connections').select('user_id, profile_name, platform');
  console.log('\nSocial Connections:');
  console.log(JSON.stringify(connections, null, 2));

  const { data: integrations } = await s.from('social_integrations').select('user_id, name, platform');
  console.log('\nSocial Integrations:');
  console.log(JSON.stringify(integrations, null, 2));
}
run();
