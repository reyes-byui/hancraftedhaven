// Simple check for messaging tables using anon key
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
    // Check if conversations table exists
    console.log('1️⃣ Checking conversations table...');
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('count(*)')
      .limit(1);

    if (conversationsError) {
      console.log('❌ Conversations table error:', conversationsError.message);
      if (conversationsError.message.includes('does not exist') || 
          conversationsError.message.includes('relation')) {
        console.log('📁 MESSAGING TABLES NOT SET UP!');
        console.log('🔧 Please run this SQL in Supabase dashboard:');
        console.log('   docs/SAFE_MESSAGING_SETUP.sql');
        return false;
      }
    } else {
      console.log('✅ Conversations table exists');
    }

    // Check if messages table exists
    console.log('2️⃣ Checking messages table...');
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('count(*)')
      .limit(1);

    if (messagesError) {
      console.log('❌ Messages table error:', messagesError.message);
      if (messagesError.message.includes('does not exist') || 
          messagesError.message.includes('relation')) {
        console.log('📁 MESSAGING TABLES NOT SET UP!');
        console.log('🔧 Please run this SQL in Supabase dashboard:');
        console.log('   docs/SAFE_MESSAGING_SETUP.sql');
        return false;
      }
    } else {
      console.log('✅ Messages table exists');
    }

    console.log('\n🎉 MESSAGING SYSTEM APPEARS TO BE SET UP!');
    console.log('   (Note: Some functions may require additional setup)');
    return true;

  } catch (error) {
    console.error('💥 Error checking messaging setup:', error);
    return false;
  }
}

checkMessagingSetup();
