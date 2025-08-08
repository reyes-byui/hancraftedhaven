// Execute the product review system setup using direct HTTP API calls
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function executeSQL() {
  console.log('🔧 EXECUTING PRODUCT REVIEW SYSTEM SETUP...')
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('docs/PRODUCT_REVIEW_SYSTEM_SETUP.sql', 'utf8')
    
    // Remove comments and completion message
    const cleanSQL = sqlContent
      .replace(/--.*$/gm, '') // Remove line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/SELECT 'Product Review System setup completed successfully!' as status;/g, '')
      .trim()

    console.log('📝 Executing SQL directly via REST API...')
    
    // Use Supabase REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: cleanSQL
      })
    })

    if (!response.ok) {
      // If direct execution fails, let's try executing via psql connection string
      console.log('❌ Direct API execution failed, trying alternative...')
      
      // Extract database connection details from Supabase URL
      const urlParts = supabaseUrl.replace('https://', '').split('.')
      const projectRef = urlParts[0]
      
      console.log(`\n📋 MANUAL SETUP REQUIRED:`)
      console.log(`\n1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/${projectRef}`)
      console.log(`2. Navigate to SQL Editor (left sidebar)`)
      console.log(`3. Copy the entire contents of docs/PRODUCT_REVIEW_SYSTEM_SETUP.sql`)
      console.log(`4. Paste into the SQL Editor and click "Run"`)
      console.log(`\n🎯 This will create the missing database functions that fix the review error.`)
      
      return false
    } else {
      console.log('✅ SQL executed successfully!')
      return true
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function testReviewFunctions() {
  console.log('\n🧪 TESTING REVIEW FUNCTIONS...')
  
  try {
    // Test the functions by making a simple HTTP request
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_product_reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        p_product_id: '2ee7eee3-bd13-4b74-8d6e-6d19eac783ee',
        p_limit: 1
      })
    })

    if (testResponse.ok) {
      console.log('✅ get_product_reviews function exists and works!')
      
      const summaryResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_product_rating_summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          p_product_id: '2ee7eee3-bd13-4b74-8d6e-6d19eac783ee'
        })
      })

      if (summaryResponse.ok) {
        console.log('✅ get_product_rating_summary function exists and works!')
        console.log('\n🎉 SUCCESS! The review error should be fixed now!')
        console.log('🌐 Try visiting: http://localhost:3000/products/2ee7eee3-bd13-4b74-8d6e-6d19eac783ee')
        return true
      }
    }
    
    console.log('❌ Functions not found - manual setup still required')
    return false
    
  } catch (error) {
    console.log('❌ Test failed - functions likely missing')
    return false
  }
}

async function main() {
  const setupSuccess = await executeSQL()
  
  if (setupSuccess) {
    await testReviewFunctions()
  } else {
    console.log('\n⚠️ Automatic setup failed. Please run the SQL manually in Supabase Dashboard.')
    console.log('\n📋 Quick Manual Steps:')
    console.log('1. Open Supabase Dashboard → SQL Editor')
    console.log('2. Copy all text from docs/PRODUCT_REVIEW_SYSTEM_SETUP.sql')
    console.log('3. Paste and click "Run"')
    console.log('4. Refresh your product page - error should be gone!')
  }
}

main().catch(console.error)
