// Create test customer and order data
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

async function createTestData() {
  console.log('🧪 Creating test data for marketplace statistics...\n')

  // Create a test customer profile
  console.log('1. Creating test customer...')
  const testCustomerId = '550e8400-e29b-41d4-a716-446655440000'
  
  const { data: customer, error: customerError } = await supabase
    .from('customer_profiles')
    .upsert({
      id: testCustomerId,
      first_name: 'Test',
      last_name: 'Customer',
      email: 'test.customer@example.com',
      country: 'Philippines',
      address: '123 Test Street, Manila, Philippines',
      contact_number: '+63 912 345 6789',
      profile_completed: true
    })
    .select()

  if (customerError) {
    console.error('❌ Error creating customer:', customerError)
    return
  } else {
    console.log('✅ Test customer created!')
  }

  // Get a real product ID from the products table
  console.log('2. Getting real product IDs...')
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name')
    .limit(3)

  if (productsError || !products || products.length === 0) {
    console.error('❌ Error getting products or no products found:', productsError)
    return
  }

  console.log(`✅ Found ${products.length} products to use`)

  // Create test orders
  console.log('3. Creating test orders...')
  const testOrders = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      customer_id: testCustomerId,
      total_amount: 59.98,
      status: 'delivered',
      shipping_address: '123 Test Street, Manila, Philippines',
      payment_method: 'credit_card',
      payment_status: 'paid'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      customer_id: testCustomerId,
      total_amount: 89.99,
      status: 'delivered',
      shipping_address: '123 Test Street, Manila, Philippines',
      payment_method: 'paypal',
      payment_status: 'paid'
    }
  ]

  for (let i = 0; i < testOrders.length; i++) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .upsert(testOrders[i])
      .select()

    if (orderError) {
      console.error(`❌ Error creating order ${i + 1}:`, orderError)
      return
    } else {
      console.log(`✅ Test order ${i + 1} created!`)
    }
  }

  // Create test order items
  console.log('4. Creating test order items...')
  const testOrderItems = [
    // Order 1 items
    {
      order_id: '550e8400-e29b-41d4-a716-446655440001',
      product_id: products[0].id,
      quantity: 2,
      price: 19.99
    },
    {
      order_id: '550e8400-e29b-41d4-a716-446655440001',
      product_id: products[1].id,
      quantity: 1,
      price: 20.00
    },
    // Order 2 items
    {
      order_id: '550e8400-e29b-41d4-a716-446655440002',
      product_id: products[1].id,
      quantity: 3,
      price: 20.00
    },
    {
      order_id: '550e8400-e29b-41d4-a716-446655440002',
      product_id: products[2].id,
      quantity: 1,
      price: 29.99
    }
  ]

  const { data: orderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .upsert(testOrderItems)
    .select()

  if (orderItemsError) {
    console.error('❌ Error creating order items:', orderItemsError)
    return
  } else {
    console.log(`✅ ${testOrderItems.length} order items created!`)
  }

  // Verify the data
  console.log('\n📊 Verifying created data:')
  
  // Check customers
  const { count: customersCount } = await supabase
    .from('customer_profiles')
    .select('*', { count: 'exact', head: true })

  // Check orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'delivered')

  // Check order items with delivered orders
  const { data: deliveredOrderItems } = await supabase
    .from('order_items')
    .select(`
      *,
      orders!inner(status)
    `)
    .eq('orders.status', 'delivered')

  const totalProductsSold = deliveredOrderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

  console.log(`✅ Total customers: ${customersCount || 0}`)
  console.log(`✅ Total delivered orders: ${orders?.length || 0}`)
  console.log(`✅ Total products sold: ${totalProductsSold}`)

  console.log('\n🎉 Test data creation complete!')
  console.log('💡 Now the marketplace statistics should show real numbers!')
}

createTestData().catch(console.error)
