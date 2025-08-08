// Test messaging functionality after database fixes
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

async function testMessagingAfterFix() {
  console.log('🧪 TESTING MESSAGING FUNCTIONALITY...\n');

  try {
    console.log('1️⃣ Testing conversations table access...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(5);

    if (convError) {
      console.log('❌ Conversations error:', convError.message);
      if (convError.message.includes('RLS') || convError.message.includes('policy')) {
        console.log('🔧 RLS policies still need fixing. Run fix-messaging-rls.sql');
      }
    } else {
      console.log(`✅ Can access conversations table (${conversations.length} found)`);
    }

    console.log('2️⃣ Testing messages table access...');
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(5);

    if (msgError) {
      console.log('❌ Messages error:', msgError.message);
      if (msgError.message.includes('RLS') || msgError.message.includes('policy')) {
        console.log('🔧 RLS policies still need fixing. Run fix-messaging-rls.sql');
      }
    } else {
      console.log(`✅ Can access messages table (${messages.length} found)`);
    }

    console.log('\n3️⃣ Instructions for testing:');
    console.log('   1. Run fix-messaging-rls.sql in Supabase dashboard');
    console.log('   2. Log in as a customer on the website');
    console.log('   3. Go to a product page');
    console.log('   4. Click "Message Seller"');
    console.log('   5. Type a message and click Send');

    console.log('\n📝 If messaging still fails:');
    console.log('   - Check browser console for errors');
    console.log('   - Verify you are logged in');
    console.log('   - Check Supabase logs for RLS errors');

  } catch (error) {
    console.error('💥 Error testing messaging:', error);
  }
}

testMessagingAfterFix();
