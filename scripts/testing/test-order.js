// Test order creation manually
// Run this with: node test-order.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envLines = envFile.split('\n');
    
    envLines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        let value = valueParts.join('=').trim();
        
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.log('Could not load .env file:', error.message);
  }
}

loadEnvFile();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testOrderCreation() {
  console.log('=== Testing Order Creation ===');

  try {
    // Test 1: Check authentication 
    console.log('\n1. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }
    
    if (!user) {
      console.log('❌ No user logged in. Need to log in first.');
      return;
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Test 2: Try to create a simple order manually
    console.log('\n2. Testing direct order creation...');
    
    const testOrder = {
      customer_id: user.id,
      total_amount: 25.00,
      shipping_address: '123 Test St, Test City',
      payment_method: 'card',
      notes: 'Test order'
    };
    
    console.log('Attempting to create order:', testOrder);
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();
    
    if (orderError) {
      console.log('❌ Order creation failed:', orderError.message);
      console.log('Error details:', orderError);
      return;
    }
    
    console.log('✅ Order created successfully:', order.id);
    
    // Test 3: Create order items
    console.log('\n3. Testing order items creation...');
    
    // Get a real product to test with
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, seller_id')
      .limit(1);
    
    if (!products || products.length === 0) {
      console.log('❌ No products found to test with');
      return;
    }
    
    const product = products[0];
    console.log('Using product:', product.name);
    
    const testOrderItem = {
      order_id: order.id,
      product_id: product.id,
      seller_id: product.seller_id,
      customer_id: user.id,
      product_name: product.name,
      product_price: product.price,
      quantity: 1,
      subtotal: product.price,
      status: 'pending'
    };
    
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert(testOrderItem)
      .select()
      .single();
    
    if (itemError) {
      console.log('❌ Order item creation failed:', itemError.message);
      console.log('Error details:', itemError);
      
      // Clean up the order
      await supabase.from('orders').delete().eq('id', order.id);
      return;
    }
    
    console.log('✅ Order item created successfully');
    
    // Test 4: Test stock update function
    console.log('\n4. Testing stock update function...');
    
    const stockData = [{
      product_id: product.id,
      product_name: product.name,
      quantity: 1
    }];
    
    const { data: stockResult, error: stockError } = await supabase
      .rpc('update_stock_for_order', {
        order_items_data: stockData
      });
    
    if (stockError) {
      console.log('❌ Stock update failed:', stockError.message);
    } else {
      console.log('✅ Stock update result:', stockResult);
    }
    
    // Clean up - delete the test order and items
    console.log('\n5. Cleaning up test data...');
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrderCreation();
