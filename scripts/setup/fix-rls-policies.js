// Execute SQL to fix RLS policies for public stats access
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fixRLSPolicies() {
  console.log('🔧 FIXING RLS POLICIES FOR PUBLIC STATISTICS ACCESS...')
  
  try {
    const sqlContent = fs.readFileSync('fix-public-stats-access.sql', 'utf8')
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    })

    if (error) {
      console.error('❌ SQL execution error:', error.message)
      
      // Try executing statements individually
      console.log('📝 Trying individual policy updates...')
      
      const statements = [
        `DROP POLICY IF EXISTS "Enable public read access for customer count" ON customer_profiles;`,
        `CREATE POLICY "Enable public read access for customer count" ON customer_profiles FOR SELECT TO anon USING (true);`,
        `DROP POLICY IF EXISTS "Enable public read access for order items count" ON order_items;`,
        `CREATE POLICY "Enable public read access for order items count" ON order_items FOR SELECT TO anon USING (true);`,
        `DROP POLICY IF EXISTS "Enable public read access for orders" ON orders;`,
        `CREATE POLICY "Enable public read access for orders" ON orders FOR SELECT TO anon USING (true);`,
        `DROP POLICY IF EXISTS "Enable public read access for seller count" ON seller_profiles;`,
        `CREATE POLICY "Enable public read access for seller count" ON seller_profiles FOR SELECT TO anon USING (true);`
      ]

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error: stmtError } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        })
        
        if (stmtError) {
          console.error(`❌ Error: ${stmtError.message}`)
        } else {
          console.log('✅ Success')
        }
      }
    } else {
      console.log('✅ RLS policies updated successfully!')
    }
  } catch (err) {
    console.error('❌ Exception:', err.message)
  }

  // Test the fix
  console.log('\n🧪 TESTING ANONYMOUS ACCESS AFTER FIX...')
  
  const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  try {
    const { count: customers } = await anonClient
      .from('customer_profiles')
      .select('*', { count: 'exact', head: true })
    
    const { data: delivered } = await anonClient
      .from('order_items')
      .select('quantity')
      .eq('status', 'delivered')
    
    const productsSold = delivered?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    
    console.log('📊 ANONYMOUS ACCESS RESULTS:')
    console.log(`   Registered Customers: ${customers}+`)
    console.log(`   Products Sold: ${productsSold}+`)
    
    if (customers > 0 && productsSold > 0) {
      console.log('\n🎉 SUCCESS! Your homepage statistics should now show the correct numbers!')
    } else {
      console.log('\n❌ Still blocked. RLS policies may need manual adjustment in Supabase dashboard.')
    }
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

fixRLSPolicies().catch(console.error)
