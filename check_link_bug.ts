import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: ws } = await s.from('workspaces').select('id, name, user_id, owner_user_id');
  console.log('Workspaces:', JSON.stringify(ws, null, 2));

  const { data: sc } = await s.from('social_connections').select('id, platform, profile_name, user_id, workspace_id');
  console.log('\nConnections:', JSON.stringify(sc, null, 2));
}
run();
