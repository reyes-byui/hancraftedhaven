const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://prmzuvaafwucuygchwhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybXp1dmFhZnd1Y3V5Z2Nod2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0OTE5MTYsImV4cCI6MjA0NDA2NzkxNn0.L5HTJQWvFM1l7WZC1Hfc9XFPLLTIhYhQLhHqLW4e4eM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStockFlow() {
  console.log('🔍 Testing Order and Stock Flow...\n');

  try {
    // 1. Check existing products and their stock
    console.log('1. Current products and stock levels:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .limit(5);

    if (productsError) {
      console.log('❌ Error fetching products:', productsError.message);
      return;
    }

    if (!products?.length) {
      console.log('❌ No products found');
      return;
    }

    console.log('📦 Products:');
    products.forEach(p => {
      console.log(`   - ${p.name}: ${p.stock_quantity} stock (ID: ${p.id.substring(0, 8)}...)`);
    });

    // 2. Check for pending order items
    console.log('\n2. Checking for pending order items...');
    const { data: pendingItems, error: pendingError } = await supabase
      .from('order_items')
      .select('id, quantity, status, product_id, products(name)')
      .eq('status', 'pending')
      .limit(5);

    if (pendingError) {
      console.log('❌ Error fetching pending items:', pendingError.message);
      return;
    }

    if (!pendingItems?.length) {
      console.log('❌ No pending order items found');
      console.log('💡 You need to place an order first to test stock deduction');
      return;
    }

    console.log('📋 Pending order items:');
    pendingItems.forEach(item => {
      console.log(`   - ${item.quantity}x ${item.products?.name || 'Unknown'} (Item ID: ${item.id.substring(0, 8)}...)`);
    });

    // 3. Test stock deduction by updating one pending item to processing
    const testItem = pendingItems[0];
    console.log(`\n3. Testing stock deduction with item: ${testItem.quantity}x ${testItem.products?.name}`);
    
    // Get current stock before update
    const { data: beforeProduct } = await supabase
      .from('products')
      .select('stock_quantity, name')
      .eq('id', testItem.product_id)
      .single();

    console.log(`📦 Current stock before acceptance: ${beforeProduct.stock_quantity}`);

    // Simulate seller accepting the order item (this should trigger stock deduction)
    console.log('🔄 Updating order item from pending to processing...');
    const { data: updatedItem, error: updateError } = await supabase
      .from('order_items')
      .update({ status: 'processing' })
      .eq('id', testItem.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Error updating order item:', updateError.message);
      return;
    }

    console.log('✅ Order item status updated to processing');

    // Wait a moment for any potential triggers to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check stock after update
    const { data: afterProduct } = await supabase
      .from('products')
      .select('stock_quantity, name')
      .eq('id', testItem.product_id)
      .single();

    console.log(`📦 Stock after acceptance: ${afterProduct.stock_quantity}`);

    // Calculate the difference
    const stockChange = beforeProduct.stock_quantity - afterProduct.stock_quantity;
    console.log(`📊 Stock change: ${stockChange} (expected: ${testItem.quantity})`);

    if (stockChange === testItem.quantity) {
      console.log('✅ SUCCESS: Stock was correctly deducted!');
    } else if (stockChange === 0) {
      console.log('❌ PROBLEM: Stock was NOT deducted when seller accepted the order');
      console.log('💡 This means the stock deduction logic is not working properly');
    } else {
      console.log(`❌ UNEXPECTED: Stock changed by ${stockChange} but expected ${testItem.quantity}`);
    }

    // 4. Test cancellation (should restore stock)
    console.log('\n4. Testing stock restoration by cancelling the order...');
    const { error: cancelError } = await supabase
      .from('order_items')
      .update({ status: 'cancelled' })
      .eq('id', testItem.id);

    if (cancelError) {
      console.log('❌ Error cancelling order item:', cancelError.message);
      return;
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check stock after cancellation
    const { data: afterCancelProduct } = await supabase
      .from('products')
      .select('stock_quantity, name')
      .eq('id', testItem.product_id)
      .single();

    console.log(`📦 Stock after cancellation: ${afterCancelProduct.stock_quantity}`);
    
    const restoredStock = afterCancelProduct.stock_quantity - afterProduct.stock_quantity;
    console.log(`📊 Stock restored: ${restoredStock} (expected: ${testItem.quantity})`);

    if (restoredStock === testItem.quantity) {
      console.log('✅ SUCCESS: Stock was correctly restored!');
    } else if (restoredStock === 0) {
      console.log('❌ PROBLEM: Stock was NOT restored when order was cancelled');
    } else {
      console.log(`❌ UNEXPECTED: Stock restoration was ${restoredStock} but expected ${testItem.quantity}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testStockFlow().then(() => {
  console.log('\n🏁 Stock flow test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
