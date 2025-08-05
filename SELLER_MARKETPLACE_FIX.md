# Fix Seller Marketplace Display Issue

## Problem
The sellers are not displaying on the marketplace page because the current RLS (Row Level Security) policies only allow users to see their own profiles. For the marketplace to work, anonymous users need to be able to see completed seller profiles.

## Solution
Run the SQL script `fix_seller_marketplace_rls.sql` in your Supabase SQL Editor.

## Steps to Fix:

1. Open your Supabase Dashboard at https://supabase.com/dashboard
2. Navigate to your project: `hancraftedhaven`
3. Go to the SQL Editor (in the left sidebar)
4. Copy and paste the contents of `docs/fix_seller_marketplace_rls.sql`
5. Click "Run" to execute the SQL

## What this does:
- Removes the restrictive RLS policy that only allowed users to see their own profiles
- Adds a new policy that allows public read access to seller profiles where `profile_completed = true`
- Maintains security by still requiring authentication for insert/update/delete operations
- Allows the sellers marketplace page to display completed seller profiles to all visitors

## After running the SQL:
- Refresh the sellers page at http://localhost:3002/sellers
- You should now see the seller profiles in the debug information
- Remove the debug section once confirmed working
