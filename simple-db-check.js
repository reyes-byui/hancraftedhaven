// Simple diagnostic script that respects RLS policies
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

async function checkDatabaseTables() {
  console.log('🔍 Checking database tables with different approaches...\n')

  // Method 1: Try the exact same queries as the getMarketplaceStats function
  console.log('📊 Method 1: Using exact same queries as getMarketplaceStats:')
  
  try {
    // Count sellers (should work)
    const { count: sellersCount, error: sellersError } = await supabase
      .from('seller_profiles')
      .select('*', { count: 'exact', head: true })

    console.log(`✅ Sellers count: ${sellersCount || 0}`)
    if (sellersError) console.log('   Error:', sellersError.message)

    // Count customers (might be restricted by RLS)
    const { count: customersCount, error: customersError } = await supabase
      .from('customer_profiles')
      .select('*', { count: 'exact', head: true })

    console.log(`✅ Customers count: ${customersCount || 0}`)
    if (customersError) console.log('   Error:', customersError.message)

    // Count order items with delivered status
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .select('quantity, orders!inner(*)')
      .eq('orders.status', 'delivered')

    console.log(`✅ Order items query returned: ${orderItemsData?.length || 0} items`)
    if (orderItemsError) console.log('   Error:', orderItemsError.message)

    if (orderItemsData) {
      const totalProductsSold = orderItemsData.reduce((sum, item) => sum + (item.quantity || 0), 0)
      console.log(`✅ Total products sold: ${totalProductsSold}`)
    }

  } catch (error) {
    console.error('❌ Error in method 1:', error.message)
  }

  console.log('')

  // Method 2: Try alternative queries
  console.log('📊 Method 2: Alternative queries:')
  
  try {
    // Try to get any records without counting
    const { data: anyCustomers, error: anyCustomersError } = await supabase
      .from('customer_profiles')
      .select('id')
      .limit(1)

    console.log(`✅ Can read customer_profiles: ${anyCustomers ? 'Yes' : 'No'}`)
    console.log(`✅ Customer data length: ${anyCustomers?.length || 0}`)
    if (anyCustomersError) console.log('   Error:', anyCustomersError.message)

    // Try to get any orders
    const { data: anyOrders, error: anyOrdersError } = await supabase
      .from('orders')
      .select('id, status')
      .limit(5)

    console.log(`✅ Can read orders: ${anyOrders ? 'Yes' : 'No'}`)
    console.log(`✅ Orders data length: ${anyOrders?.length || 0}`)
    if (anyOrders && anyOrders.length > 0) {
      console.log('   Order statuses:', anyOrders.map(o => o.status))
    }
    if (anyOrdersError) console.log('   Error:', anyOrdersError.message)

    // Try to get any order items
    const { data: anyOrderItems, error: anyOrderItemsError } = await supabase
      .from('order_items')
      .select('id, quantity')
      .limit(5)

    console.log(`✅ Can read order_items: ${anyOrderItems ? 'Yes' : 'No'}`)
    console.log(`✅ Order items data length: ${anyOrderItems?.length || 0}`)
    if (anyOrderItemsError) console.log('   Error:', anyOrderItemsError.message)

  } catch (error) {
    console.error('❌ Error in method 2:', error.message)
  }

  console.log('')

  // Method 3: Test the actual function from our codebase
  console.log('📊 Method 3: Simulate the actual getMarketplaceStats function:')
  
  try {
    async function testGetMarketplaceStats() {
      // Get count of active sellers
      const { count: sellersCount, error: sellersError } = await supabase
        .from('seller_profiles')
        .select('*', { count: 'exact', head: true })

      if (sellersError) {
        console.error('Error fetching sellers count:', sellersError)
      }

      // Get count of all registered customers
      const { count: customersCount, error: customersError } = await supabase
        .from('customer_profiles')
        .select('*', { count: 'exact', head: true })

      if (customersError) {
        console.error('Error fetching customers count:', customersError)
      }

      // Get total products sold from delivered order items
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('quantity, orders!inner(*)')
        .eq('orders.status', 'delivered')

      if (orderItemsError) {
        console.error('Error fetching order items count:', orderItemsError)
      }

      // Sum up the quantities from all delivered order items
      const totalProductsSold = orderItemsData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

      return {
        activeArtisans: sellersCount || 0,
        happyCustomers: customersCount || 0,
        productsSold: totalProductsSold
      }
    }

    const stats = await testGetMarketplaceStats()
    console.log('✅ Function simulation result:', stats)

  } catch (error) {
    console.error('❌ Error in method 3:', error.message)
  }
}

checkDatabaseTables().catch(console.error)
