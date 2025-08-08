const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function diagnoseTables() {
  console.log('🔍 DIAGNOSING TABLE STRUCTURE CONFLICTS')
  console.log('=' .repeat(50))

  try {
    // Check for both table structures
    console.log('\n1️⃣ Checking "profiles" table...')
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(3)
      
      if (profilesError) {
        console.log('❌ profiles table:', profilesError.message)
      } else {
        console.log(`✅ profiles table exists: ${profiles.length} records`)
        if (profiles.length > 0) {
          console.log('   Sample columns:', Object.keys(profiles[0]))
        }
      }
    } catch (e) {
      console.log('❌ profiles table error:', e.message)
    }

    console.log('\n2️⃣ Checking "customer_profiles" table...')
    try {
      const { data: customerProfiles, error: customerError } = await supabase
        .from('customer_profiles')
        .select('*')
        .limit(3)
      
      if (customerError) {
        console.log('❌ customer_profiles table:', customerError.message)
      } else {
        console.log(`✅ customer_profiles table exists: ${customerProfiles.length} records`)
        if (customerProfiles.length > 0) {
          console.log('   Sample columns:', Object.keys(customerProfiles[0]))
        }
      }
    } catch (e) {
      console.log('❌ customer_profiles table error:', e.message)
    }

    console.log('\n3️⃣ Checking "orders" table structure...')
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(1)
      
      if (ordersError) {
        console.log('❌ orders table:', ordersError.message)
      } else {
        console.log(`✅ orders table exists: ${orders.length} records`)
        if (orders.length > 0) {
          console.log('   Sample columns:', Object.keys(orders[0]))
        }
      }
    } catch (e) {
      console.log('❌ orders table error:', e.message)
    }

    console.log('\n4️⃣ Checking "cart" table structure...')
    try {
      const { data: cart, error: cartError } = await supabase
        .from('cart')
        .select('*')
        .limit(1)
      
      if (cartError) {
        console.log('❌ cart table:', cartError.message)
      } else {
        console.log(`✅ cart table exists: ${cart.length} records`)
        if (cart.length > 0) {
          console.log('   Sample columns:', Object.keys(cart[0]))
        }
      }
    } catch (e) {
      console.log('❌ cart table error:', e.message)
    }

    console.log('\n5️⃣ Checking foreign key constraints...')
    try {
      // Check which table orders references
      const { data: constraints } = await supabase.rpc('sql', {
        query: `
          SELECT 
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND (tc.table_name IN ('orders', 'cart', 'order_items'))
          ORDER BY tc.table_name;
        `
      })

      if (constraints && constraints.length > 0) {
        console.log('✅ Foreign key constraints found:')
        constraints.forEach(constraint => {
          console.log(`   ${constraint.table_name}.${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name}`)
        })
      } else {
        console.log('❌ No foreign key constraints found or query failed')
      }
    } catch (e) {
      console.log('❌ Constraint check error:', e.message)
    }

    console.log('\n6️⃣ Testing order creation with current user...')
    try {
      // Get current authenticated user if any
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.log('❌ No authenticated user found')
      } else {
        console.log(`✅ Current user: ${user.email} (${user.id})`)
        
        // Check if user exists in customer_profiles
        const { data: customerProfile } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (customerProfile) {
          console.log('✅ User has customer_profiles record')
        } else {
          console.log('❌ User missing from customer_profiles')
        }

        // Check if user exists in profiles (if table exists)
        try {
          const { data: profileRecord } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

          if (profileRecord) {
            console.log('✅ User has profiles record')
          } else {
            console.log('❌ User missing from profiles')
          }
        } catch (e) {
          console.log('❌ profiles table not accessible:', e.message)
        }
      }
    } catch (e) {
      console.log('❌ User check error:', e.message)
    }

  } catch (error) {
    console.error('💥 Overall error:', error)
  }
}

diagnoseTables()
