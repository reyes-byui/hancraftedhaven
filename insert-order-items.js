// Insert the order_items data into the database
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function insertOrderItems() {
  console.log('📝 INSERTING ORDER ITEMS DATA...')
  
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
      id: '5ceb1798-abed-4431-959a-e57e65ca3810',
      order_id: 'e0e419f1-ec8f-40fd-89c5-4beabb13f4b9',
      product_id: '56a97674-d6c4-4c4b-918a-d29c28fc17ce',
      seller_id: 'a805530e-b9a6-4673-b7bb-3675a19dc89a',
      product_name: 'Bebemoo Knitted Baby Socks – Tiny Toes, Big Comfort',
      product_price: 11.05,
      quantity: 1,
      subtotal: 11.05,
      created_at: '2025-08-07T19:12:24.266896+00:00',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      status: 'pending'
    },
    {
      id: 'a7f3d150-a484-4aad-90e7-11190c0dff58',
      order_id: 'e0e419f1-ec8f-40fd-89c5-4beabb13f4b9',
      product_id: 'bc69ba7c-6f59-47c1-9e56-0b8e9cdbbf2a',
      seller_id: '4513475f-53e1-43fa-83dd-635aca8017a7',
      product_name: 'GRANDYA Teapot – Elegant Brewing, Timeless Moments',
      product_price: 30.80,
      quantity: 1,
      subtotal: 30.80,
      created_at: '2025-08-07T19:12:24.266896+00:00',
      customer_id: '5c6fb69e-6537-49dd-8766-68ce1beb0274',
      status: 'processing'
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
    console.log('Attempting to insert order items...')
    const { data, error } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (error) {
      console.error('❌ Insert error:', error.message)
      console.error('Full error:', JSON.stringify(error, null, 2))
    } else {
      console.log(`✅ Successfully inserted ${data?.length || 0} order items!`)
      
      // Now count delivered items
      const deliveredItems = orderItems.filter(item => item.status === 'delivered')
      console.log(`🎯 Delivered items: ${deliveredItems.length}`)
      console.log(`🎯 Total delivered quantity: ${deliveredItems.reduce((sum, item) => sum + item.quantity, 0)}`)
    }
  } catch (err) {
    console.error('❌ Exception:', err.message)
  }

  // Test the counting after insertion
  console.log('\n🧮 TESTING COUNTING AFTER INSERTION:')
  try {
    const { data: testData, error: testError } = await supabase
      .from('order_items')
      .select('quantity')
      .eq('status', 'delivered')

    if (testError) {
      console.error('❌ Count test error:', testError.message)
    } else {
      console.log(`✅ Found ${testData?.length || 0} delivered items`)
      const total = testData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
      console.log(`✅ Total delivered quantity: ${total}`)
    }
  } catch (err) {
    console.error('❌ Count test exception:', err.message)
  }
}

insertOrderItems().catch(console.error)
