const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function diagnoseProblem() {
  console.log('🔍 Diagnosing messaging system...')

  try {
    // Test basic messages table access
    console.log('\n📋 Testing messages table access...')
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(1)
    
    if (msgError) {
      console.error('❌ Messages table error:', msgError.message)
    } else {
      console.log('✅ Messages table accessible')
    }

    // Test conversations table access
    console.log('\n📋 Testing conversations table access...')
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1)
    
    if (convError) {
      console.error('❌ Conversations table error:', convError.message)
    } else {
      console.log('✅ Conversations table accessible')
    }

    // Test the exact query that's failing
    console.log('\n📋 Testing full messages query with joins...')
    const { data: fullQuery, error: fullError } = await supabase
      .from('messages')
      .select(`
        *,
        customer_profiles!messages_sender_id_fkey (*),
        seller_profiles!messages_sender_id_fkey (*)
      `)
      .limit(1)
    
    if (fullError) {
      console.error('❌ Full query error:', fullError.message)
      console.error('   This is likely the cause of "Unknown error"')
    } else {
      console.log('✅ Full query with joins works')
    }

    // Test simpler query without joins
    console.log('\n📋 Testing simple messages query...')
    const { data: simple, error: simpleError } = await supabase
      .from('messages')
      .select('id, conversation_id, content, sender_id, sender_type, created_at')
      .limit(1)
    
    if (simpleError) {
      console.error('❌ Simple query error:', simpleError.message)
    } else {
      console.log('✅ Simple query works')
    }

  } catch (error) {
    console.error('💥 Exception:', error.message)
  }
}

diagnoseProblem()
