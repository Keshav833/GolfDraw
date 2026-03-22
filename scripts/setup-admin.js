const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Simple env loader for .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

async function setupAdmin() {
  if (!supabaseUrl || !supabaseServiceKey || !adminEmail || !adminPassword) {
    console.error('Missing required environment variables in .env.local');
    console.log({
      supabaseUrl: !!supabaseUrl,
      supabaseServiceKey: !!supabaseServiceKey,
      adminEmail,
      adminPassword,
    });
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`Setting up admin user: ${adminEmail}...`);

  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }

  let adminUser = users.find(
    (u) => u.email.toLowerCase() === adminEmail.toLowerCase()
  );

  if (!adminUser) {
    console.log('User not found. Creating new user...');
    const {
      data: { user },
      error: createError,
    } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    });

    if (createError) {
      console.error('Error creating user:', createError.message);
      return;
    }
    adminUser = user;
    console.log('Admin user created successfully.');
  } else {
    console.log('User already exists. Ensuring admin role...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        app_metadata: { role: 'admin' },
      }
    );

    if (updateError) {
      console.error('Error updating role:', updateError.message);
      return;
    }
    console.log('Admin role confirmed.');
  }

  const { error: dbError } = await supabase.from('users').upsert({
    id: adminUser.id,
    email: adminEmail,
    full_name: 'Admin User',
    subscription_status: 'inactive',
  });

  if (dbError) {
    console.warn(
      'Warning: Could not upsert into public.users:',
      dbError.message
    );
  }

  console.log('\n--- SETUP COMPLETE ---');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(
    'You can now log in at http://localhost:3000/login and visit /admin'
  );
}

setupAdmin().catch(console.error);
