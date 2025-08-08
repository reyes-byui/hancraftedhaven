// Setup product review system by running the SQL setup file
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function setupProductReviewSystem() {
  console.log('🔧 SETTING UP PRODUCT REVIEW SYSTEM...')
  
  try {
    // Read the SQL setup file
    const sqlContent = fs.readFileSync('docs/PRODUCT_REVIEW_SYSTEM_SETUP.sql', 'utf8')
    
    // Split into individual statements (rough split by semicolon and newline)
    const statements = sqlContent
      .split(/;\s*\n/)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'SELECT \'Product Review System setup completed successfully!\' as status')
      .map(stmt => stmt.endsWith(';') ? stmt : stmt + ';')

    console.log(`📝 Found ${statements.length} SQL statements to execute...`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip empty statements and comments
      if (!statement.trim() || statement.trim().startsWith('--')) {
        continue
      }

      console.log(`\n[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
        
        if (error) {
          // Try direct query execution as fallback
          const { error: directError } = await supabase
            .from('_dummy_table_that_does_not_exist')
            .select('*')
          
          // Since exec_sql doesn't exist, let's try a different approach
          console.log(`⚠️ Using alternative execution method...`)
          
          // For now, we'll just log the statement - user needs to run it manually
          console.log(`❌ Cannot execute automatically. Please run this in Supabase SQL editor:`)
          console.log(statement)
        } else {
          console.log('✅ Success')
        }
      } catch (err) {
        console.log(`❌ Error: ${err.message}`)
      }
    }

    console.log('\n🧪 TESTING REVIEW FUNCTIONS...')
    
    // Test if the functions were created
    try {
      const { data: reviewsData, error: reviewsError } = await supabase.rpc('get_product_reviews', {
        p_product_id: '2ee7eee3-bd13-4b74-8d6e-6d19eac783ee',
        p_limit: 1,
        p_offset: 0,
        p_order_by: 'newest'
      })

      if (reviewsError) {
        console.log(`❌ get_product_reviews function: ${reviewsError.message}`)
      } else {
        console.log('✅ get_product_reviews function works!')
      }

      const { data: summaryData, error: summaryError } = await supabase.rpc('get_product_rating_summary', {
        p_product_id: '2ee7eee3-bd13-4b74-8d6e-6d19eac783ee'
      })

      if (summaryError) {
        console.log(`❌ get_product_rating_summary function: ${summaryError.message}`)
      } else {
        console.log('✅ get_product_rating_summary function works!')
      }

    } catch (error) {
      console.log(`❌ Test error: ${error.message}`)
    }

  } catch (err) {
    console.error('❌ Setup error:', err.message)
  }

  console.log('\n📋 MANUAL SETUP INSTRUCTIONS:')
  console.log('If automatic setup failed, please:')
  console.log('1. Go to your Supabase Dashboard → SQL Editor')
  console.log('2. Copy and paste the contents of docs/PRODUCT_REVIEW_SYSTEM_SETUP.sql')
  console.log('3. Click "Run" to execute all the SQL statements')
  console.log('4. This will create the tables, functions, and policies needed for reviews')
}

setupProductReviewSystem().catch(console.error)
