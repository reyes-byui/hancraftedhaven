// Test the actual getMarketplaceStats function
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getMarketplaceStats() {
  console.log('🧮 Testing getMarketplaceStats function...')

  try {
    // Count customers (same as in your supabase.ts)
    const { count: customersCount } = await supabase
      .from('customer_profiles')
      .select('*', { count: 'exact', head: true })

    // Count delivered products (same as in your supabase.ts)
    const { data: deliveredItems } = await supabase
      .from('order_items')
      .select(`
        quantity,
        orders!inner(status)
      `)
      .eq('orders.status', 'delivered')

    const productsSold = deliveredItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

    // Count active artisans (sellers with products)
    const { data: activeArtisans } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('status', 'approved')

    console.log('📊 MARKETPLACE STATISTICS:')
    console.log(`   Active Artisans: ${activeArtisans?.length || 0}+`)
    console.log(`   Registered Customers: ${customersCount || 0}+`)
    console.log(`   Products Sold: ${productsSold}+`)
    
    return {
      activeArtisans: activeArtisans?.length || 0,
      registeredCustomers: customersCount || 0,
      productsSold: productsSold
    }
  } catch (error) {
    console.error('❌ Error getting marketplace stats:', error.message)
    return {
      activeArtisans: 0,
      registeredCustomers: 0,
      productsSold: 0
    }
  }
}

getMarketplaceStats().catch(console.error)
