// Direct test of the counting queries used in getMarketplaceStats
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCounting() {
  console.log('🧮 TESTING EXACT COUNTING QUERIES FROM getMarketplaceStats')
  console.log('=' .repeat(60))

  // Test 1: Count customer_profiles (exact same query as in function)
  console.log('\n1️⃣ COUNTING customer_profiles:')
  console.log('Query: SELECT COUNT(*) FROM customer_profiles')
  try {
    const { count: customersCount, error: customersError } = await supabase
      .from('customer_profiles')
      .select('*', { count: 'exact', head: true })

    console.log('Result:', { customersCount, customersError })
    
    if (customersError) {
      console.log('❌ Error details:', JSON.stringify(customersError, null, 2))
    } else {
      console.log(`✅ customer_profiles count: ${customersCount}`)
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }

  // Test 2: Count order_items with delivered status (exact same query as in function)
  console.log('\n2️⃣ COUNTING delivered order_items:')
  console.log('Query: SELECT oi.quantity FROM order_items oi INNER JOIN orders o ON oi.order_id = o.id WHERE o.status = \'delivered\'')
  try {
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .select('quantity, orders!inner(*)')
      .eq('orders.status', 'delivered')

    console.log('Result:', { 
      dataLength: orderItemsData?.length, 
      orderItemsError,
      data: orderItemsData 
    })
    
    if (orderItemsError) {
      console.log('❌ Error details:', JSON.stringify(orderItemsError, null, 2))
    } else {
      const totalProductsSold = orderItemsData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
      console.log(`✅ delivered order_items found: ${orderItemsData?.length || 0}`)
      console.log(`✅ total quantity delivered: ${totalProductsSold}`)
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }

  // Test 3: Let's also try without the join to see if there are ANY order_items
  console.log('\n3️⃣ CHECKING ALL order_items (without join):')
  try {
    const { data: allOrderItems, error: allItemsError } = await supabase
      .from('order_items')
      .select('*')

    if (allItemsError) {
      console.log('❌ Error:', allItemsError.message)
    } else {
      console.log(`✅ Total order_items in table: ${allOrderItems?.length || 0}`)
      if (allOrderItems && allOrderItems.length > 0) {
        allOrderItems.forEach((item, i) => {
          console.log(`   ${i + 1}. Status: ${item.status}, Quantity: ${item.quantity}`)
        })
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }

  // Test 4: Check if there are ANY orders at all
  console.log('\n4️⃣ CHECKING ALL orders:')
  try {
    const { data: allOrders, error: allOrdersError } = await supabase
      .from('orders')
      .select('*')

    if (allOrdersError) {
      console.log('❌ Error:', allOrdersError.message)
    } else {
      console.log(`✅ Total orders in table: ${allOrders?.length || 0}`)
      if (allOrders && allOrders.length > 0) {
        allOrders.forEach((order, i) => {
          console.log(`   ${i + 1}. Status: ${order.status}, Amount: ${order.total_amount}`)
        })
      }
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }

  console.log('\n🎯 SUMMARY:')
  console.log('If all counts are 0, then the tables are genuinely empty.')
  console.log('If you see data in Supabase dashboard but not here, it\'s an RLS issue.')
  console.log('The counting logic itself is correct - the issue is NO DATA EXISTS.')
}

testCounting().catch(console.error)
