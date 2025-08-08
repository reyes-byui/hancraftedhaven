// Extended debug script to check all profile-related tables
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugAllTables() {
  console.log('🔍 Debugging ALL tables...\n')
  console.log(`🔗 Connected to: ${supabaseUrl}\n`)

  // List all tables
  const tablesToCheck = [
    'auth.users',
    'customer_profiles', 
    'seller_profiles',
    'profiles',
    'orders',
    'order_items',
    'products'
  ]

  for (const tableName of tablesToCheck) {
    console.log(`📊 Checking ${tableName} table:`)
    
    try {
      const { data, error, count } = await supabase
        .from(tableName.replace('auth.', ''))
        .select('*', { count: 'exact' })
        .limit(5)

      if (error) {
        console.error(`❌ Error fetching ${tableName}:`, error.message)
      } else {
        console.log(`✅ Total records in ${tableName}: ${count || 0}`)
        if (data && data.length > 0) {
          console.log('📋 Sample records:')
          data.forEach((record, index) => {
            const displayValue = record.email || record.full_name || record.business_name || record.status || record.id || 'N/A'
            console.log(`   ${index + 1}. ${displayValue}`)
          })
        }
      }
    } catch (err) {
      console.error(`❌ Error with ${tableName}:`, err.message)
    }
    
    console.log('')
  }

  // Also check for a generic "profiles" table
  console.log('🔍 Checking if there\'s a generic "profiles" table:')
  try {
    const { data: profilesData, error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .limit(5)

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message)
    } else {
      console.log(`✅ Total records in profiles: ${profilesCount || 0}`)
      if (profilesData && profilesData.length > 0) {
        console.log('📋 Sample profiles:')
        profilesData.forEach((profile, index) => {
          console.log(`   ${index + 1}. ID: ${profile.id}, Type: ${profile.user_type || 'N/A'}`)
        })
      }
    }
  } catch (err) {
    console.error('❌ Error with profiles table:', err.message)
  }
}

debugAllTables().catch(console.error)
