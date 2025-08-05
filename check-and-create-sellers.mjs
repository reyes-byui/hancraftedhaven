import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMTc0MiwiZXhwIjoyMDY5ODc3NzQyfQ.Ha4po0lVtUv0bffNWOGeb-6ZOaingrypUdWeWqGA43c';

// Using service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateTestData() {
  console.log('🔍 Checking seller_profiles table...\n');
  
  try {
    // Check what's in the database
    const { data: existing, error: checkError } = await supabase
      .from('seller_profiles')
      .select('*');
    
    console.log('📊 Current seller profiles in database:');
    console.log('Count:', existing ? existing.length : 0);
    console.log('Error:', checkError);
    
    if (existing && existing.length > 0) {
      console.log('\n✅ Found existing seller profiles:');
      existing.forEach((seller, index) => {
        console.log(`${index + 1}. ${seller.business_name || 'No business name'} (${seller.first_name} ${seller.last_name}) - Completed: ${seller.profile_completed}`);
      });
    } else {
      console.log('\n⚠️ No seller profiles found. Creating test data...');
      
      // Create some test seller profiles
      const testSellers = [
        {
          id: '12345678-1234-1234-1234-123456789012', // Fake UUID for testing
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah@example.com',
          country: 'United States',
          address: '123 Main St, Springfield, IL',
          contact_number: '+1-555-0123',
          business_name: 'Sarah\'s Handmade Pottery',
          business_address: '123 Main St, Springfield, IL',
          business_description: 'Beautiful handcrafted ceramic pottery and home decor items made with love and attention to detail.',
          profile_completed: true,
          photo_url: null
        },
        {
          id: '87654321-4321-4321-4321-210987654321', // Fake UUID for testing
          first_name: 'Michael',
          last_name: 'Chen',
          email: 'michael@example.com',
          country: 'Canada',
          address: '456 Oak Ave, Toronto, ON',
          contact_number: '+1-416-555-0456',
          business_name: 'Chen\'s Woodworks',
          business_address: '456 Oak Ave, Toronto, ON',
          business_description: 'Custom wooden furniture and decorative pieces crafted from sustainably sourced hardwoods.',
          profile_completed: true,
          photo_url: null
        },
        {
          id: '11111111-2222-3333-4444-555555555555', // Fake UUID for testing
          first_name: 'Elena',
          last_name: 'Rodriguez',
          email: 'elena@example.com',
          country: 'Spain',
          address: '789 Plaza Mayor, Madrid',
          contact_number: '+34-91-555-0789',
          business_name: 'Elena\'s Artisan Textiles',
          business_address: '789 Plaza Mayor, Madrid',
          business_description: 'Traditional Spanish textiles including hand-woven scarves, tapestries, and embroidered garments.',
          profile_completed: true,
          photo_url: null
        }
      ];
      
      for (const seller of testSellers) {
        const { data, error } = await supabase
          .from('seller_profiles')
          .upsert(seller, { onConflict: 'id' });
        
        if (error) {
          console.log(`❌ Error creating seller ${seller.business_name}:`, error);
        } else {
          console.log(`✅ Created seller: ${seller.business_name}`);
        }
      }
    }
    
    // Test anonymous access
    console.log('\n🧪 Testing anonymous access...');
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDE3NDIsImV4cCI6MjA2OTg3Nzc0Mn0.6WdJ8hpFonhODlnhq7vMWxXhLGJQ8Cs63_syBEEdqdk');
    
    const { data: anonData, error: anonError } = await anonSupabase
      .from('seller_profiles')
      .select('id, first_name, last_name, business_name, country, profile_completed')
      .eq('profile_completed', true);
    
    console.log('Anonymous access result:');
    console.log('Data:', anonData);
    console.log('Error:', anonError);
    console.log('Count:', anonData ? anonData.length : 0);
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkAndCreateTestData();
