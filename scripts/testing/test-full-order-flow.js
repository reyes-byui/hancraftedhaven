const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDE3NDIsImV4cCI6MjA2OTg3Nzc0Mn0.6WdJ8hpFonhODlnhq7vMWxXhLGJQ8Cs63_syBEEdqdk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullOrderFlow() {
  console.log('🧪 TESTING FULL ORDER FLOW');
  console.log('===========================\n');

  try {
    // 1. Get available products
    console.log('1. Getting available products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .gt('stock_quantity', 0)
      .limit(1);

    if (productsError || !products || products.length === 0) {
      console.log('❌ No products available:', productsError?.message);
      return;
    }

    const testProduct = products[0];
    console.log(`✅ Using product: ${testProduct.name} (Stock: ${testProduct.stock_quantity})`);

    // 2. Check if we can get auth users
    console.log('\n2. Checking auth system...');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      console.log(`✅ Auth system working, found ${authUsers?.users?.length || 0} users`);
      
      if (!authUsers?.users?.length) {
        console.log('❌ No users in auth system - this explains why no orders!');
        console.log('💡 SOLUTION: Users need to register/login to place orders');
        return;
      }
    } catch (authError) {
      console.log('❌ Auth system check failed:', authError.message);
    }

    // 3. Try to create a customer profile for testing
    console.log('\n3. Creating test customer profile...');
    
    // First, create a test auth user
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpass123',
      email_confirm: true
    });

    if (createUserError) {
      console.log('❌ Could not create test user:', createUserError.message);
      return;
    }

    console.log('✅ Test user created:', newUser.user.id);

    // Create customer profile
    const { data: customerProfile, error: profileError } = await supabase
      .from('customer_profiles')
      .insert({
        id: newUser.user.id,
        first_name: 'Test',
        last_name: 'Customer',
        address: '123 Test St',
        contact_number: '555-1234',
        country: 'Test Country',
        profile_completed: true
      })
      .select()
      .single();

    if (profileError) {
      console.log('❌ Could not create customer profile:', profileError.message);
    } else {
      console.log('✅ Customer profile created');
    }

    // 4. Try to add item to cart
    console.log('\n4. Testing add to cart...');
    const { data: cartItem, error: cartError } = await supabase
      .from('cart')
      .insert({
        customer_id: newUser.user.id,
        product_id: testProduct.id,
        quantity: 1
      })
      .select()
      .single();

    if (cartError) {
      console.log('❌ Could not add to cart:', cartError.message);
      console.log('This might be due to RLS policies or missing setup');
    } else {
      console.log('✅ Item added to cart successfully');
    }

    // 5. Try to create an order
    console.log('\n5. Testing order creation...');
    const orderData = {
      customer_id: newUser.user.id,
      total_amount: testProduct.price,
      shipping_address: '123 Test St, Test City',
      payment_method: 'card',
      status: 'pending',
      payment_status: 'paid'
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.log('❌ Could not create order:', orderError.message);
      console.log('This explains why there are 0 orders in the system!');
    } else {
      console.log('✅ Order created successfully:', order.id);

      // Try to create order item
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: testProduct.id,
          seller_id: testProduct.seller_id,
          customer_id: newUser.user.id,
          product_name: testProduct.name,
          product_price: testProduct.price,
          quantity: 1,
          subtotal: testProduct.price,
          status: 'pending'
        })
        .select()
        .single();

      if (itemError) {
        console.log('❌ Could not create order item:', itemError.message);
      } else {
        console.log('✅ Order item created successfully');
      }
    }

    // Cleanup
    console.log('\n6. Cleaning up test data...');
    await supabase.auth.admin.deleteUser(newUser.user.id);
    console.log('✅ Test user deleted');

  } catch (error) {
    console.error('💥 Test flow error:', error);
  }
}

testFullOrderFlow();
