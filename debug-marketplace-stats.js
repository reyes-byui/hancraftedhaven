// Debug script to check marketplace statistics data
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

async function debugStats() {
  console.log('🔍 Debugging marketplace statistics...\n')

  // Check seller_profiles table
  console.log('📊 Checking seller_profiles table:')
  const { data: sellers, error: sellersError, count: sellersCount } = await supabase
    .from('seller_profiles')
    .select('*', { count: 'exact' })

  if (sellersError) {
    console.error('❌ Error fetching sellers:', sellersError)
  } else {
    console.log(`✅ Total sellers: ${sellersCount}`)
    console.log('📋 First few sellers:')
    sellers?.slice(0, 3).forEach((seller, index) => {
      console.log(`   ${index + 1}. ID: ${seller.id}, Name: ${seller.business_name || 'N/A'}`)
    })
  }

  console.log('')

  // Check customer_profiles table
  console.log('📊 Checking customer_profiles table:')
  const { data: customers, error: customersError, count: customersCount } = await supabase
    .from('customer_profiles')
    .select('*', { count: 'exact' })

  if (customersError) {
    console.error('❌ Error fetching customers:', customersError)
  } else {
    console.log(`✅ Total customers: ${customersCount}`)
    console.log('📋 First few customers:')
    customers?.slice(0, 3).forEach((customer, index) => {
      console.log(`   ${index + 1}. ID: ${customer.id}, Name: ${customer.full_name || 'N/A'}`)
    })
  }

  console.log('')

  // Check orders table
  console.log('📊 Checking orders table:')
  const { data: orders, error: ordersError, count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })

  if (ordersError) {
    console.error('❌ Error fetching orders:', ordersError)
  } else {
    console.log(`✅ Total orders: ${ordersCount}`)
    console.log('📋 Orders by status:')
    const statusCounts = {}
    orders?.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    })
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })
  }

  console.log('')

  // Check order_items table
  console.log('📊 Checking order_items table:')
  const { data: orderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select(`
      *,
      orders!inner(status)
    `)

  if (orderItemsError) {
    console.error('❌ Error fetching order items:', orderItemsError)
  } else {
    console.log(`✅ Total order items: ${orderItems?.length || 0}`)
    
    const deliveredItems = orderItems?.filter(item => item.orders?.status === 'delivered') || []
    const totalProductsSold = deliveredItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    
    console.log(`✅ Delivered order items: ${deliveredItems.length}`)
    console.log(`✅ Total products sold: ${totalProductsSold}`)
    
    console.log('📋 Order items by order status:')
    const itemStatusCounts = {}
    orderItems?.forEach(item => {
      const status = item.orders?.status || 'unknown'
      itemStatusCounts[status] = (itemStatusCounts[status] || 0) + (item.quantity || 0)
    })
    Object.entries(itemStatusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} products`)
    })
  }
}

debugStats().catch(console.error)
