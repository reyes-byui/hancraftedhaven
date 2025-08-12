import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMTc0MiwiZXhwIjoyMDY5ODc3NzQyfQ.Ha4po0lVtUv0bffNWOGeb-6ZOaingrypUdWeWqGA43c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSellerProfiles() {
  console.log('🔧 Fixing seller profile completion status...\n');
  
  try {
    // Get all profiles first
    const { data: profiles, error: fetchError } = await supabase
      .from('seller_profiles')
      .select('id, first_name, last_name, business_name, profile_completed');
    
    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return;
    }
    
    console.log('📊 Current profiles:');
    profiles?.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.business_name} - Completed: ${profile.profile_completed}`);
    });
    
    // Update each profile individually
    if (profiles) {
      for (const profile of profiles) {
        const { error: updateError } = await supabase
          .from('seller_profiles')
          .update({ profile_completed: true })
          .eq('id', profile.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${profile.business_name}:`, updateError);
        } else {
          console.log(`✅ Updated ${profile.business_name} to completed`);
        }
      }
    }
    
    // Now test anonymous access
    console.log('\n🧪 Testing anonymous access...');
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDE3NDIsImV4cCI6MjA2OTg3Nzc0Mn0.6WdJ8hpFonhODlnhq7vMWxXhLGJQ8Cs63_syBEEdqdk');
    
    // Try without any filtering first
    const { data: allData, error: allError } = await anonSupabase
      .from('seller_profiles')
      .select('*');
    
    console.log('All data (anonymous):', allData?.length || 0, 'records');
    console.log('Error:', allError);
    
    // Now try with completed filter
    const { data: completedData, error: completedError } = await anonSupabase
      .from('seller_profiles')
      .select('id, first_name, last_name, business_name, business_description, business_address, country, photo_url, profile_completed')
      .eq('profile_completed', true)
      .order('business_name', { ascending: true });
    
    console.log('Completed profiles (anonymous):');
    console.log('Count:', completedData?.length || 0);
    console.log('Error:', completedError);
    
    if (completedData && completedData.length > 0) {
      console.log('Sample seller:', JSON.stringify(completedData[0], null, 2));
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

fixSellerProfiles();
