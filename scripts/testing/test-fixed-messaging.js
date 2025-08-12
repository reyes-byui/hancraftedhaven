const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testFixedQuery() {
  console.log('🔍 Testing fixed messaging query...')

  try {
    // Test the simplified query approach
    console.log('\n📋 Testing basic messages query...')
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Basic query error:', error.message)
    } else {
      console.log('✅ Basic messages query works')
      console.log('📋 Sample data structure:', data[0] || 'No messages yet')
    }

    // Test conversation query
    console.log('\n📋 Testing conversations query...')
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1)
    
    if (convError) {
      console.error('❌ Conversations query error:', convError.message)
    } else {
      console.log('✅ Conversations query works')
      console.log('📋 Sample conversation structure:', convData[0] || 'No conversations yet')
    }

    // Test customer profiles access
    console.log('\n📋 Testing customer profiles access...')
    const { data: custData, error: custError } = await supabase
      .from('customer_profiles')
      .select('*')
      .limit(1)
    
    if (custError) {
      console.error('❌ Customer profiles error:', custError.message)
    } else {
      console.log('✅ Customer profiles accessible')
    }

    // Test seller profiles access
    console.log('\n📋 Testing seller profiles access...')
    const { data: sellData, error: sellError } = await supabase
      .from('seller_profiles')
      .select('*')
      .limit(1)
    
    if (sellError) {
      console.error('❌ Seller profiles error:', sellError.message)
    } else {
      console.log('✅ Seller profiles accessible')
    }

  } catch (error) {
    console.error('💥 Exception:', error.message)
  }
}

testFixedQuery()
