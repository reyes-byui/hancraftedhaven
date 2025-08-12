import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDE3NDIsImV4cCI6MjA2OTg3Nzc0Mn0.6WdJ8hpFonhODlnhq7vMWxXhLGJQ8Cs63_syBEEdqdk';

// Using anon key to test public access
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSellerAccess() {
  console.log('🧪 Testing seller access with anonymous key...\n');
  
  try {
    // First, let's see if we can access the table at all
    const { data: allData, error: allError } = await supabase
      .from('seller_profiles')
      .select('*')
      .limit(5);
    
    console.log('📊 All sellers query result:');
    console.log('Data:', allData);
    console.log('Error:', allError);
    console.log('Count:', allData ? allData.length : 0);
    
    if (allData && allData.length > 0) {
      console.log('\n✅ Sample seller data:');
      console.log(JSON.stringify(allData[0], null, 2));
    }
    
    // Now test the specific query we use in the app
    const { data: completedData, error: completedError } = await supabase
      .from('seller_profiles')
      .select('id, first_name, last_name, business_name, business_description, business_address, country, photo_url, profile_completed')
      .eq('profile_completed', true)
      .order('business_name', { ascending: true });
    
    console.log('\n📋 Completed sellers query result:');
    console.log('Data:', completedData);
    console.log('Error:', completedError);
    console.log('Count:', completedData ? completedData.length : 0);
    
    if (completedError) {
      console.log('\n❌ Error details:', completedError);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testSellerAccess();
