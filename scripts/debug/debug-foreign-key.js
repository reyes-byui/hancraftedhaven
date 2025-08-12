// Debug foreign key constraint issue
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ssidoeuqsbqhetanxdvv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaWRvZXVxc2JxaGV0YW54ZHZ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMTc0MiwiZXhwIjoyMDY5ODc3NzQyfQ.Ha4po0lVtUv0bffNWOGeb-6ZOaingrypUdWeWqGA43c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugForeignKeyIssue() {
  console.log('🔍 Debugging foreign key constraint issue...');
  
  try {
    // Step 1: Check auth users
    console.log('\n1. Checking auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Auth error:', authError);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} auth users:`);
    authUsers.users.forEach((user, i) => {
      console.log(`  ${i+1}. ${user.id} - ${user.email}`);
    });
    
    // Step 2: Check customer profiles
    console.log('\n2. Checking customer_profiles table...');
    const { data: customers, error: customerError } = await supabase
      .from('customer_profiles')
      .select('id, email, first_name, last_name');
      
    if (customerError) {
      console.error('Customer profiles error:', customerError);
      return;
    }
    
    console.log(`Found ${customers.length} customer profiles:`);
    customers.forEach((customer, i) => {
      console.log(`  ${i+1}. ${customer.id} - ${customer.email} (${customer.first_name} ${customer.last_name})`);
    });
    
    // Step 3: Check for mismatched IDs
    console.log('\n3. Checking for auth users without customer profiles...');
    const authUserIds = new Set(authUsers.users.map(u => u.id));
    const customerIds = new Set(customers.map(c => c.id));
    
    const missingProfiles = [];
    authUsers.users.forEach(user => {
      if (!customerIds.has(user.id)) {
        missingProfiles.push(user);
      }
    });
    
    if (missingProfiles.length > 0) {
      console.log('❌ Auth users without customer profiles:');
      missingProfiles.forEach((user, i) => {
        console.log(`  ${i+1}. ${user.id} - ${user.email}`);
      });
      
      console.log('\n🛠️ Fix: Need to create customer profiles for these users');
    } else {
      console.log('✅ All auth users have corresponding customer profiles');
    }
    
    // Step 4: Check cart table structure
    console.log('\n4. Checking cart table foreign key constraints...');
    const { data: constraints, error: constraintError } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            tc.constraint_name,
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
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='cart';
        `
      });
    
    if (constraintError) {
      console.log('Could not check constraints (using service role)');
    } else {
      console.log('Cart table foreign keys:', constraints);
    }
    
  } catch (error) {
    console.error('💥 Debug error:', error);
  }
}

debugForeignKeyIssue();
