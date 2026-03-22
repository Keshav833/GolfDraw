import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const email = process.argv[2];

async function makeAdmin() {
  if (!email) {
    console.error('Usage: npx ts-node scripts/make-admin.ts your@email.com');
    process.exit(1);
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`Searching for user: ${email}...`);

  // Find user by email
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  const user = users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`Granting admin role to user ID: ${user.id}...`);

  // Grant admin role
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { role: 'admin' },
  });

  if (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }

  console.log(`✓ ${email} is now an admin.`);
  console.log(`  Login at: /admin/login`);
}

makeAdmin().catch(console.error);
