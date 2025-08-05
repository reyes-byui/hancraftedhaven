import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMTc0MiwiZXhwIjoyMDY5ODc3NzQyfQ.Ha4po0lVtUv0bffNWOGeb-6ZOaingrypUdWeWqGA43c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateSellerProfiles() {
  console.log('🔄 Updating seller profiles to completed status...\n');
  
  try {
    // Update all existing profiles to completed status
    const { data, error } = await supabase
      .from('seller_profiles')
      .update({ profile_completed: true })
      .neq('profile_completed', null); // Update all rows
    
    if (error) {
      console.error('❌ Error updating profiles:', error);
      return;
    }
    
    console.log('✅ Updated seller profiles to completed status');
    
    // Verify the update
    const { data: updated, error: checkError } = await supabase
      .from('seller_profiles')
      .select('id, first_name, last_name, business_name, profile_completed');
    
    if (checkError) {
      console.error('❌ Error checking updated profiles:', checkError);
      return;
    }
    
    console.log('\n📊 Updated profiles:');
    updated?.forEach((seller, index) => {
      console.log(`${index + 1}. ${seller.business_name} (${seller.first_name} ${seller.last_name}) - Completed: ${seller.profile_completed}`);
    });
    
    // Test anonymous access again
    console.log('\n🧪 Testing anonymous access after update...');
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDE3NDIsImV4cCI6MjA2OTg3Nzc0Mn0.6WdJ8hpFonhODlnhq7vMWxXhLGJQ8Cs63_syBEEdqdk');
    
    const { data: anonData, error: anonError } = await anonSupabase
      .from('seller_profiles')
      .select('id, first_name, last_name, business_name, business_description, business_address, country, photo_url, profile_completed')
      .eq('profile_completed', true)
      .order('business_name', { ascending: true });
    
    console.log('Anonymous access result:');
    console.log('Data:', anonData);
    console.log('Error:', anonError);
    console.log('Count:', anonData ? anonData.length : 0);
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

updateSellerProfiles();
