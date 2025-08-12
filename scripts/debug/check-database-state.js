const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client  
const supabaseUrl = 'https://prmzuvaafwucuygchwhc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybXp1dmFhZnd1Y3V5Z2Nod2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0OTE5MTYsImV4cCI6MjA0NDA2NzkxNn0.L5HTJQWvFM1l7WZC1Hfc9XFPLLTIhYhQLhHqLW4e4eM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database state...\n');

  try {
    // Check products
    console.log('1. Checking products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .limit(10);

    if (productsError) {
      console.log('❌ Error fetching products:', productsError.message);
    } else {
      console.log(`✅ Found ${products?.length || 0} products:`);
      products?.forEach(p => {
        console.log(`   - ${p.name}: ${p.stock_quantity} stock`);
      });
    }

    // Check orders
    console.log('\n2. Checking orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .limit(5);

    if (ordersError) {
      console.log('❌ Error fetching orders:', ordersError.message);
    } else {
      console.log(`✅ Found ${orders?.length || 0} orders:`);
      orders?.forEach(o => {
        console.log(`   - Order ${o.id}: ${o.status} (${new Date(o.created_at).toLocaleDateString()})`);
      });
    }

    // Check order items
    console.log('\n3. Checking order items...');
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, quantity, status, product_id, products(name)')
      .limit(5);

    if (itemsError) {
      console.log('❌ Error fetching order items:', itemsError.message);
    } else {
      console.log(`✅ Found ${orderItems?.length || 0} order items:`);
      orderItems?.forEach(item => {
        console.log(`   - ${item.quantity}x ${item.products?.name || 'Unknown'}: ${item.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase().then(() => {
  console.log('\n🏁 Database check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});
