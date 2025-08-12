// Check messaging tables with proper syntax
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMessagingSetup() {
  console.log('🔍 CHECKING MESSAGING SYSTEM SETUP...\n');

  try {
    // Check if conversations table exists by trying to query it
    console.log('1️⃣ Checking conversations table...');
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);

    if (conversationsError) {
      console.log('❌ Conversations table error:', conversationsError.message);
      if (conversationsError.message.includes('does not exist') || 
          conversationsError.message.includes('relation') ||
          conversationsError.message.includes('table')) {
        console.log('📁 MESSAGING TABLES NOT SET UP!');
        console.log('🔧 Need to run: docs/SAFE_MESSAGING_SETUP.sql');
        return false;
      }
    } else {
      console.log('✅ Conversations table exists');
    }

    // Check if messages table exists
    console.log('2️⃣ Checking messages table...');
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('id')
      .limit(1);

    if (messagesError) {
      console.log('❌ Messages table error:', messagesError.message);
      if (messagesError.message.includes('does not exist') || 
          messagesError.message.includes('relation') ||
          messagesError.message.includes('table')) {
        console.log('📁 MESSAGING TABLES NOT SET UP!');
        console.log('🔧 Need to run: docs/SAFE_MESSAGING_SETUP.sql');
        return false;
      }
    } else {
      console.log('✅ Messages table exists');
    }

    // Try to test a simple function call
    console.log('3️⃣ Testing function access...');
    try {
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_or_create_conversation', {
          p_customer_id: '123e4567-e89b-12d3-a456-426614174000',
          p_seller_id: '123e4567-e89b-12d3-a456-426614174001',
          p_product_id: null,
          p_subject: 'test'
        });

      if (functionError) {
        console.log('⚠️ Function error (may be normal):', functionError.message);
        if (functionError.message.includes('does not exist') ||
            functionError.message.includes('function')) {
          console.log('📁 Database functions not set up!');
          console.log('🔧 Need to run: docs/SAFE_MESSAGING_SETUP.sql');
        }
      } else {
        console.log('✅ Functions appear to work');
      }
    } catch (err) {
      console.log('⚠️ Function test failed (may be normal):', err.message);
    }

    console.log('\n🎉 BASIC MESSAGING TABLES EXIST!');
    console.log('   Try the messaging feature now.');
    return true;

  } catch (error) {
    console.error('💥 Error checking messaging setup:', error);
    return false;
  }
}

checkMessagingSetup();
