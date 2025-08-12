const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMTc0MiwiZXhwIjoyMDY5ODc3NzQyfQ.jNk4vw9UUXdSkd4uRNpfyVuZacF0cLdVFjJmHD_oa3k';

// Use service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestOrdersForStockTesting() {
  console.log('🚀 CREATING TEST DATA FOR STOCK TESTING');
  console.log('=====================================\n');

  try {
    // 1. Create test customer user
    console.log('1. Creating test customer...');
    const { data: customerUser, error: customerError } = await supabase.auth.admin.createUser({
      email: 'customer@test.com',
      password: 'password123',
      email_confirm: true
    });

    if (customerError) {
      console.log('❌ Customer creation failed:', customerError.message);
      return;
    }
    console.log('✅ Test customer created:', customerUser.user.email);

    // 2. Create customer profile
    const { error: profileError } = await supabase
      .from('customer_profiles')
      .insert({
        id: customerUser.user.id,
        first_name: 'Test',
        last_name: 'Customer',
        address: '123 Test Street, Test City',
        contact_number: '555-1234',
        country: 'Test Country',
        profile_completed: true
      });

    if (profileError) {
      console.log('❌ Customer profile creation failed:', profileError.message);
    } else {
      console.log('✅ Customer profile created');
    }

    // 3. Get existing products and seller
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .gt('stock_quantity', 5)
      .limit(3);

    if (!products || products.length === 0) {
      console.log('❌ No products available for testing');
      return;
    }

    console.log(`✅ Found ${products.length} products for testing`);

    // 4. Create test order
    console.log('\n2. Creating test order...');
    const totalAmount = products.reduce((sum, product) => sum + product.price, 0);
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerUser.user.id,
        total_amount: totalAmount,
        shipping_address: '123 Test Street, Test City, 12345',
        payment_method: 'card',
        status: 'pending',
        payment_status: 'paid',
        notes: 'Test order for stock management testing'
      })
      .select()
      .single();

    if (orderError) {
      console.log('❌ Order creation failed:', orderError.message);
      return;
    }
    console.log('✅ Test order created:', order.id);

    // 5. Create order items for each product
    console.log('\n3. Creating order items...');
    for (const product of products) {
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: product.id,
          seller_id: product.seller_id,
          customer_id: customerUser.user.id,
          product_name: product.name,
          product_price: product.price,
          quantity: 2, // Order 2 of each item
          subtotal: product.price * 2,
          status: 'pending'
        })
        .select()
        .single();

      if (itemError) {
        console.log(`❌ Order item creation failed for ${product.name}:`, itemError.message);
      } else {
        console.log(`✅ Order item created: ${product.name} x2`);
      }
    }

    console.log('\n🎉 TEST DATA CREATED SUCCESSFULLY!');
    console.log('\n📋 What you can now test:');
    console.log('1. Login as a seller at: http://localhost:3000/login/seller');
    console.log('2. Go to seller dashboard to see pending orders');
    console.log('3. Accept some order items and check if stock decreases');
    console.log('4. Decline some order items and check if stock stays the same');
    console.log('\n🔑 Test credentials:');
    console.log('Customer: customer@test.com / password123');
    console.log('Use existing seller credentials from your seller_profiles table');

    // Display current stock levels
    console.log('\n📦 Current stock levels:');
    products.forEach(product => {
      console.log(`   ${product.name}: ${product.stock_quantity} in stock`);
    });

  } catch (error) {
    console.error('💥 Setup error:', error);
  }
}

createTestOrdersForStockTesting();
