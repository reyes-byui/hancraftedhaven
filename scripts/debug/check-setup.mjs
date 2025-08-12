import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMTc0MiwiZXhwIjoyMDY5ODc3NzQyfQ.Ha4po0lVtUv0bffNWOGeb-6ZOaingrypUdWeWqGA43c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSetup() {
  console.log('🔍 Checking database setup...\n');
  
  try {
    // Check products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    console.log('Products table check:');
    console.log('Error:', productsError);
    console.log('Data:', products);
    
    // Check storage buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    console.log('\nStorage buckets check:');
    console.log('Error:', bucketsError);
    console.log('Buckets:', buckets?.map(b => b.id));
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkSetup();
