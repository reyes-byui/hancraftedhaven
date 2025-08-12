// Check all possible tables where customer and order data might exist
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

async function checkAllTables() {
  console.log('🔍 CHECKING ALL POSSIBLE TABLES FOR CUSTOMER/ORDER DATA')
  console.log('=' .repeat(70))

  // List of possible table names to check
  const possibleTables = [
    'customer_profiles',
    'customers', 
    'users',
    'profiles',
    'profile',
    'orders',
    'order',
    'order_items',
    'orderitems',
    'order_item',
    'purchases',
    'transactions',
    'sales',
    'delivered_orders',
    'completed_orders'
  ]

  for (const tableName of possibleTables) {
    console.log(`\n📋 Checking table: ${tableName}`)
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(5)

      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`   ❌ Table "${tableName}" does not exist`)
        } else {
          console.log(`   ❌ Error: ${error.message}`)
        }
      } else {
        console.log(`   ✅ Table "${tableName}" exists with ${count || 0} records`)
        if (data && data.length > 0) {
          console.log('   📄 Sample data:')
          data.slice(0, 3).forEach((record, i) => {
            // Show key fields that might indicate customers or orders
            const keyFields = {}
            for (const [key, value] of Object.entries(record)) {
              if (key.includes('email') || key.includes('name') || key.includes('status') || 
                  key.includes('customer') || key.includes('order') || key.includes('quantity') ||
                  key.includes('delivered') || key.includes('user') || key === 'id') {
                keyFields[key] = value
              }
            }
            console.log(`      ${i + 1}.`, keyFields)
          })
        }
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`)
    }
  }

  // Also check for any tables with 'delivered' status specifically
  console.log(`\n🎯 SEARCHING FOR DELIVERED ITEMS ACROSS ALL TABLES`)
  
  const statusQueriesToTry = [
    { table: 'order_items', field: 'status', value: 'delivered' },
    { table: 'orders', field: 'status', value: 'delivered' },
    { table: 'order_item', field: 'status', value: 'delivered' },
    { table: 'purchases', field: 'status', value: 'delivered' },
    { table: 'transactions', field: 'status', value: 'delivered' },
    { table: 'sales', field: 'status', value: 'delivered' },
    { table: 'order_items', field: 'delivery_status', value: 'delivered' },
    { table: 'orders', field: 'delivery_status', value: 'delivered' }
  ]

  for (const query of statusQueriesToTry) {
    try {
      const { data, error, count } = await supabase
        .from(query.table)
        .select('*', { count: 'exact' })
        .eq(query.field, query.value)

      if (!error && count && count > 0) {
        console.log(`   🎉 FOUND ${count} delivered items in ${query.table}.${query.field}!`)
        if (data && data.length > 0) {
          data.forEach((item, i) => {
            console.log(`      ${i + 1}. ID: ${item.id}, Quantity: ${item.quantity || 'N/A'}`)
          })
        }
      }
    } catch (err) {
      // Ignore errors for non-existent tables/fields
    }
  }

  // Check auth.users table for registered users
  console.log(`\n👥 CHECKING AUTH USERS`)
  try {
    // Try to get user count - this might be restricted
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.log(`   ❌ Cannot access auth users: ${authError.message}`)
    } else {
      console.log(`   ✅ Found ${authUsers.users?.length || 0} authenticated users`)
      authUsers.users?.slice(0, 3).forEach((user, i) => {
        console.log(`      ${i + 1}. ${user.email} (Type: ${user.user_metadata?.user_type || 'unknown'})`)
      })
    }
  } catch (err) {
    console.log(`   ❌ Auth access restricted: ${err.message}`)
  }

  console.log('\n🏁 TABLE SCAN COMPLETE')
  console.log('=' .repeat(70))
}

checkAllTables().catch(console.error)
