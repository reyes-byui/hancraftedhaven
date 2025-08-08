// Create customer profile and then insert order items data
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createCustomerAndOrders() {
  console.log('👤 CREATING CUSTOMER PROFILE FIRST...')
  
  // Create the customer profile that's referenced in the order items
  const customerProfile = {
    id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
    first_name: 'Test',
    last_name: 'Customer',
    email: 'customer@test.com',
    country: 'Philippines',
    address: '123 Test Street, Manila',
    contact_number: '+63 123 456 7890',
    profile_completed: true
  }

  try {
    const { data: customerData, error: customerError } = await supabase
      .from('customer_profiles')
      .insert(customerProfile)
      .select()

    if (customerError) {
      console.error('❌ Customer creation error:', customerError.message)
    } else {
      console.log('✅ Customer profile created successfully!')
    }
  } catch (err) {
    console.error('❌ Customer creation exception:', err.message)
  }

  console.log('\n📦 CREATING ORDERS...')
  
  // Create the orders that are referenced by the order items
  const orders = [
    {
      id: 'd9cdaa75-51db-48c6-b115-82a22e2d7aec',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      total_amount: 48.30,
      status: 'delivered',
      shipping_address: '123 Test Street, Manila',
      payment_method: 'card',
      payment_status: 'paid'
    },
    {
      id: '6858b34f-419b-4381-ab94-56c03d7c5584',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      total_amount: 34.80,
      status: 'delivered',
      shipping_address: '123 Test Street, Manila',
      payment_method: 'card',
      payment_status: 'paid'
    },
    {
      id: 'e0e419f1-ec8f-40fd-89c5-4beabb13f4b9',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      total_amount: 41.85,
      status: 'processing',
      shipping_address: '123 Test Street, Manila',
      payment_method: 'card',
      payment_status: 'paid'
    },
    {
      id: 'dc053125-ba16-42cb-87c4-e20473008e9d',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      total_amount: 30.80,
      status: 'delivered',
      shipping_address: '123 Test Street, Manila',
      payment_method: 'card',
      payment_status: 'paid'
    }
  ]

  try {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .insert(orders)
      .select()

    if (ordersError) {
      console.error('❌ Orders creation error:', ordersError.message)
    } else {
      console.log(`✅ Created ${ordersData?.length || 0} orders successfully!`)
    }
  } catch (err) {
    console.error('❌ Orders creation exception:', err.message)
  }

  console.log('\n📋 NOW TRYING ORDER ITEMS AGAIN...')
  
  const orderItems = [
    {
      id: '2d9165a0-b6a5-40e2-8ea7-ad3ffd62c371',
      order_id: 'd9cdaa75-51db-48c6-b115-82a22e2d7aec',
      product_id: 'bc69ba7c-6f59-47c1-9e56-0b8e9cdbbf2a',
      seller_id: '4513475f-53e1-43fa-83dd-635aca8017a7',
      product_name: 'GRANDYA Teapot – Elegant Brewing, Timeless Moments',
      product_price: 30.80,
      quantity: 1,
      subtotal: 30.80,
      created_at: '2025-08-07T17:36:06.833887+00:00',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      status: 'delivered'
    },
    {
      id: '5446e904-4e02-4514-90d5-87ac07e7539a',
      order_id: 'd9cdaa75-51db-48c6-b115-82a22e2d7aec',
      product_id: '33785d7a-3954-4443-b890-b9f39239e7b1',
      seller_id: '4513475f-53e1-43fa-83dd-635aca8017a7',
      product_name: 'GRANDYA Basic Pottery Group Class – Deep Dive into Khmer Clay Artistry',
      product_price: 17.50,
      quantity: 1,
      subtotal: 17.50,
      created_at: '2025-08-07T17:36:06.833887+00:00',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      status: 'delivered'
    },
    {
      id: '5658f234-7dce-44f3-b621-bb4582e4b233',
      order_id: '6858b34f-419b-4381-ab94-56c03d7c5584',
      product_id: 'f31e3a6d-9395-4a8d-999f-555e410bc5ee',
      seller_id: 'a805530e-b9a6-4673-b7bb-3675a19dc89a',
      product_name: 'Bebemoo Knitted Two-Piece Set – Cozy Style for Everyday Moments',
      product_price: 23.75,
      quantity: 1,
      subtotal: 23.75,
      created_at: '2025-08-07T18:06:39.102241+00:00',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      status: 'delivered'
    },
    {
      id: 'd62a712e-f7e1-48a2-9e02-a02b005ca046',
      order_id: '6858b34f-419b-4381-ab94-56c03d7c5584',
      product_id: '56a97674-d6c4-4c4b-918a-d29c28fc17ce',
      seller_id: 'a805530e-b9a6-4673-b7bb-3675a19dc89a',
      product_name: 'Bebemoo Knitted Baby Socks – Tiny Toes, Big Comfort',
      product_price: 11.05,
      quantity: 1,
      subtotal: 11.05,
      created_at: '2025-08-07T18:06:39.102241+00:00',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      status: 'delivered'
    },
    {
      id: 'f2cb47c9-51cf-4079-8544-8b12d66bda21',
      order_id: 'dc053125-ba16-42cb-87c4-e20473008e9d',
      product_id: 'bc69ba7c-6f59-47c1-9e56-0b8e9cdbbf2a',
      seller_id: '4513475f-53e1-43fa-83dd-635aca8017a7',
      product_name: 'GRANDYA Teapot – Elegant Brewing, Timeless Moments',
      product_price: 30.80,
      quantity: 1,
      subtotal: 30.80,
      created_at: '2025-08-07T17:58:16.889691+00:00',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      status: 'delivered'
    }
  ]

  try {
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (itemsError) {
      console.error('❌ Order items creation error:', itemsError.message)
      console.error('Full error:', JSON.stringify(itemsError, null, 2))
    } else {
      console.log(`✅ Created ${itemsData?.length || 0} order items successfully!`)
      
      // Count delivered items
      const deliveredCount = orderItems.filter(item => item.status === 'delivered').length
      console.log(`🎯 Delivered items created: ${deliveredCount}`)
    }
  } catch (err) {
    console.error('❌ Order items creation exception:', err.message)
  }

  // Final test of counting
  console.log('\n🧮 FINAL COUNTING TEST:')
  try {
    // Test customer count
    const { count: customerCount } = await supabase
      .from('customer_profiles')
      .select('*', { count: 'exact', head: true })

    console.log(`✅ Customer profiles count: ${customerCount}`)

    // Test delivered items count
    const { data: deliveredData } = await supabase
      .from('order_items')
      .select('quantity')
      .eq('status', 'delivered')

    const deliveredTotal = deliveredData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    console.log(`✅ Delivered items count: ${deliveredData?.length || 0}`)
    console.log(`✅ Total delivered quantity: ${deliveredTotal}`)

  } catch (err) {
    console.error('❌ Final count exception:', err.message)
  }
}

createCustomerAndOrders().catch(console.error)
