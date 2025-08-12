// Check for alternative profile storage and create test data
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

async function investigateAndCreateTestData() {
  console.log('🔍 Investigating customer data and creating test data...\n')

  // Let's try to understand the table structure better
  console.log('📋 Checking if customer_profiles table exists and its structure:')
  
  try {
    // Try to insert a test customer to see what happens
    console.log('🧪 Attempting to create a test customer profile...')
    
    const { data: testCustomer, error: customerError } = await supabase
      .from('customer_profiles')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440000', // Test UUID
        full_name: 'Test Customer',
        email: 'test.customer@example.com',
        phone: '+1234567890',
        address: '123 Test Street, Test City, TC 12345'
      })
      .select()

    if (customerError) {
      console.error('❌ Error creating test customer:', customerError.message)
      console.error('Full error:', customerError)
    } else {
      console.log('✅ Test customer created successfully:', testCustomer)
    }

  } catch (err) {
    console.error('❌ Exception creating test customer:', err.message)
  }

  console.log('')

  // Try to create a test order
  console.log('🧪 Attempting to create a test order...')
  
  try {
    const { data: testOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440001', // Test UUID
        customer_id: '550e8400-e29b-41d4-a716-446655440000', // Use the test customer ID
        total_amount: 29.99,
        status: 'delivered',
        shipping_address: '123 Test Street, Test City, TC 12345',
        payment_method: 'credit_card',
        payment_status: 'paid'
      })
      .select()

    if (orderError) {
      console.error('❌ Error creating test order:', orderError.message)
      console.error('Full error:', orderError)
    } else {
      console.log('✅ Test order created successfully:', testOrder)
    }

  } catch (err) {
    console.error('❌ Exception creating test order:', err.message)
  }

  console.log('')

  // Try to create test order items
  console.log('🧪 Attempting to create test order items...')
  
  try {
    const { data: testOrderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .insert([
        {
          order_id: '550e8400-e29b-41d4-a716-446655440001', // Use the test order ID
          product_id: 'some-product-id', // We'd need a real product ID
          quantity: 2,
          price: 14.99
        },
        {
          order_id: '550e8400-e29b-41d4-a716-446655440001',
          product_id: 'another-product-id',
          quantity: 3,
          price: 15.00
        }
      ])
      .select()

    if (orderItemsError) {
      console.error('❌ Error creating test order items:', orderItemsError.message)
      console.error('Full error:', orderItemsError)
    } else {
      console.log('✅ Test order items created successfully:', testOrderItems)
    }

  } catch (err) {
    console.error('❌ Exception creating test order items:', err.message)
  }

  console.log('')

  // Now check the counts again
  console.log('📊 Checking updated counts:')
  
  const { count: newCustomersCount } = await supabase
    .from('customer_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: newOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { data: newOrderItems } = await supabase
    .from('order_items')
    .select(`
      *,
      orders!inner(status)
    `)

  const deliveredItems = newOrderItems?.filter(item => item.orders?.status === 'delivered') || []
  const totalProductsSold = deliveredItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

  console.log(`✅ Updated customers count: ${newCustomersCount || 0}`)
  console.log(`✅ Updated orders count: ${newOrdersCount || 0}`)
  console.log(`✅ Updated products sold: ${totalProductsSold}`)
}

investigateAndCreateTestData().catch(console.error)
