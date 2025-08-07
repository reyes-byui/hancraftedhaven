// Quick script to create the shopping cart table
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMTc0MiwiZXhwIjoyMDY5ODc3NzQyfQ.Ha4po0lVtUv0bffNWOGeb-6ZOaingrypUdWeWqGA43c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCartTable() {
  console.log('🛠️ Creating shopping cart table...');
  
  try {
    // First check if cart table already exists
    const { data: existingCart, error: checkError } = await supabase
      .from('cart')
      .select('id')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Cart table already exists');
      return;
    }
    
    if (checkError && !checkError.message.includes('does not exist')) {
      console.error('❌ Error checking cart table:', checkError);
      return;
    }
    
    console.log('📋 Cart table not found, creating it...');
    
    // Create the cart table
    const { error } = await supabase.rpc('sql', {
      query: `
        -- Create cart table for customer shopping cart
        CREATE TABLE IF NOT EXISTS public.cart (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE CASCADE NOT NULL,
          product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
          quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
          updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
          UNIQUE(customer_id, product_id)
        );

        -- Enable RLS for cart table
        ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for cart table
        CREATE POLICY "cart_select_own" ON public.cart
          FOR SELECT TO authenticated
          USING (auth.uid() = customer_id);

        CREATE POLICY "cart_insert_own" ON public.cart
          FOR INSERT TO authenticated
          WITH CHECK (auth.uid() = customer_id);

        CREATE POLICY "cart_update_own" ON public.cart
          FOR UPDATE TO authenticated
          USING (auth.uid() = customer_id)
          WITH CHECK (auth.uid() = customer_id);

        CREATE POLICY "cart_delete_own" ON public.cart
          FOR DELETE TO authenticated
          USING (auth.uid() = customer_id);

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_cart_customer_id ON public.cart(customer_id);
        CREATE INDEX IF NOT EXISTS idx_cart_product_id ON public.cart(product_id);
        CREATE INDEX IF NOT EXISTS idx_cart_updated_at ON public.cart(updated_at DESC);
      `
    });
    
    if (error) {
      console.error('❌ Error creating cart table:', error);
      return;
    }
    
    console.log('✅ Shopping cart table created successfully!');
    console.log('\n🎉 You can now add products to cart!');
    console.log('\nNext steps:');
    console.log('1. Go to http://localhost:3000/listings');
    console.log('2. Log in as a customer');
    console.log('3. Click "Add to Cart" on any product');
    console.log('4. Visit your cart at http://localhost:3000/account/customer/cart');
    
  } catch (error) {
    console.error('💥 Setup error:', error);
  }
}

createCartTable();
