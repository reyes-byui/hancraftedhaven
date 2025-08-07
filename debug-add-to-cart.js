// Debug the specific addToCart error
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDE3NDIsImV4cCI6MjA2OTg3Nzc0Mn0.6WdJ8hpFonhODlnhq7vMWxXhLGJQ8Cs63_syBEEdqdk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAddToCart() {
  console.log('🐛 Debugging addToCart function...');
  
  try {
    // Step 1: Check authentication
    console.log('\n1. Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth result:', { user: user?.id || 'none', error: authError });
    
    if (!user) {
      console.log('❌ User not authenticated - this is the issue!');
      console.log('\nTo test cart functionality:');
      console.log('1. Go to http://localhost:3000/login/customer');
      console.log('2. Log in with your customer account');
      console.log('3. Try adding products to cart');
      return;
    }
    
    // Step 2: Get a test product
    console.log('\n2. Getting test product...');
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .gt('stock_quantity', 0)
      .limit(1);
      
    if (productError || !products || products.length === 0) {
      console.log('❌ No products available:', productError);
      return;
    }
    
    const testProduct = products[0];
    console.log('Test product:', testProduct);
    
    // Step 3: Test addToCart functionality
    console.log('\n3. Testing addToCart...');
    
    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart')
      .select('*')
      .eq('customer_id', user.id)
      .eq('product_id', testProduct.id)
      .single();
    
    console.log('Existing cart item:', existing);
    
    if (existing) {
      console.log('Updating existing cart item...');
      const { data, error } = await supabase
        .from('cart')
        .update({ 
          quantity: existing.quantity + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
        
      console.log('Update result:', { data, error });
    } else {
      console.log('Adding new cart item...');
      const { data, error } = await supabase
        .from('cart')
        .insert({
          customer_id: user.id,
          product_id: testProduct.id,
          quantity: 1
        })
        .select()
        .single();
        
      console.log('Insert result:', { data, error });
    }
    
  } catch (error) {
    console.error('💥 Debug error:', error);
  }
}

debugAddToCart();
