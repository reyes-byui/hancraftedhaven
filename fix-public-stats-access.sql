-- Allow public read access for marketplace statistics
-- This enables anonymous users to see customer/order counts on the homepage

-- Allow public read access to customer_profiles for counting
DROP POLICY IF EXISTS "Enable public read access for customer count" ON customer_profiles;
CREATE POLICY "Enable public read access for customer count" ON customer_profiles
FOR SELECT TO anon USING (true);

-- Allow public read access to order_items for product sales statistics
DROP POLICY IF EXISTS "Enable public read access for order items count" ON order_items;
CREATE POLICY "Enable public read access for order items count" ON order_items
FOR SELECT TO anon USING (true);

-- Allow public read access to orders for joining with order_items
DROP POLICY IF EXISTS "Enable public read access for orders" ON orders;
CREATE POLICY "Enable public read access for orders" ON orders
FOR SELECT TO anon USING (true);

-- Allow public read access to seller_profiles for active artisan count
DROP POLICY IF EXISTS "Enable public read access for seller count" ON seller_profiles;
CREATE POLICY "Enable public read access for seller count" ON seller_profiles
FOR SELECT TO anon USING (true);
