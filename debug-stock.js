// Debug script to test stock management
// Run this with: node debug-stock.js

const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
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
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.log('Could not load .env.local file:', error.message);
  }
}

loadEnvFile();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testStockFunctions() {
  console.log('=== Testing Stock Management Functions ===');

  try {
    // Test 1: Check if SQL functions exist
    console.log('\n1. Testing SQL function existence...');
    
    const { data, error } = await supabase
      .rpc('get_product_stock_status', {
        product_id_param: '00000000-0000-0000-0000-000000000000' // dummy UUID
      });

    if (error && error.code === '42883') {
      console.log('❌ SQL functions not found in database. Need to run STOCK_MANAGEMENT.sql first');
    } else if (error) {
      console.log('⚠️ SQL function exists but failed:', error.message);
    } else {
      console.log('✅ SQL functions are available');
    }

    // Test 2: Get all products and their stock
    console.log('\n2. Current product stock levels...');
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, seller_id')
      .limit(10);

    if (productsError) {
      console.log('❌ Error fetching products:', productsError.message);
    } else {
      console.log('📦 Products in database:');
      products.forEach(product => {
        console.log(`   - ${product.name}: ${product.stock_quantity} in stock (ID: ${product.id})`);
      });
    }

    // Test 3: Check recent orders
    console.log('\n3. Recent orders...');
    
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id, 
        total_amount, 
        status,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.log('❌ Error fetching orders:', ordersError.message);
    } else {
      console.log(`📋 Found ${orders.length} orders:`);
      orders.forEach(order => {
        console.log(`   Order ${order.id.substring(0, 8)}... - $${order.total_amount} - ${order.status} (${order.created_at})`);
      });
    }

    // Test 4: Check order items separately
    console.log('\n4. Recent order items...');
    
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('id, product_id, product_name, quantity, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (itemsError) {
      console.log('❌ Error fetching order items:', itemsError.message);
    } else {
      console.log(`📋 Found ${orderItems.length} order items:`);
      orderItems.forEach(item => {
        console.log(`   ${item.product_name} x${item.quantity} - ${item.status} (${item.created_at})`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStockFunctions();
