import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDE3NDIsImV4cCI6MjA2OTg3Nzc0Mn0.6WdJ8hpFonhODlnhq7vMWxXhLGJQ8Cs63_syBEEdqdk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSellers() {
  console.log('🔍 Checking sellers in database...');
  
  try {
    // Check if table exists and get all data
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*');
    
    console.log('📊 Raw database response:');
    console.log('Data:', data);
    console.log('Error:', error);
    console.log('Number of rows:', data ? data.length : 0);
    
    if (data && data.length > 0) {
      console.log('\n📋 Sample seller data:');
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log('\n✅ Profile completion status:');
      data.forEach((seller, index) => {
        console.log(`Seller ${index + 1}: ${seller.business_name || 'No business name'} - Profile completed: ${seller.profile_completed}`);
      });
    }
    
  } catch (err) {
    console.error('💥 Error:', err);
  }
}

checkSellers();
