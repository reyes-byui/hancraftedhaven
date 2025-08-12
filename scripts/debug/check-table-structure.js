const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTables() {
  console.log('🔍 Checking existing table structure...')

  try {
    // Check what columns exist in messages table
    console.log('\n📋 Checking messages table structure...')
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .limit(0) // Just get structure, no data
    
    if (error) {
      console.error('❌ Error accessing messages table:', error.message)
    } else {
      console.log('✅ Messages table exists')
      
      // Try to get one record to see actual columns
      const { data: sample, error: sampleError } = await supabase
        .from('messages')
        .select('*')
        .limit(1)
      
      if (sample && sample.length > 0) {
        console.log('📋 Available columns:', Object.keys(sample[0]))
      } else {
        console.log('📋 Messages table is empty, checking column info differently...')
        
        // Try common messaging columns one by one
        const testColumns = ['id', 'conversation_id', 'sender_id', 'sender_type', 'message', 'content', 'text', 'body', 'created_at']
        
        for (const col of testColumns) {
          try {
            await supabase.from('messages').select(col).limit(1)
            console.log(`✅ Column '${col}' exists`)
          } catch (err) {
            console.log(`❌ Column '${col}' does not exist`)
          }
        }
      }
    }

    // Check conversations table
    console.log('\n📋 Checking conversations table structure...')
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1)
    
    if (convError) {
      console.error('❌ Error accessing conversations table:', convError.message)
    } else if (convData && convData.length > 0) {
      console.log('✅ Conversations table exists')
      console.log('📋 Available columns:', Object.keys(convData[0]))
    } else {
      console.log('✅ Conversations table exists but is empty')
    }

  } catch (error) {
    console.error('💥 Exception:', error.message)
  }
}

checkTables()
