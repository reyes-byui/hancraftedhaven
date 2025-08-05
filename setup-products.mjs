import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMTc0MiwiZXhwIjoyMDY5ODc3NzQyfQ.Ha4po0lVtUv0bffNWOGeb-6ZOaingrypUdWeWqGA43c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupProductDatabase() {
  console.log('🛠️ Setting up products database and storage...\n');
  
  try {
    // Check if products table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('⚠️ Products table does not exist. Please run the SQL scripts in Supabase SQL Editor:');
      console.log('1. docs/create_products_table.sql');
      console.log('2. docs/create_product_images_storage.sql');
      return;
    }
    
    console.log('✅ Products table exists');
    
    // Check if storage bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error checking storage buckets:', bucketError);
      return;
    }
    
    const productImagesBucket = buckets?.find(bucket => bucket.id === 'product-images');
    
    if (!productImagesBucket) {
      console.log('⚠️ Product images storage bucket does not exist. Please run:');
      console.log('docs/create_product_images_storage.sql');
      return;
    }
    
    console.log('✅ Product images storage bucket exists');
    
    // Test product creation
    console.log('\n🧪 Testing product creation...');
    
    const testProduct = {
      name: 'Test Handcrafted Bowl',
      description: 'Beautiful ceramic bowl made with love',
      category: 'Ceramics & Pottery',
      price: 29.99,
      discount_percentage: 10,
      stock_quantity: 5
    };
    
    // Get first seller to test with
    const { data: sellers, error: sellersError } = await supabase
      .from('seller_profiles')
      .select('id')
      .limit(1);
    
    if (sellersError || !sellers || sellers.length === 0) {
      console.log('⚠️ No sellers found. Please ensure there are seller profiles in the database.');
      return;
    }
    
    const sellerId = sellers[0].id;
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        seller_id: sellerId,
        ...testProduct
      })
      .select()
      .single();
    
    if (productError) {
      console.error('❌ Error creating test product:', productError);
      return;
    }
    
    console.log('✅ Test product created successfully:', product.name);
    
    // Clean up test product
    await supabase
      .from('products')
      .delete()
      .eq('id', product.id);
    
    console.log('✅ Test product cleaned up');
    
    console.log('\n🎉 Products system is ready to use!');
    console.log('\nWhat you can do now:');
    console.log('1. Go to http://localhost:3001/account/seller');
    console.log('2. Click "Add Product" to create your first product listing');
    console.log('3. Fill in the product details and upload an image');
    console.log('4. View your products in the "My Products" tab');
    
  } catch (error) {
    console.error('💥 Setup error:', error);
  }
}

setupProductDatabase();
