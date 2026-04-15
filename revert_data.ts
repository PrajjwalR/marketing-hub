import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const primaryUserId = '0eonLqGghahH365OIReO0GBMrEu1';
  const targetUserId = 'GfFSqbxClHaowgkvAV7804UMwY82'; // admin@hellostores.in

  console.log('Reverting data ownership for Hello Stores...');

  // 1. Revert social_connections
  const { data: connections, error: connError } = await s
    .from('social_connections')
    .update({ user_id: targetUserId })
    .eq('user_id', primaryUserId)
    .ilike('profile_name', '%hellostores%');

  if (connError) console.error('Error reverting connections:', connError);
  else console.log('Reverted connections matching "hellostores"');

  // Also one that might not have hellostores in name but belongs there?
  // User A has: hellostores_app (insta), Prajjwal (linkedin), Hello Stores (youtube)
  // Let's move them back by profile name specifically if they look like yours
  const specificProfiles = ['hellostores_app', 'Hello Stores'];
  await s.from('social_connections').update({ user_id: targetUserId }).in('profile_name', specificProfiles);

  // 2. Revert social_integrations
  const { data: integrations, error: integError } = await s
    .from('social_integrations')
    .update({ user_id: targetUserId })
    .eq('user_id', primaryUserId)
    .in('name', ['HelloStores', 'Hello Stores', 'HS']);

  if (integError) console.error('Error reverting integrations:', integError);
  else console.log('Reverted integrations matching "HelloStores"');

  console.log('Done reverting data.');
}
run();
