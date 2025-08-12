const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDE3NDIsImV4cCI6MjA2OTg3Nzc0Mn0.6WdJ8hpFonhODlnhq7vMWxXhLGJQ8Cs63_syBEEdqdk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRealStockIssue() {
  console.log('🔍 DEBUGGING REAL STOCK ISSUE');
  console.log('============================\n');

  try {
    // 1. Check current products and their stock levels
    console.log('1. Current products and stock levels:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, seller_id')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.log('❌ Error fetching products:', productsError.message);
      return;
    }

    console.log(`📦 Found ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}: ${product.stock_quantity} in stock (ID: ${product.id.substring(0, 8)}...)`);
    });

    // 2. Check recent orders and their status
    console.log('\n2. Recent orders:');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.log('❌ Error fetching orders:', ordersError.message);
    } else {
      console.log(`📋 Found ${orders.length} recent orders:`);
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. Order ${order.id.substring(0, 8)}... - $${order.total_amount} - ${order.status} (${new Date(order.created_at).toLocaleString()})`);
      });
    }

    // 3. Check order items and their individual status
    console.log('\n3. Recent order items and their status:');
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, product_id, product_name, quantity, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (itemsError) {
      console.log('❌ Error fetching order items:', itemsError.message);
    } else {
      console.log(`📋 Found ${orderItems.length} recent order items:`);
      orderItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.product_name} x${item.quantity} - Status: ${item.status} (${new Date(item.created_at).toLocaleString()})`);
      });

      // 4. Analyze which items were accepted but stock might not have been updated
      const acceptedItems = orderItems.filter(item => item.status === 'processing' || item.status === 'shipped' || item.status === 'delivered');
      console.log(`\n4. ACCEPTED/PROCESSED items (${acceptedItems.length}):`);
      
      for (const item of acceptedItems) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          console.log(`   ⚡ ${item.product_name} x${item.quantity} was accepted, current stock: ${product.stock_quantity}`);
        }
      }
    }

    // 5. Check if there are any auth users with real data
    console.log('\n5. Check for real user sessions:');
    try {
      const { data: authData } = await supabase.auth.getSession();
      console.log('Current auth session:', authData.session ? 'Logged in' : 'Not logged in');
    } catch (authError) {
      console.log('Auth check failed:', authError.message);
    }

  } catch (error) {
    console.error('💥 Debug error:', error);
  }
}

debugRealStockIssue();
