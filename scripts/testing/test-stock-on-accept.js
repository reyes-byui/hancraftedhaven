const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://prmzuvaafwucuygchwhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybXp1dmFhZnd1Y3V5Z2Nod2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0OTE5MTYsImV4cCI6MjA0NDA2NzkxNn0.L5HTJQWvFM1l7WZC1Hfc9XFPLLTIhYhQLhHqLW4e4eM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStockOnAccept() {
  console.log('🧪 Testing Stock Deduction on Seller Accept...\n');

  try {
    // 1. Find a product with stock
    console.log('1. Finding a product with stock...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .gt('stock_quantity', 5)
      .limit(1);

    if (productsError || !products?.length) {
      console.log('❌ No products with sufficient stock found');
      return;
    }

    const testProduct = products[0];
    console.log(`✅ Using product: ${testProduct.name} (Stock: ${testProduct.stock_quantity})`);

    // 2. Find a pending order item for this product
    console.log('\n2. Finding a pending order item...');
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id, quantity, status, product_id, products(name)')
      .eq('product_id', testProduct.id)
      .eq('status', 'pending')
      .limit(1);

    if (orderItemsError || !orderItems?.length) {
      console.log('❌ No pending order items found for this product');
      console.log('💡 Create an order first to test this functionality');
      return;
    }

    const orderItem = orderItems[0];
    console.log(`✅ Found pending order item: ${orderItem.quantity}x ${testProduct.name}`);

    // 3. Check current stock before accepting
    console.log('\n3. Checking stock before acceptance...');
    const { data: beforeProduct } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single();
    
    console.log(`📦 Current stock: ${beforeProduct.stock_quantity}`);

    // 4. Simulate seller accepting the order (change status to processing)
    console.log('\n4. Simulating seller acceptance (pending → processing)...');
    const { data: updatedItem, error: updateError } = await supabase
      .from('order_items')
      .update({ status: 'processing' })
      .eq('id', orderItem.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Error updating order item:', updateError.message);
      return;
    }

    console.log('✅ Order item status updated to processing');

    // 5. Check stock after accepting
    console.log('\n5. Checking stock after acceptance...');
    const { data: afterProduct } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single();

    console.log(`📦 Stock after acceptance: ${afterProduct.stock_quantity}`);

    // 6. Calculate and verify the change
    const stockChange = beforeProduct.stock_quantity - afterProduct.stock_quantity;
    console.log(`📊 Stock change: -${stockChange} (expected: -${orderItem.quantity})`);

    if (stockChange === orderItem.quantity) {
      console.log('✅ SUCCESS: Stock was correctly deducted when seller accepted!');
    } else {
      console.log('❌ FAILURE: Stock deduction does not match expected amount');
    }

    // 7. Test declining (revert back to pending to test)
    console.log('\n7. Testing decline (processing → cancelled)...');
    
    const { error: cancelError } = await supabase
      .from('order_items')
      .update({ status: 'cancelled' })
      .eq('id', orderItem.id);

    if (cancelError) {
      console.log('❌ Error cancelling order item:', cancelError.message);
      return;
    }

    // Check stock after cancellation
    const { data: afterCancelProduct } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', testProduct.id)
      .single();

    console.log(`📦 Stock after cancellation: ${afterCancelProduct.stock_quantity}`);
    
    const restoredStock = afterCancelProduct.stock_quantity - afterProduct.stock_quantity;
    console.log(`📊 Stock restored: +${restoredStock} (expected: +${orderItem.quantity})`);

    if (restoredStock === orderItem.quantity) {
      console.log('✅ SUCCESS: Stock was correctly restored when order was cancelled!');
    } else {
      console.log('❌ FAILURE: Stock restoration does not match expected amount');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testStockOnAccept().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
