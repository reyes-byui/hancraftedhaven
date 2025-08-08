// Test script to check if review functions exist
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not found')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testReviewFunctions() {
  console.log('🔍 Testing review system...')
  
  try {
    // Test 1: Check if product_reviews table exists
    console.log('1. Checking if product_reviews table exists...')
    const { data: tables, error: tableError } = await supabase
      .from('product_reviews')
      .select('count(*)', { count: 'exact', head: true })
    
    if (tableError) {
      console.error('❌ product_reviews table does not exist:', tableError.message)
      return
    } else {
      console.log('✅ product_reviews table exists')
    }

    // Test 2: Check if get_recent_reviews_for_community function exists
    console.log('2. Testing get_recent_reviews_for_community function...')
    const { data: reviews, error: reviewError } = await supabase.rpc('get_recent_reviews_for_community', {
      p_limit: 5
    })
    
    if (reviewError) {
      console.error('❌ get_recent_reviews_for_community function error:', reviewError.message)
      if (reviewError.message.includes('function') && reviewError.message.includes('does not exist')) {
        console.log('📋 The review system database functions have not been created yet.')
        console.log('   Please run the PRODUCT_REVIEW_SYSTEM_SETUP.sql file in your Supabase dashboard.')
      }
    } else {
      console.log('✅ get_recent_reviews_for_community function works')
      console.log(`   Found ${reviews?.length || 0} reviews`)
    }

    // Test 3: Check if submit_product_review function exists
    console.log('3. Testing submit_product_review function exists...')
    const { error: submitError } = await supabase.rpc('submit_product_review', {
      p_product_id: '00000000-0000-0000-0000-000000000000',
      p_order_item_id: '00000000-0000-0000-0000-000000000000',
      p_rating: 5,
      p_comment: 'test',
      p_is_anonymous: false
    })
    
    if (submitError) {
      if (submitError.message.includes('function') && submitError.message.includes('does not exist')) {
        console.error('❌ submit_product_review function does not exist')
        console.log('📋 The review system database functions have not been created yet.')
      } else {
        console.log('✅ submit_product_review function exists (expected auth error)')
      }
    }

    console.log('\n📋 Setup Instructions:')
    console.log('1. Open your Supabase dashboard')
    console.log('2. Go to SQL Editor')
    console.log('3. Copy and paste the contents of docs/PRODUCT_REVIEW_SYSTEM_SETUP.sql')
    console.log('4. Execute the SQL to create the review system tables and functions')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testReviewFunctions()
