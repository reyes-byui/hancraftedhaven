// Test add to cart functionality
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMTc0MiwiZXhwIjoyMDY5ODc3NzQyfQ.Ha4po0lVtUv0bffNWOGeb-6ZOaingrypUdWeWqGA43c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAddToCart() {
  console.log('🔍 Testing cart functionality...');
  
  try {
    // Check if cart table exists and is accessible
    console.log('\n1. Checking cart table structure...');
    const { data: cartStructure, error: structureError } = await supabase
      .from('cart')
      .select('*')
      .limit(1);
    
    console.log('Cart table check:', { data: cartStructure, error: structureError });
    
    // Check if we have any customers
    console.log('\n2. Checking customer profiles...');
    const { data: customers, error: customerError } = await supabase
      .from('customer_profiles')
      .select('id, email')
      .limit(3);
      
    console.log('Customer profiles:', { count: customers?.length || 0, error: customerError });
    
    // Check if we have any products
    console.log('\n3. Checking products...');
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity')
      .limit(3);
      
    console.log('Products:', { count: products?.length || 0, error: productError });
    
    if (products && products.length > 0) {
      console.log('Sample product:', products[0]);
    }
    
    // Check authentication flows
    console.log('\n4. Checking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    console.log('Auth users:', { count: authUsers?.users?.length || 0, error: authError });
    
    if (customers && customers.length > 0 && products && products.length > 0) {
      console.log('\n✅ Basic setup looks good!');
      console.log('\nIssue is likely with:');
      console.log('- User not being properly authenticated when calling addToCart');
      console.log('- RLS policies blocking the cart insert');
      console.log('- Frontend not handling error messages properly');
    } else {
      console.log('\n⚠️ Missing data:');
      if (!customers || customers.length === 0) {
        console.log('- No customer profiles found');
      }
      if (!products || products.length === 0) {
        console.log('- No products found');
      }
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testAddToCart();
