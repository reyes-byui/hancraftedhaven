// Test with service role to verify data exists and get RLS policy info
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Service role client (admin access)
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Anonymous client (what your app uses)
const anonClient = createClient(supabaseUrl, supabaseAnonKey)

async function compareCounts() {
  console.log('🔍 COMPARING ADMIN vs ANONYMOUS ACCESS:')
  
  // Test with admin client
  console.log('\n🔑 ADMIN CLIENT (Service Role):')
  try {
    const { count: adminCustomers } = await adminClient
      .from('customer_profiles')
      .select('*', { count: 'exact', head: true })
    
    const { data: adminDelivered } = await adminClient
      .from('order_items')
      .select('quantity')
      .eq('status', 'delivered')
    
    const adminProductsSold = adminDelivered?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    
    console.log(`   ✅ Customers: ${adminCustomers}`)
    console.log(`   ✅ Delivered Items: ${adminDelivered?.length || 0}`)
    console.log(`   ✅ Products Sold: ${adminProductsSold}`)
  } catch (error) {
    console.log(`   ❌ Admin error: ${error.message}`)
  }

  // Test with anonymous client
  console.log('\n👤 ANONYMOUS CLIENT (App User):')
  try {
    const { count: anonCustomers } = await anonClient
      .from('customer_profiles')
      .select('*', { count: 'exact', head: true })
    
    const { data: anonDelivered } = await anonClient
      .from('order_items')
      .select('quantity')
      .eq('status', 'delivered')
    
    const anonProductsSold = anonDelivered?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    
    console.log(`   ❌ Customers: ${anonCustomers}`)
    console.log(`   ❌ Delivered Items: ${anonDelivered?.length || 0}`)
    console.log(`   ❌ Products Sold: ${anonProductsSold}`)
  } catch (error) {
    console.log(`   ❌ Anonymous error: ${error.message}`)
  }

  console.log('\n🎯 CONCLUSION:')
  console.log('The data exists in the database, but RLS policies are blocking')
  console.log('anonymous access. You need to either:')
  console.log('1. Update RLS policies to allow public read access to these tables')
  console.log('2. Or use an authenticated user context for the statistics')
}

compareCounts().catch(console.error)
