// Script to run the RLS fix SQL commands
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  console.log('Current supabaseUrl:', supabaseUrl);
  console.log('Current serviceKey:', supabaseServiceKey ? 'Found' : 'Not found');
  process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for seller_profiles...');
  
  try {
    // Run the SQL commands one by one
    const queries = [
      'DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.seller_profiles;',
      'DROP POLICY IF EXISTS "Allow insert/select for own seller profile" ON public.seller_profiles;',
      `CREATE POLICY "Enable insert for own profile" ON public.seller_profiles
        FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);`,
      `CREATE POLICY "Enable select for own profile" ON public.seller_profiles
        FOR SELECT USING (auth.uid() = id);`,
      `CREATE POLICY "Enable public read for completed profiles" ON public.seller_profiles
        FOR SELECT USING (profile_completed = true);`,
      `CREATE POLICY "Enable update for own profile" ON public.seller_profiles
        FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);`,
      `CREATE POLICY "Enable delete for own profile" ON public.seller_profiles
        FOR DELETE USING (auth.uid() = id);`,
      'ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;'
    ];

    for (const [index, query] of queries.entries()) {
      console.log(`Executing query ${index + 1}/${queries.length}...`);
      const { error } = await supabase.rpc('exec', { sql: query });
      if (error) {
        console.error(`Error in query ${index + 1}:`, error);
      } else {
        console.log(`✅ Query ${index + 1} executed successfully`);
      }
    }
    
    console.log('🎉 RLS policies updated successfully!');
    
    // Test by fetching sellers
    console.log('🧪 Testing seller fetch...');
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('id, first_name, last_name, business_name, country, profile_completed')
      .limit(5);
    
    if (error) {
      console.error('❌ Test fetch error:', error);
    } else {
      console.log('✅ Test fetch successful!');
      console.log(`Found ${data.length} seller profiles`);
      if (data.length > 0) {
        console.log('Sample seller:', data[0]);
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

fixRLSPolicies();
