// Apply RLS policies using direct SQL execution
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function applyRLSPolicies() {
  console.log('🔧 APPLYING RLS POLICIES FOR PUBLIC STATISTICS ACCESS...')
  
  const policies = [
    {
      name: 'Customer profiles public read access',
      sql: `DROP POLICY IF EXISTS "Enable public read access for customer count" ON customer_profiles;`
    },
    {
      name: 'Customer profiles public read policy',
      sql: `CREATE POLICY "Enable public read access for customer count" ON customer_profiles FOR SELECT TO anon USING (true);`
    },
    {
      name: 'Order items public read access drop',
      sql: `DROP POLICY IF EXISTS "Enable public read access for order items count" ON order_items;`
    },
    {
      name: 'Order items public read policy',
      sql: `CREATE POLICY "Enable public read access for order items count" ON order_items FOR SELECT TO anon USING (true);`
    },
    {
      name: 'Orders public read access drop',
      sql: `DROP POLICY IF EXISTS "Enable public read access for orders" ON orders;`
    },
    {
      name: 'Orders public read policy',
      sql: `CREATE POLICY "Enable public read access for orders" ON orders FOR SELECT TO anon USING (true);`
    },
    {
      name: 'Seller profiles public read access drop',
      sql: `DROP POLICY IF EXISTS "Enable public read access for seller count" ON seller_profiles;`
    },
    {
      name: 'Seller profiles public read policy',
      sql: `CREATE POLICY "Enable public read access for seller count" ON seller_profiles FOR SELECT TO anon USING (true);`
    }
  ]

  for (const policy of policies) {
    console.log(`\n📝 ${policy.name}...`)
    try {
      const { data, error } = await supabase
        .from('_placeholder') // This won't work, but let's try a different approach
        .select('1')
      
      // Let's try using the REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: policy.sql })
      })
      
      if (response.ok) {
        console.log('✅ Success')
      } else {
        console.log(`❌ Failed: ${response.statusText}`)
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }
  }

  // Test the policies
  console.log('\n🧪 TESTING ANONYMOUS ACCESS...')
  
  const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  try {
    const { count: customers, error: customerError } = await anonClient
      .from('customer_profiles')
      .select('*', { count: 'exact', head: true })
    
    const { data: delivered, error: deliveredError } = await anonClient
      .from('order_items')
      .select('quantity')
      .eq('status', 'delivered')
    
    if (customerError) console.log(`❌ Customer error: ${customerError.message}`)
    if (deliveredError) console.log(`❌ Delivered error: ${deliveredError.message}`)
    
    const productsSold = delivered?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    
    console.log('📊 RESULTS:')
    console.log(`   Registered Customers: ${customers || 0}+`)
    console.log(`   Products Sold: ${productsSold}+`)
    
    if ((customers || 0) > 0 && productsSold > 0) {
      console.log('\n🎉 SUCCESS! Your homepage statistics should now show the correct numbers!')
    } else {
      console.log('\n⚠️ Still showing 0. You may need to apply the RLS policies manually in the Supabase dashboard.')
      console.log('\n📋 MANUAL STEPS:')
      console.log('1. Go to Supabase Dashboard → Authentication → Policies')
      console.log('2. For each table (customer_profiles, order_items, orders, seller_profiles):')
      console.log('   - Add SELECT policy for "anon" role')
      console.log('   - Set USING expression to: true')
      console.log('   - This allows anonymous users to read data for statistics')
    }
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

applyRLSPolicies().catch(console.error)
