// Detailed diagnostic to verify the customer and order data
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

async function detailedDiagnostic() {
  console.log('🔍 DETAILED MARKETPLACE STATISTICS DIAGNOSTIC')
  console.log('=' .repeat(60))
  console.log(`🔗 Connected to: ${supabaseUrl}\n`)

  // 1. Check customer_profiles table
  console.log('1️⃣ CHECKING CUSTOMER_PROFILES TABLE:')
  try {
    const { data: customers, error: customersError, count: customersCount } = await supabase
      .from('customer_profiles')
      .select('*', { count: 'exact' })

    if (customersError) {
      console.error('❌ Error:', customersError.message)
    } else {
      console.log(`✅ Total customers found: ${customersCount}`)
      if (customers && customers.length > 0) {
        customers.forEach((customer, i) => {
          console.log(`   ${i + 1}. ${customer.first_name} ${customer.last_name} (${customer.email})`)
        })
      } else {
        console.log('   No customers found in table')
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err.message)
  }
  console.log('')

  // 2. Check orders table
  console.log('2️⃣ CHECKING ORDERS TABLE:')
  try {
    const { data: orders, error: ordersError, count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })

    if (ordersError) {
      console.error('❌ Error:', ordersError.message)
    } else {
      console.log(`✅ Total orders found: ${ordersCount}`)
      if (orders && orders.length > 0) {
        const statusCounts = {}
        orders.forEach((order, i) => {
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
          console.log(`   ${i + 1}. Order ${order.id} - Status: ${order.status}, Amount: $${order.total_amount}`)
        })
        console.log('   📊 Status breakdown:')
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`      ${status}: ${count}`)
        })
      } else {
        console.log('   No orders found in table')
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err.message)
  }
  console.log('')

  // 3. Check order_items table
  console.log('3️⃣ CHECKING ORDER_ITEMS TABLE:')
  try {
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('*')

    if (orderItemsError) {
      console.error('❌ Error:', orderItemsError.message)
    } else {
      console.log(`✅ Total order items found: ${orderItems?.length || 0}`)
      if (orderItems && orderItems.length > 0) {
        const statusCounts = {}
        let totalQuantityDelivered = 0
        
        orderItems.forEach((item, i) => {
          statusCounts[item.status] = (statusCounts[item.status] || 0) + 1
          if (item.status === 'delivered') {
            totalQuantityDelivered += item.quantity || 0
          }
          console.log(`   ${i + 1}. Item ${item.id} - Status: ${item.status}, Quantity: ${item.quantity}, Product: ${item.product_name}`)
        })
        
        console.log('   📊 Status breakdown:')
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`      ${status}: ${count} items`)
        })
        console.log(`   🎯 DELIVERED QUANTITY TOTAL: ${totalQuantityDelivered}`)
      } else {
        console.log('   No order items found in table')
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err.message)
  }
  console.log('')

  // 4. Check the JOIN query used in the function
  console.log('4️⃣ TESTING THE ACTUAL JOIN QUERY FROM getMarketplaceStats:')
  try {
    const { data: joinData, error: joinError } = await supabase
      .from('order_items')
      .select('quantity, orders!inner(*)')
      .eq('orders.status', 'delivered')

    if (joinError) {
      console.error('❌ Join query error:', joinError.message)
      console.error('❌ Full error:', JSON.stringify(joinError, null, 2))
    } else {
      console.log(`✅ Join query returned ${joinData?.length || 0} items`)
      if (joinData && joinData.length > 0) {
        let totalFromJoin = 0
        joinData.forEach((item, i) => {
          totalFromJoin += item.quantity || 0
          console.log(`   ${i + 1}. Quantity: ${item.quantity}, Order Status: ${item.orders?.status}`)
        })
        console.log(`   🎯 TOTAL PRODUCTS SOLD (from join): ${totalFromJoin}`)
      } else {
        console.log('   ❌ No delivered order items found via join query')
        console.log('   💡 This explains why Products Sold shows 0')
      }
    }
  } catch (err) {
    console.error('❌ Join query exception:', err.message)
  }
  console.log('')

  // 5. Alternative query to check delivered items
  console.log('5️⃣ ALTERNATIVE QUERY - Check for delivered items differently:')
  try {
    // First get all delivered orders
    const { data: deliveredOrders, error: deliveredOrdersError } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'delivered')

    if (deliveredOrdersError) {
      console.error('❌ Error getting delivered orders:', deliveredOrdersError.message)
    } else {
      console.log(`✅ Found ${deliveredOrders?.length || 0} delivered orders`)
      
      if (deliveredOrders && deliveredOrders.length > 0) {
        const orderIds = deliveredOrders.map(o => o.id)
        console.log('   Order IDs:', orderIds)
        
        // Now get order items for these orders
        const { data: itemsForDeliveredOrders, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds)

        if (itemsError) {
          console.error('❌ Error getting items for delivered orders:', itemsError.message)
        } else {
          console.log(`✅ Found ${itemsForDeliveredOrders?.length || 0} items in delivered orders`)
          const totalQuantity = itemsForDeliveredOrders?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
          console.log(`   🎯 TOTAL QUANTITY: ${totalQuantity}`)
        }
      }
    }
  } catch (err) {
    console.error('❌ Alternative query exception:', err.message)
  }
  console.log('')

  // 6. Test the actual function
  console.log('6️⃣ TESTING getMarketplaceStats FUNCTION:')
  try {
    const response = await fetch('http://localhost:3003/api/debug-stats')
    const result = await response.json()
    console.log('✅ Function result:', JSON.stringify(result, null, 2))
  } catch (err) {
    console.error('❌ Function test failed:', err.message)
  }

  console.log('')
  console.log('🏁 DIAGNOSTIC COMPLETE')
  console.log('=' .repeat(60))
}

detailedDiagnostic().catch(console.error)
