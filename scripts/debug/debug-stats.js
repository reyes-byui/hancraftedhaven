// Debug script to check marketplace statistics data
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugStats() {
  console.log('=== Debugging Marketplace Statistics ===\n')

  // Check customer_profiles table
  console.log('1. Checking customer_profiles table:')
  const { data: customers, error: customersError, count: customersCount } = await supabase
    .from('customer_profiles')
    .select('*', { count: 'exact' })
  
  if (customersError) {
    console.error('Error:', customersError)
  } else {
    console.log(`Found ${customersCount} customers`)
    console.log('Sample data:', customers?.slice(0, 2))
  }

  // Check seller_profiles table
  console.log('\n2. Checking seller_profiles table:')
  const { data: sellers, error: sellersError, count: sellersCount } = await supabase
    .from('seller_profiles')
    .select('*', { count: 'exact' })
  
  if (sellersError) {
    console.error('Error:', sellersError)
  } else {
    console.log(`Found ${sellersCount} sellers`)
    console.log('Sample data:', sellers?.slice(0, 2))
  }

  // Check order_items with orders
  console.log('\n3. Checking order_items with delivered orders:')
  const { data: orderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select(`
      id,
      quantity,
      orders!inner(
        id,
        status
      )
    `)
    .eq('orders.status', 'delivered')

  if (orderItemsError) {
    console.error('Error:', orderItemsError)
  } else {
    console.log(`Found ${orderItems?.length || 0} delivered order items`)
    const totalQuantity = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    console.log(`Total products sold: ${totalQuantity}`)
    console.log('Sample data:', orderItems?.slice(0, 3))
  }

  // Check all orders
  console.log('\n4. Checking all orders:')
  const { data: allOrders, error: ordersError, count: ordersCount } = await supabase
    .from('orders')
    .select('id, status', { count: 'exact' })

  if (ordersError) {
    console.error('Error:', ordersError)
  } else {
    console.log(`Found ${ordersCount} total orders`)
    // Group by status
    const statusCounts = {}
    allOrders?.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    })
    console.log('Orders by status:', statusCounts)
  }

  console.log('\n=== End Debug ===')
}

debugStats().catch(console.error)
