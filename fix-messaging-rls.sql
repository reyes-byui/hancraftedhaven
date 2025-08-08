-- Fix RLS policies for messaging system
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on conversations table (if not already enabled)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on messages table (if not already enabled)  
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (safe operation)
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- 4. Create policies for conversations table

-- Allow customers to view conversations where they are the customer
CREATE POLICY "Customers can view their conversations" ON public.conversations
    FOR SELECT 
    USING (
        customer_id IN (
            SELECT id FROM public.customer_profiles WHERE id = auth.uid()
        )
    );

-- Allow sellers to view conversations where they are the seller
CREATE POLICY "Sellers can view their conversations" ON public.conversations
    FOR SELECT 
    USING (
        seller_id IN (
            SELECT id FROM public.seller_profiles WHERE id = auth.uid()
        )
    );

-- Allow customers to create conversations as the customer
CREATE POLICY "Customers can create conversations" ON public.conversations
    FOR INSERT 
    WITH CHECK (
        customer_id IN (
            SELECT id FROM public.customer_profiles WHERE id = auth.uid()
        )
    );

-- Allow updating conversation status and timestamps
CREATE POLICY "Users can update conversations" ON public.conversations
    FOR UPDATE 
    USING (
        customer_id IN (
            SELECT id FROM public.customer_profiles WHERE id = auth.uid()
        ) OR
        seller_id IN (
            SELECT id FROM public.seller_profiles WHERE id = auth.uid()
        )
    );

-- 5. Create policies for messages table

-- Allow users to view messages in conversations they participate in
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT 
    USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE customer_id IN (
                SELECT id FROM public.customer_profiles WHERE id = auth.uid()
            ) OR seller_id IN (
                SELECT id FROM public.seller_profiles WHERE id = auth.uid()
            )
        )
    );

-- Allow users to create messages in conversations they participate in
CREATE POLICY "Users can create messages" ON public.messages
    FOR INSERT 
    WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE customer_id IN (
                SELECT id FROM public.customer_profiles WHERE id = auth.uid()
            ) OR seller_id IN (
                SELECT id FROM public.seller_profiles WHERE id = auth.uid()
            )
        )
    );

-- Allow users to update their own messages (for read status)
CREATE POLICY "Users can update messages in their conversations" ON public.messages
    FOR UPDATE 
    USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE customer_id IN (
                SELECT id FROM public.customer_profiles WHERE id = auth.uid()
            ) OR seller_id IN (
                SELECT id FROM public.seller_profiles WHERE id = auth.uid()
            )
        )
    );

-- 6. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;

-- Success message
SELECT 'Messaging RLS policies have been updated successfully!' as result;
