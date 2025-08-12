const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDE3NDIsImV4cCI6MjA2OTg3Nzc0Mn0.6WdJ8hpFonhODlnhq7vMWxXhLGJQ8Cs63_syBEEdqdk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseTables() {
  console.log('🔍 CHECKING DATABASE TABLES');
  console.log('==========================\n');

  try {
    // 1. Check if orders table exists and has data
    console.log('1. Checking orders table...');
    try {
      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(100);

      if (ordersError) {
        console.log('❌ Orders table error:', ordersError.message);
        console.log('❌ Orders table might not exist or have permission issues');
      } else {
        console.log(`✅ Orders table exists with ${allOrders.length} total records`);
        if (allOrders.length > 0) {
          console.log('Sample order:', JSON.stringify(allOrders[0], null, 2));
        }
      }
    } catch (e) {
      console.log('❌ Orders table check failed:', e.message);
    }

    // 2. Check if order_items table exists and has data
    console.log('\n2. Checking order_items table...');
    try {
      const { data: allOrderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .limit(100);

      if (itemsError) {
        console.log('❌ Order items table error:', itemsError.message);
        console.log('❌ Order items table might not exist or have permission issues');
      } else {
        console.log(`✅ Order items table exists with ${allOrderItems.length} total records`);
        if (allOrderItems.length > 0) {
          console.log('Sample order item:', JSON.stringify(allOrderItems[0], null, 2));
        }
      }
    } catch (e) {
      console.log('❌ Order items table check failed:', e.message);
    }

    // 3. Check if cart table exists and has data
    console.log('\n3. Checking cart table...');
    try {
      const { data: cartItems, error: cartError } = await supabase
        .from('cart')
        .select('*')
        .limit(10);

      if (cartError) {
        console.log('❌ Cart table error:', cartError.message);
      } else {
        console.log(`✅ Cart table exists with ${cartItems.length} items`);
        if (cartItems.length > 0) {
          console.log('Sample cart item:', JSON.stringify(cartItems[0], null, 2));
        }
      }
    } catch (e) {
      console.log('❌ Cart table check failed:', e.message);
    }

    // 4. Check products table (we know this works)
    console.log('\n4. Confirming products table...');
    const { data: products } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .limit(3);
    console.log(`✅ Products table works with ${products.length} products`);

    // 5. Check auth and user profiles
    console.log('\n5. Checking user profiles...');
    try {
      const { data: customerProfiles } = await supabase
        .from('customer_profiles')
        .select('*')
        .limit(5);
      console.log(`✅ Customer profiles: ${customerProfiles?.length || 0} records`);
    } catch (e) {
      console.log('❌ Customer profiles error:', e.message);
    }

    try {
      const { data: sellerProfiles } = await supabase
        .from('seller_profiles')
        .select('*')
        .limit(5);
      console.log(`✅ Seller profiles: ${sellerProfiles?.length || 0} records`);
    } catch (e) {
      console.log('❌ Seller profiles error:', e.message);
    }

  } catch (error) {
    console.error('💥 Database check error:', error);
  }
}

checkDatabaseTables();
