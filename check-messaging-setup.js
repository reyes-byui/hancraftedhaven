// Check if messaging tables exist and create them if needed
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkMessagingSetup() {
  console.log('🔍 CHECKING MESSAGING SYSTEM SETUP...\n');

  try {
    // Check if conversations table exists
    console.log('1️⃣ Checking conversations table...');
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('count(*)')
      .limit(1);

    if (conversationsError) {
      console.log('❌ Conversations table missing:', conversationsError.message);
      console.log('📁 Need to run: docs/SAFE_MESSAGING_SETUP.sql');
      return false;
    }
    console.log('✅ Conversations table exists');

    // Check if messages table exists
    console.log('2️⃣ Checking messages table...');
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('count(*)')
      .limit(1);

    if (messagesError) {
      console.log('❌ Messages table missing:', messagesError.message);
      console.log('📁 Need to run: docs/SAFE_MESSAGING_SETUP.sql');
      return false;
    }
    console.log('✅ Messages table exists');

    // Check if function exists
    console.log('3️⃣ Checking get_or_create_conversation function...');
    const { data: functionData, error: functionError } = await supabase
      .rpc('get_or_create_conversation', {
        p_customer_id: '00000000-0000-0000-0000-000000000000',
        p_seller_id: '00000000-0000-0000-0000-000000000000',
        p_product_id: null,
        p_subject: 'test'
      });

    if (functionError) {
      console.log('❌ Function missing or failed:', functionError.message);
      console.log('📁 Need to run: docs/SAFE_MESSAGING_SETUP.sql');
      return false;
    }
    console.log('✅ Messaging function exists');

    console.log('\n🎉 MESSAGING SYSTEM IS PROPERLY SET UP!');
    return true;

  } catch (error) {
    console.error('💥 Error checking messaging setup:', error);
    return false;
  }
}

checkMessagingSetup();
