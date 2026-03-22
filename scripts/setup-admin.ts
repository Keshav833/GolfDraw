import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminEmail = process.env.ADMIN_EMAIL!
const adminPassword = process.env.ADMIN_PASSWORD!

async function setupAdmin() {
  if (!supabaseUrl || !supabaseServiceKey || !adminEmail || !adminPassword) {
    console.error('Missing required environment variables in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log(`Setting up admin user: ${adminEmail}...`)

  // 1. Check if user exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError.message)
    return
  }

  let adminUser = users.find(u => u.email === adminEmail)

  if (!adminUser) {
    console.log('User not found. Creating new user...')
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      app_metadata: { role: 'admin' }
    })

    if (createError) {
      console.error('Error creating user:', createError.message)
      return
    }
    adminUser = user!
    console.log('Admin user created successfully.')
  } else {
    console.log('User already exists. Ensuring admin role...')
    const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
      app_metadata: { role: 'admin' }
    })

    if (updateError) {
      console.error('Error updating role:', updateError.message)
      return
    }
    console.log('Admin role confirmed.')
  }

  // 2. Ensure user is in the public.users table (if your schema requires it)
  // Most GolfDraw setups use a trigger, but we can do a manual upsert just in case.
  const { error: dbError } = await supabase
    .from('users')
    .upsert({
      id: adminUser.id,
      email: adminEmail,
      full_name: 'System Admin',
      subscription_status: 'inactive' // Admins don't need active subscriptions to access dashboard
    }, { onConflict: 'id' })

  if (dbError) {
    console.warn('Warning: Could not upsert into public.users. This might be fine if a trigger handled it.', dbError.message)
  }

  console.log('\n--- SETUP COMPLETE ---')
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
  console.log('You can now log in at http://localhost:3000/login and visit /admin')
}

setupAdmin()
