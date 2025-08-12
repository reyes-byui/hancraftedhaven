// Check for ALL variations of 'delivered' status in order_items
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function findDeliveredItems() {
  console.log('🔍 SEARCHING FOR ALL DELIVERED ITEMS IN ALL POSSIBLE WAYS')
  console.log('=' .repeat(70))

  // 1. Check order_items with status = 'delivered'
  console.log('\n1️⃣ CHECKING order_items.status = "delivered":')
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('status', 'delivered')

    if (error) {
      console.log('❌ Error:', error.message)
    } else {
      console.log(`✅ Found ${data?.length || 0} order_items with status = 'delivered'`)
      if (data && data.length > 0) {
        data.forEach((item, i) => {
          console.log(`   ${i + 1}. ID: ${item.id}, Status: ${item.status}, Quantity: ${item.quantity}, Product: ${item.product_name}`)
        })
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }

  // 2. Check all order_items regardless of status
  console.log('\n2️⃣ CHECKING ALL order_items (any status):')
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')

    if (error) {
      console.log('❌ Error:', error.message)
    } else {
      console.log(`✅ Found ${data?.length || 0} total order_items`)
      if (data && data.length > 0) {
        console.log('📋 All order_items:')
        data.forEach((item, i) => {
          console.log(`   ${i + 1}. ID: ${item.id}, Status: "${item.status}", Quantity: ${item.quantity}`)
        })
        
        // Count by status
        const statusCounts = {}
        data.forEach(item => {
          statusCounts[item.status] = (statusCounts[item.status] || 0) + 1
        })
        console.log('📊 Status breakdown:')
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`   "${status}": ${count} items`)
        })
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }

  // 3. Check for case-insensitive delivered
  console.log('\n3️⃣ CHECKING case-insensitive "delivered":')
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .ilike('status', 'delivered')

    if (error) {
      console.log('❌ Error:', error.message)
    } else {
      console.log(`✅ Found ${data?.length || 0} order_items with status ilike 'delivered'`)
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }

  // 4. Check for partial matches of 'delivered'
  console.log('\n4️⃣ CHECKING partial matches of "delivered":')
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .ilike('status', '%delivered%')

    if (error) {
      console.log('❌ Error:', error.message)
    } else {
      console.log(`✅ Found ${data?.length || 0} order_items with status containing 'delivered'`)
      if (data && data.length > 0) {
        data.forEach((item, i) => {
          console.log(`   ${i + 1}. Status: "${item.status}", Quantity: ${item.quantity}`)
        })
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }

  // 5. Show table structure to see what fields exist
  console.log('\n5️⃣ CHECKING order_items table structure:')
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .limit(1)

    if (error) {
      console.log('❌ Error:', error.message)
    } else if (data && data.length > 0) {
      console.log('📋 Table structure (fields in order_items):')
      Object.keys(data[0]).forEach(field => {
        console.log(`   - ${field}: ${typeof data[0][field]} = ${data[0][field]}`)
      })
    } else {
      console.log('❌ No data to show structure')
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }

  // 6. Raw SQL query to check for any delivered items
  console.log('\n6️⃣ USING RPC to check for delivered items:')
  try {
    const { data, error } = await supabase.rpc('sql', {
      query: 'SELECT COUNT(*) as count FROM order_items WHERE status = \'delivered\';'
    })

    if (error) {
      console.log('❌ RPC Error:', error.message)
    } else {
      console.log('✅ RPC Result:', data)
    }
  } catch (err) {
    console.log('❌ RPC Exception:', err.message)
  }

  console.log('\n🎯 CONCLUSION:')
  console.log('If NO order_items are found with ANY status, the table is completely empty.')
  console.log('If order_items exist but none have "delivered" status, that\'s the issue.')
  console.log('Show me the EXACT data you see in your Supabase dashboard!')
}

findDeliveredItems().catch(console.error)
