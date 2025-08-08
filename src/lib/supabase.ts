import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auto-handle auth errors globally
supabase.auth.onAuthStateChange(async (event) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token refreshed successfully')
  } else if (event === 'SIGNED_OUT') {
    console.log('👋 User signed out')
    // Clear any remaining auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token')
    }
  }
})

// Function to handle auth errors and clear corrupted tokens
export async function handleAuthError(error: { message?: string } | Error | unknown) {
  const errorMessage = error instanceof Error ? error.message : 
                      (error as { message?: string })?.message || '';
  
  if (errorMessage.includes('Invalid Refresh Token') || 
      errorMessage.includes('Refresh Token Not Found') ||
      errorMessage.includes('refresh_token_not_found') ||
      errorMessage.includes('AuthApiError') ||
      errorMessage.includes('invalid_grant')) {
    console.log('🚨 Detected invalid refresh token, clearing auth state...')
    await clearAuthState()
    return true // Indicates token was cleared
  }
  return false
}

// Function to completely clear authentication state
export async function clearAuthState() {
  try {
    console.log('🧹 Clearing all authentication data...')
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      // Clear specific Supabase auth keys
      const supabaseProjectRef = supabaseUrl.split('//')[1].split('.')[0]
      
      // Remove all possible auth-related keys
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem(`sb-${supabaseProjectRef}-auth-token`)
      localStorage.removeItem(`sb-${supabaseProjectRef}-auth-token-code-verifier`)
      
      // Also check for any other auth keys and remove them
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
          localStorage.removeItem(key)
        }
      })
      
      // Clear sessionStorage as well
      sessionStorage.clear()
    }
    
    console.log('✅ Authentication state cleared successfully')
    
    // Redirect to login page if we're not already there
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  } catch (error) {
    console.error('❌ Error clearing auth state:', error)
  }
}

// Quick recovery function for auth errors
export async function recoverFromAuthError() {
  console.log('🔄 Attempting to recover from auth error...')
  
  try {
    // First try to refresh the session
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error || !data.session) {
      console.log('❌ Session refresh failed, clearing auth state...')
      await clearAuthState()
      return false
    }
    
    console.log('✅ Successfully recovered from auth error')
    return true
  } catch (error) {
    console.error('❌ Recovery failed:', error)
    await clearAuthState()
    return false
  }
}

// Auth types
export type AuthError = {
  message: string
  status?: number
}

// Profile types
export type CustomerProfile = {
  id: string
  first_name: string
  last_name: string
  email: string
  country: string
  address: string
  contact_number?: string
  photo_url?: string
  profile_completed?: boolean
}

export type SellerProfile = {
  id: string
  first_name: string
  last_name: string
  email: string
  country: string
  address: string
  contact_number?: string
  photo_url?: string
  business_name: string
  business_address: string
  business_description: string
  profile_completed?: boolean
}

// Seller type for the sellers page display
export type SellerDisplay = {
  id: string;
  first_name: string;
  last_name: string;
  business_name: string;
  business_description: string;
  business_address: string;
  country: string;
  photo_url?: string;
  profile_completed: boolean;
};

// Product types
export type Product = {
  id: string;
  seller_id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  discount_percentage: number;
  discounted_price?: number;
  image_url?: string;
  is_active: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

export type CreateProductData = {
  name: string;
  description?: string;
  category: string;
  price: number;
  discount_percentage?: number;
  image_url?: string;
  stock_quantity?: number;
};

export type UpdateProductData = Partial<CreateProductData> & {
  is_active?: boolean;
};

// Product categories
export const PRODUCT_CATEGORIES = [
  'Ceramics & Pottery',
  'Textiles & Fiber Arts',
  'Woodworking',
  'Metalwork & Jewelry',
  'Glasswork',
  'Leatherwork',
  'Painting',
  'Drawing',
  'Sculpture',
  'Paper Crafts',
  'Basketry',
  'Soap',
  'Candle',
  'Home Decor',
  'Fashion',
  'Accessories',
  'Food & Culinary Arts',
  'Mixed Media',
  'Upcycled Art',
  'Others'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Order types
export type Order = {
  id: string
  customer_id: string
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: string
  payment_method: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  notes?: string
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  seller_id: string
  customer_id?: string, // Added for RLS policies
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
}

export type CreateOrderData = {
  total_amount: number
  shipping_address: string
  payment_method?: string
  notes?: string
  items: Array<{
    product_id: string
    seller_id: string
    product_name: string
    product_price: number
    quantity: number
    subtotal: number
  }>
}

// Favorite types
export type Favorite = {
  id: string
  customer_id: string
  product_id: string
  created_at: string
}

export type FavoriteWithProduct = Favorite & {
  product: Product
}

// Cart types
export type CartItem = {
  id: string
  customer_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
}

export type CartItemWithProduct = CartItem & {
  product: Product
}

// Product Images types
export type ProductImage = {
  id: string
  product_id: string
  image_url: string
  display_order: number
  is_primary: boolean
  alt_text?: string
  created_at: string
}

export type ProductWithImages = Product & {
  images: ProductImage[]
}

// Product Inquiry types
export type ProductInquiry = {
  id: string
  product_id: string
  customer_id: string
  seller_id: string
  subject: string
  message: string
  customer_email: string
  customer_name: string
  status: 'pending' | 'responded' | 'closed'
  seller_response?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

export type ProductInquiryWithProduct = ProductInquiry & {
  product: Pick<Product, 'id' | 'name' | 'image_url'>
}

export type CreateInquiryData = {
  product_id: string
  seller_id: string
  subject: string
  message: string
  customer_email: string
  customer_name: string
}

// Complete profile data for forms
export type CompleteCustomerProfile = Omit<CustomerProfile, 'id' | 'profile_completed'> & {
  first_name: string
  last_name: string
  email: string
  country: string
  address: string
}

export type CompleteSellerProfile = Omit<SellerProfile, 'id' | 'profile_completed'> & {
  first_name: string
  last_name: string
  email: string
  country: string
  address: string
  business_name: string
  business_address: string
  business_description: string
}

export type TopSeller = {
  id: string
  first_name: string
  last_name: string
  country: string
  photo_url: string
  business_name: string
  total_revenue: number
}

export type TopCraft = {
  id: string
  name: string
  price: number
  image_url: string
  category: string
  seller_name: string
  seller_country: string
  total_sold: number
}

// Registration function for customers (minimal - just creates auth user)
export async function signUpCustomer(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'customer',
        }
      }
    })

    if (error) {
      throw error
    }

    // Don't create profile here - let the profile setup page handle it
    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Registration function for sellers (minimal - just creates auth user)
export async function signUpSeller(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'seller',
        }
      }
    })

    if (error) {
      throw error
    }

    // Don't create profile here - let the profile setup page handle it
    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Complete customer profile
export async function completeCustomerProfile(userId: string, profileData: CompleteCustomerProfile) {
  try {
    // Check if profile exists in customer_profiles table
    const { data: existingProfile } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!existingProfile) {
      // Profile doesn't exist, create it
      const { data, error } = await supabase
        .from('customer_profiles')
        .insert({
          id: userId,
          ...profileData,
          profile_completed: true
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } else {
      // Profile exists, update it
      const { data, error } = await supabase
        .from('customer_profiles')
        .update({
          ...profileData,
          profile_completed: true
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Complete seller profile
export async function completeSellerProfile(userId: string, profileData: CompleteSellerProfile) {
  try {
    // Check if profile exists in seller_profiles table
    const { data: existingProfile } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!existingProfile) {
      // Profile doesn't exist, create it
      const { data, error } = await supabase
        .from('seller_profiles')
        .insert({
          id: userId,
          ...profileData,
          profile_completed: true
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } else {
      // Profile exists, update it
      const { data, error } = await supabase
        .from('seller_profiles')
        .update({
          ...profileData,
          profile_completed: true
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update user password
export async function updatePassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete user account
export async function deleteAccount() {
  try {
    // First delete the profile (will cascade due to foreign key)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Delete from customer_profiles first
      await supabase
        .from('customer_profiles')
        .delete()
        .eq('id', user.id)
      
      // Delete from seller_profiles
      await supabase
        .from('seller_profiles')
        .delete()
        .eq('id', user.id)
      
      // Then delete auth user (requires admin privileges - this might need to be done server-side)
      // For now, we'll just sign out the user
      await supabase.auth.signOut()
    }

    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Upload profile photo
export async function uploadProfilePhoto(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `profile.${fileExt}`
    const filePath = `${userId}/${fileName}` // User ID as folder name to match RLS policy

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        upsert: true // Allow overwriting existing profile photos
      })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath)

    // Update profile with photo URL
    const updateResult = await updateUserProfile(userId, { photo_url: data.publicUrl })
    
    if (updateResult.error) {
      throw new Error(updateResult.error)
    }

    return { data: data.publicUrl, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Upload profile photo without updating profile (for profile setup)
export async function uploadProfilePhotoOnly(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `profile.${fileExt}`
    const filePath = `${userId}/${fileName}` // User ID as folder name to match RLS policy

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        upsert: true // Allow overwriting existing profile photos
      })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath)

    return { data: data.publicUrl, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Legacy function for backward compatibility (deprecated)
export async function signUp(email: string, password: string, userType: 'customer' | 'seller') {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType,
        }
      }
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  try {
    // First check customer_profiles
    const { data: customerData } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (customerData) {
      return { data: customerData, error: null }
    }

    // Then check seller_profiles
    const { data: sellerData } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (sellerData) {
      return { data: sellerData, error: null }
    }

    // If neither found, return null
    return { data: null, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update user profile - creates profile if it doesn't exist
export async function updateUserProfile(userId: string, updates: Partial<CustomerProfile | SellerProfile>) {
  try {
    // First check if user exists in customer_profiles
    const { data: customerProfile } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (customerProfile) {
      // Update customer profile
      const { data, error } = await supabase
        .from('customer_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    }

    // Check if user exists in seller_profiles
    const { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (sellerProfile) {
      // Update seller profile
      const { data, error } = await supabase
        .from('seller_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    }

    // If neither profile exists, get user info to create profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const userType = user.user_metadata?.user_type || 'customer'
    
    if (userType === 'seller') {
      // Create seller profile
      const { data, error } = await supabase
        .from('seller_profiles')
        .insert({
          id: userId,
          email: user.email || '',
          first_name: '',
          last_name: '',
          country: '',
          address: '',
          business_name: '',
          business_address: '',
          business_description: '',
          profile_completed: false,
          ...updates
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } else {
      // Create customer profile
      const { data, error } = await supabase
        .from('customer_profiles')
        .insert({
          id: userId,
          email: user.email || '',
          first_name: '',
          last_name: '',
          country: '',
          address: '',
          profile_completed: false,
          ...updates
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Sign in function
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Sign in as customer with user type validation
export async function signInCustomer(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Handle refresh token errors
      await handleAuthError(error)
      throw error
    }

    // Check if user is registered as a customer
    const userType = data.user?.user_metadata?.user_type
    if (userType !== 'customer') {
      // Sign out the user immediately
      await supabase.auth.signOut()
      throw new Error('This account is not registered as a customer. Please use the seller login.')
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Sign in as seller with user type validation
export async function signInSeller(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Handle refresh token errors
      await handleAuthError(error)
      throw error
    }

    // Check if user is registered as a seller
    const userType = data.user?.user_metadata?.user_type
    if (userType !== 'seller') {
      // Sign out the user immediately
      await supabase.auth.signOut()
      throw new Error('This account is not registered as a seller. Please use the customer login.')
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Sign out function
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw error
    }

    return { user, error: null }
  } catch (error: unknown) {
    return { user: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get current user with profile
export async function getCurrentUserWithProfile() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Handle refresh token errors with enhanced error detection
      const wasTokenCleared = await handleAuthError(error)
      if (wasTokenCleared) {
        return { user: null, profile: null, error: 'Session expired. Please sign in again.' }
      }
      
      // Check for specific auth errors
      const errorMessage = error?.message || ''
      if (errorMessage.includes('AuthApiError') || 
          errorMessage.includes('Invalid Refresh Token') ||
          errorMessage.includes('Refresh Token Not Found')) {
        console.log('🚨 Detected auth error in getCurrentUserWithProfile, clearing state...')
        await clearAuthState()
        return { user: null, profile: null, error: 'Session expired. Please sign in again.' }
      }
      
      return { user: null, profile: null, error: errorMessage || 'Authentication error' }
    }
    
    if (!user) {
      return { user: null, profile: null, error: 'No user found' }
    }

    // Determine user type from auth metadata
    const userType = user.user_metadata?.user_type
    
    try {
      let profile = null
      let profileError = null

      // First try the unified profile table
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        
        if (data) {
          profile = data
        } else if (!error) {
          // Profile table exists but no profile found, try old tables
          throw new Error('No profile in unified table')
        } else {
          throw error
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_unifiedError) {
        // Fall back to separate tables
        if (userType === 'seller') {
          const { data, error } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
          
          profile = data
          profileError = error
        } else if (userType === 'customer') {
          const { data, error } = await supabase
            .from('customer_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
          
          profile = data
          profileError = error
        }
      }
      
      if (profileError) {
        console.log('Profile may not exist yet:', profileError)
      }

      // Add role information to profile
      if (profile) {
        profile.role = userType
      }

      // Return profile or fallback
      if (profile) {
        return { user, profile, error: null }
      } else {
        // Fallback to auth metadata
        const fallbackProfile = {
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          business_name: user.user_metadata?.business_name,
          role: userType
        }
        return { user, profile: fallbackProfile, error: null }
      }
    } catch {
      // All profile tables failed, use auth metadata
      const fallbackProfile = {
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        business_name: user.user_metadata?.business_name,
        role: userType
      }
      return { user, profile: fallbackProfile, error: null }
    }
  } catch (error: unknown) {
    return { user: null, profile: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get all sellers for the sellers page
export async function getAllSellers(): Promise<{ data: SellerDisplay[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('id, first_name, last_name, business_name, business_description, business_address, country, photo_url, profile_completed')
      .eq('profile_completed', true)
      .order('business_name', { ascending: true })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Product management functions

// Create a new product
export async function createProduct(productData: CreateProductData): Promise<{ data: Product | null, error: string | null }> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        seller_id: user.user.id,
        ...productData,
        discount_percentage: productData.discount_percentage || 0,
        stock_quantity: productData.stock_quantity || 1
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get products for current seller
export async function getSellerProducts(): Promise<{ data: Product[], error: string | null }> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { data: [], error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update a product
export async function updateProduct(productId: string, updateData: UpdateProductData): Promise<{ data: Product | null, error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete a product
export async function deleteProduct(productId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get all active products (for marketplace)
export async function getAllProducts(): Promise<{ data: Product[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Upload product image
export async function uploadProductImage(file: File, productId: string): Promise<{ data: string | null, error: string | null }> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { data: null, error: 'User not authenticated' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}-${Date.now()}.${fileExt}`
    const filePath = `${user.user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrl } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return { data: publicUrl.publicUrl, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============ MULTIPLE PRODUCT IMAGES FUNCTIONS ============

// Upload multiple images for a product
export async function uploadMultipleProductImages(files: File[], productId: string): Promise<{ data: ProductImage[], error: string | null }> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { data: [], error: 'User not authenticated' }
    }

    const uploadedImages: ProductImage[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${productId}-${Date.now()}-${i}.${fileExt}`
      const filePath = `${user.user.id}/${fileName}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Failed to upload image:', uploadError)
        continue // Skip this image but continue with others
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      // Save to database
      const { data: imageRecord, error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: publicUrl.publicUrl,
          display_order: i,
          is_primary: i === 0, // First image is primary
          alt_text: file.name
        })
        .select()
        .single()

      if (dbError) {
        console.error('Failed to save image record:', dbError)
        continue
      }

      uploadedImages.push(imageRecord)
    }

    return { data: uploadedImages, error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get all images for a product
export async function getProductImages(productId: string): Promise<{ data: ProductImage[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Delete a product image
export async function deleteProductImage(imageId: string): Promise<{ error: string | null }> {
  try {
    // Get image details first to delete from storage
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('id', imageId)
      .single()

    if (fetchError || !image) {
      throw new Error('Image not found')
    }

    // Extract file path from URL
    const url = new URL(image.image_url)
    const filePath = url.pathname.split('/').slice(-2).join('/') // Get last two parts of path

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('product-images')
      .remove([filePath])

    if (storageError) {
      console.error('Failed to delete from storage:', storageError)
    }

    // Delete from database
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Set primary image for a product
export async function setProductPrimaryImage(imageId: string, productId: string): Promise<{ error: string | null }> {
  try {
    // Reset all images to non-primary
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)

    // Set the selected image as primary
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get product with all images
export async function getProductWithImages(productId: string): Promise<{ data: ProductWithImages | null, error: string | null }> {
  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return { data: null, error: productError?.message || 'Product not found' }
    }

    const { data: images, error: imagesError } = await getProductImages(productId)
    
    if (imagesError) {
      return { data: null, error: imagesError }
    }

    const productWithImages: ProductWithImages = {
      ...product,
      images: images || []
    }

    return { data: productWithImages, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============ PRODUCT INQUIRY FUNCTIONS ============

// Create a new product inquiry
export async function createProductInquiry(inquiryData: CreateInquiryData): Promise<{ data: ProductInquiry | null, error: string | null }> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('product_inquiries')
      .insert({
        ...inquiryData,
        customer_id: user.user.id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get customer's inquiries
export async function getCustomerInquiries(): Promise<{ data: ProductInquiryWithProduct[], error: string | null }> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { data: [], error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('product_inquiries')
      .select(`
        *,
        product:products(id, name, image_url)
      `)
      .eq('customer_id', user.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get seller's inquiries
export async function getSellerInquiries(): Promise<{ data: ProductInquiryWithProduct[], error: string | null }> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { data: [], error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('product_inquiries')
      .select(`
        *,
        product:products(id, name, image_url)
      `)
      .eq('seller_id', user.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Respond to an inquiry (seller)
export async function respondToInquiry(inquiryId: string, response: string): Promise<{ error: string | null }> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('product_inquiries')
      .update({
        seller_response: response,
        status: 'responded',
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', inquiryId)
      .eq('seller_id', user.user.id) // Ensure only the seller can respond

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update inquiry status
export async function updateInquiryStatus(inquiryId: string, status: 'pending' | 'responded' | 'closed'): Promise<{ error: string | null }> {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('product_inquiries')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', inquiryId)
      .eq('seller_id', user.user.id) // Ensure only the seller can update status

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get inquiry by ID
export async function getInquiryById(inquiryId: string): Promise<{ data: ProductInquiryWithProduct | null, error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('product_inquiries')
      .select(`
        *,
        product:products(id, name, image_url)
      `)
      .eq('id', inquiryId)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============ ORDER FUNCTIONS ============

// Create a new order
export async function createOrder(orderData: CreateOrderData): Promise<{ data: Order | null, error: string | null }> {
  try {
    console.log('Starting createOrder function...');
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('User not authenticated');
      return { data: null, error: 'Not authenticated' }
    }
    console.log('User authenticated in createOrder:', user.id);

    // Start a transaction by creating the order first
    console.log('Attempting to insert order with data:', {
      customer_id: user.id,
      total_amount: orderData.total_amount,
      shipping_address: orderData.shipping_address,
      payment_method: orderData.payment_method || 'card',
      notes: orderData.notes
    });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method || 'card',
        notes: orderData.notes
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order insertion error:', orderError);
      console.error('Error details:', JSON.stringify(orderError, null, 2));
      throw orderError
    }
    console.log('Order created successfully:', order);

    // Note: Stock will be deducted when seller accepts the order items
    // For now, just check if products exist and have sufficient stock for validation
    console.log('Validating product availability without deducting stock...');
    
    for (const item of orderData.items) {
      // Check if product exists and has sufficient stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', item.product_id)
        .single()

      if (productError) {
        console.error('Error fetching product for validation:', productError);
        await supabase.from('orders').delete().eq('id', order.id)
        return { data: null, error: `Product not found: ${item.product_name}` }
      }

      if (product.stock_quantity < item.quantity) {
        console.log(`Insufficient stock for ${product.name}: ${product.stock_quantity} available, ${item.quantity} requested`);
        await supabase.from('orders').delete().eq('id', order.id)
        return { data: null, error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.` }
      }

      console.log(`Stock validation passed for ${item.product_name}: ${product.stock_quantity} available, ${item.quantity} requested`);
    }
    
    console.log('Product availability validation completed successfully - stock will be deducted when seller accepts');

    // Insert order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      seller_id: item.seller_id,
      customer_id: user.id, // Add customer_id to avoid circular RLS dependency
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
      status: 'pending' as const // Set initial status for new order items
    }))

    console.log('Attempting to insert order items:', orderItems);

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items insertion error:', itemsError);
      console.error('Items error details:', JSON.stringify(itemsError, null, 2));
      // Rollback: delete the order if items insertion fails
      console.log('Rolling back order creation...');
      await supabase.from('orders').delete().eq('id', order.id)
      throw itemsError
    }
    console.log('Order items inserted successfully');

    return { data: order, error: null }
  } catch (error: unknown) {
    console.error('CreateOrder exception caught:', error);
    console.error('Exception details:', JSON.stringify(error, null, 2));
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if it's a table not found error
    if (errorMessage.includes('relation "public.orders" does not exist') || 
        errorMessage.includes('relation "public.order_items" does not exist')) {
      return { 
        data: null, 
        error: 'Database tables not set up. Please run the database setup SQL from docs/QUICK_DATABASE_SETUP.md in your Supabase dashboard.' 
      }
    }
    
    return { data: null, error: errorMessage }
  }
}

// Get customer's orders
export async function getCustomerOrders(): Promise<{ data: Order[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // Check if it's a table doesn't exist error
      if (error.code === '42P01') {
        return { data: [], error: 'Orders tables not set up yet. Please run the database setup SQL first.' }
      }
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get order items for a specific order
export async function getOrderItems(orderId: string): Promise<{ data: OrderItem[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get seller's orders (order items for their products)
export async function getSellerOrders(): Promise<{ data: (OrderItem & { order: Order })[], error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [], error: 'Not authenticated' }
    }

    console.log('Getting orders for seller:', user.id)

    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        order:orders(*)
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error in getSellerOrders:', error)
      // Check if it's a table doesn't exist error
      if (error.code === '42P01') {
        return { data: [], error: 'Orders tables not set up yet. Please run the database setup SQL first.' }
      }
      return { data: [], error: `Database error: ${error.message} (Code: ${error.code})` }
    }

    console.log('Raw order data from Supabase:', data)
    return { data: data || [], error: null }
  } catch (error: unknown) {
    console.error('Caught error in getSellerOrders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if it's a table not found error
    if (errorMessage.includes('relation "public.order_items" does not exist') || 
        errorMessage.includes('relation "public.orders" does not exist')) {
      return { 
        data: [], 
        error: 'Database tables not set up. Please run the database setup SQL from docs/QUICK_DATABASE_SETUP.md in your Supabase dashboard.' 
      }
    }
    
    return { data: [], error: `Error: ${errorMessage}` }
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<{ data: Order | null, error: string | null }> {
  try {
    console.log(`Attempting to update order ${orderId} to status: ${status}`);
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating order status:', error);
      throw error
    }

    console.log('Order status updated successfully:', data);
    return { data, error: null }
  } catch (error: unknown) {
    console.error('Error in updateOrderStatus:', error);
    if (error && typeof error === 'object' && 'message' in error) {
      return { data: null, error: (error as { message: string }).message }
    }
    if (error && typeof error === 'object' && 'details' in error) {
      return { data: null, error: (error as { details: string }).details }
    }
    return { data: null, error: error instanceof Error ? error.message : 'Failed to update order status. Please check your permissions.' }
  }
}

// Update individual order item status (UPDATED WITH STOCK MANAGEMENT)
export async function updateOrderItemStatus(orderItemId: string, status: OrderItem['status']): Promise<{ data: OrderItem | null, error: string | null }> {
  try {
    console.log(`🔄 [STOCK DEBUG] Attempting to update order item ${orderItemId} to status: ${status}`);
    
    // First check if the order item exists and belongs to the current user (seller)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('❌ [STOCK DEBUG] User not authenticated');
      return { data: null, error: 'Not authenticated' }
    }
    
    console.log(`✅ [STOCK DEBUG] User authenticated: ${user.id}`);
    
    // Verify the order item exists and belongs to this seller
    const { data: existingItem, error: checkError } = await supabase
      .from('order_items')
      .select('id, seller_id, status, product_id, quantity')
      .eq('id', orderItemId)
      .eq('seller_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('❌ [STOCK DEBUG] Error checking order item:', checkError);
      return { data: null, error: `Error checking order item: ${checkError.message}` }
    }

    if (!existingItem) {
      console.error('❌ [STOCK DEBUG] Order item not found or not owned by seller');
      return { data: null, error: 'Order item not found or you do not have permission to update it' }
    }

    console.log(`✅ [STOCK DEBUG] Order item found - Current status: ${existingItem.status}, Target status: ${status}, Product ID: ${existingItem.product_id}, Quantity: ${existingItem.quantity}`);

    // Handle stock management for status transitions
    const oldStatus = existingItem.status;
    
    // Case 1: When seller ACCEPTS order (pending → processing)
    // Need to deduct stock since it wasn't deducted at order creation
    if (status === 'processing' && oldStatus === 'pending') {
      console.log('🔥 [STOCK DEBUG] CRITICAL: Seller accepted order - deducting stock...');
      
      // Get current product stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', existingItem.product_id)
        .single()

      if (productError) {
        console.error('❌ [STOCK DEBUG] Error fetching product for stock deduction:', productError);
        return { data: null, error: `Failed to fetch product for stock deduction: ${productError.message}` }
      }

      console.log(`📦 [STOCK DEBUG] Current product stock: ${product.stock_quantity} for "${product.name}"`);

      // Check if enough stock is available
      if (product.stock_quantity < existingItem.quantity) {
        console.log(`❌ [STOCK DEBUG] Insufficient stock: Available ${product.stock_quantity}, Required ${existingItem.quantity}`);
        return { data: null, error: `Insufficient stock to accept order. Available: ${product.stock_quantity}, Required: ${existingItem.quantity}` }
      }

      // Deduct stock quantity
      const newStock = product.stock_quantity - existingItem.quantity;
      console.log(`🔄 [STOCK DEBUG] Attempting to update stock: ${product.stock_quantity} → ${newStock} (deducting ${existingItem.quantity})`);
      
      const { error: stockUpdateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.product_id)

      if (stockUpdateError) {
        console.error('❌ [STOCK DEBUG] Error deducting stock:', stockUpdateError);
        return { data: null, error: `Failed to deduct stock: ${stockUpdateError.message}` }
      }

      console.log(`✅ [STOCK DEBUG] SUCCESS! Stock deducted for ${product.name}: ${product.stock_quantity} → ${newStock} (-${existingItem.quantity})`);
    }
    
    // Case 2: When seller DECLINES order (pending → cancelled)
    // No stock restoration needed since stock was never deducted in the first place
    else if (status === 'cancelled' && oldStatus === 'pending') {
      console.log('ℹ️ [STOCK DEBUG] Seller declined order - no stock changes needed (stock was never deducted)');
    }
    
    // Case 3: When seller cancels ACCEPTED order (processing/shipped → cancelled)
    // Need to restore stock since it was deducted when order was accepted
    else if (status === 'cancelled' && (oldStatus === 'processing' || oldStatus === 'shipped')) {
      console.log('🔄 [STOCK DEBUG] Seller cancelled accepted order - restoring stock...');
      
      // Get current product stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', existingItem.product_id)
        .single()

      if (productError) {
        console.error('❌ [STOCK DEBUG] Error fetching product for stock restoration:', productError);
        return { data: null, error: `Failed to fetch product for stock restoration: ${productError.message}` }
      }

      // Restore stock quantity (add back what was deducted)
      const restoredStock = product.stock_quantity + existingItem.quantity;
      console.log(`🔄 [STOCK DEBUG] Restoring stock: ${product.stock_quantity} → ${restoredStock} (adding back ${existingItem.quantity})`);
      
      const { error: stockUpdateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: restoredStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.product_id)

      if (stockUpdateError) {
        console.error('❌ [STOCK DEBUG] Error restoring stock:', stockUpdateError);
        return { data: null, error: `Failed to restore stock: ${stockUpdateError.message}` }
      }

      console.log(`✅ [STOCK DEBUG] Stock restored for ${product.name}: ${product.stock_quantity} → ${restoredStock} (+${existingItem.quantity})`);
    }
    
    // Case 4: When any cancelled order is reactivated (cancelled → any other status)
    // Need to deduct stock again
    else if (oldStatus === 'cancelled' && status !== 'cancelled') {
      console.log('🔄 [STOCK DEBUG] Reactivating cancelled order - deducting stock...');
      
      // Get current product stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', existingItem.product_id)
        .single()

      if (productError) {
        console.error('❌ [STOCK DEBUG] Error fetching product for stock deduction:', productError);
        return { data: null, error: `Failed to fetch product for stock deduction: ${productError.message}` }
      }

      // Check if enough stock is available
      if (product.stock_quantity < existingItem.quantity) {
        console.log(`❌ [STOCK DEBUG] Insufficient stock for reactivation: Available ${product.stock_quantity}, Required ${existingItem.quantity}`);
        return { data: null, error: `Insufficient stock to reactivate order. Available: ${product.stock_quantity}, Required: ${existingItem.quantity}` }
      }

      // Deduct stock quantity
      const newStock = product.stock_quantity - existingItem.quantity;
      console.log(`🔄 [STOCK DEBUG] Deducting stock for reactivation: ${product.stock_quantity} → ${newStock}`);
      
      const { error: stockUpdateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.product_id)

      if (stockUpdateError) {
        console.error('❌ [STOCK DEBUG] Error deducting stock:', stockUpdateError);
        return { data: null, error: `Failed to deduct stock: ${stockUpdateError.message}` }
      }

      console.log(`✅ [STOCK DEBUG] Stock deducted for ${product.name}: ${product.stock_quantity} → ${newStock} (-${existingItem.quantity})`);
    }
    else {
      console.log(`ℹ️ [STOCK DEBUG] Status transition ${oldStatus} → ${status} does not require stock changes`);
    }

    // Note: Other status transitions (processing→shipped, shipped→delivered, etc.) 
    // don't require stock changes since stock management only happens at acceptance/cancellation

    // Now update the order item status
    console.log(`🔄 [STOCK DEBUG] Updating order item status in database...`);
    const { data, error } = await supabase
      .from('order_items')
      .update({ status })
      .eq('id', orderItemId)
      .eq('seller_id', user.id) // Double-check seller ownership
      .select()
      .maybeSingle() // Use maybeSingle instead of single to handle edge cases

    if (error) {
      console.error('❌ [STOCK DEBUG] Supabase error updating order item status:', error);
      return { data: null, error: `Database error: ${error.message}` }
    }

    if (!data) {
      console.error('❌ [STOCK DEBUG] No data returned after update');
      return { data: null, error: 'Update failed - no rows affected. Check permissions.' }
    }

    console.log('✅ [STOCK DEBUG] Order item status updated successfully:', data);
    return { data, error: null }
  } catch (error: unknown) {
    console.error('❌ [STOCK DEBUG] Caught exception in updateOrderItemStatus:', error);
    if (error && typeof error === 'object' && 'message' in error) {
      return { data: null, error: (error as { message: string }).message }
    }
    if (error && typeof error === 'object' && 'details' in error) {
      return { data: null, error: (error as { details: string }).details }
    }
    return { data: null, error: error instanceof Error ? error.message : 'Failed to update order item status. Please check your permissions.' }
  }
}

// ============ STOCK MANAGEMENT FUNCTIONS ============

// Cancel order and restore stock quantities
export async function cancelOrder(orderId: string): Promise<{ data: boolean, error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: false, error: 'Not authenticated' }
    }

    // Check if user owns this order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, customer_id')
      .eq('id', orderId)
      .eq('customer_id', user.id)
      .single()

    if (orderError || !order) {
      return { data: false, error: 'Order not found or access denied' }
    }

    if (order.status === 'cancelled') {
      return { data: false, error: 'Order is already cancelled' }
    }

    if (order.status === 'delivered') {
      return { data: false, error: 'Cannot cancel a delivered order' }
    }

    // Use SQL function to restore stock
    const { data: stockResult, error: stockError } = await supabase
      .rpc('restore_stock_for_order', {
        order_id_param: orderId
      })

    if (stockError || !stockResult?.[0]?.success) {
      return { 
        data: false, 
        error: stockResult?.[0]?.message || stockError?.message || 'Failed to restore stock quantities' 
      }
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('customer_id', user.id)

    if (updateError) {
      return { data: false, error: 'Failed to cancel order: ' + updateError.message }
    }

    return { data: true, error: null }
  } catch (error: unknown) {
    return { data: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get stock status for a product
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getProductStockStatus(productId: string): Promise<{ data: any, error: string | null }> {
  try {
    const { data, error } = await supabase
      .rpc('get_product_stock_status', {
        product_id_param: productId
      })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data?.[0] || null, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============ FAVORITES FUNCTIONS ============

// Add product to favorites
export async function addToFavorites(productId: string): Promise<{ data: Favorite | null, error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        customer_id: user.id,
        product_id: productId
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if it's a table not found error
    if (errorMessage.includes('relation "public.favorites" does not exist')) {
      return { 
        data: null, 
        error: 'Database tables not set up. Please run the database setup SQL from docs/QUICK_DATABASE_SETUP.md in your Supabase dashboard.' 
      }
    }
    
    return { data: null, error: errorMessage }
  }
}

// Remove product from favorites
export async function removeFromFavorites(productId: string): Promise<{ error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('customer_id', user.id)
      .eq('product_id', productId)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if it's a table not found error
    if (errorMessage.includes('relation "public.favorites" does not exist')) {
      return { 
        error: 'Database tables not set up. Please run the database setup SQL from docs/QUICK_DATABASE_SETUP.md in your Supabase dashboard.' 
      }
    }
    
    return { error: errorMessage }
  }
}

// Get customer's favorites with product details
export async function getCustomerFavorites(): Promise<{ data: FavoriteWithProduct[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        product:products(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      // Check if it's a table doesn't exist error
      if (error.code === '42P01') {
        return { data: [], error: 'Favorites table not set up yet. Please run the database setup SQL first.' }
      }
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Check if product is in favorites
export async function isProductInFavorites(productId: string): Promise<{ data: boolean, error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('customer_id', user.id)
      .eq('product_id', productId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error
    }

    return { data: !!data, error: null }
  } catch (error: unknown) {
    return { data: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============ CART FUNCTIONS ============

// Add product to cart
export async function addToCart(productId: string, quantity: number = 1): Promise<{ data: CartItem | null, error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    // Check if item already exists in cart
    const { data: existing } = await supabase
      .from('cart')
      .select('*')
      .eq('customer_id', user.id)
      .eq('product_id', productId)
      .single()

    if (existing) {
      // Update quantity if item already in cart
      const { data, error } = await supabase
        .from('cart')
        .update({ 
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } else {
      // Add new item to cart
      const { data, error } = await supabase
        .from('cart')
        .insert({
          customer_id: user.id,
          product_id: productId,
          quantity: quantity
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    }
  } catch (error: unknown) {
    console.error('AddToCart error details:', error);
    
    let errorMessage = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object') {
      // Handle Supabase error objects
      if ('message' in error) {
        errorMessage = (error as { message: string }).message;
      } else if ('error' in error) {
        errorMessage = (error as { error: string }).error;
      } else {
        errorMessage = JSON.stringify(error);
      }
    }
    
    if (errorMessage.includes('relation "public.cart" does not exist')) {
      return { 
        data: null, 
        error: 'Shopping cart table not set up. Please run the database setup SQL.' 
      }
    }
    
    return { data: null, error: errorMessage }
  }
}

// Get customer's cart items with product details
export async function getCartItems(): Promise<{ data: CartItemWithProduct[], error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [], error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('cart')
      .select(`
        *,
        product:products(*)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage.includes('relation "public.cart" does not exist')) {
      return { 
        data: [], 
        error: 'Shopping cart table not set up. Please run the database setup SQL.' 
      }
    }
    
    return { data: [], error: errorMessage }
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<{ data: CartItem | null, error: string | null }> {
  try {
    if (quantity <= 0) {
      const { error } = await removeFromCart(cartItemId)
      return { data: null, error }
    }

    const { data, error } = await supabase
      .from('cart')
      .update({ 
        quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Remove item from cart
export async function removeFromCart(cartItemId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartItemId)

    if (error) throw error
    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Clear entire cart (used after successful checkout)
export async function clearCart(): Promise<{ error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('customer_id', user.id)

    if (error) throw error
    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get cart item count
export async function getCartItemCount(): Promise<{ data: number, error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: 0, error: null }
    }

    const { data, error } = await supabase
      .from('cart')
      .select('quantity')
      .eq('customer_id', user.id)

    if (error) throw error
    
    const totalCount = data?.reduce((sum, item) => sum + item.quantity, 0) || 0
    return { data: totalCount, error: null }
  } catch (error: unknown) {
    return { data: 0, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Checkout cart - convert cart items to order
export async function checkoutCart(shippingAddress: string, paymentMethod: string = 'card', notes?: string): Promise<{ data: Order | null, error: string | null }> {
  try {
    console.log('Starting checkout process...');
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }
    console.log('User authenticated:', user.id);

    // Get cart items with product details
    const { data: cartItems, error: cartError } = await getCartItems()
    if (cartError) {
      console.error('Cart error:', cartError);
      return { data: null, error: cartError }
    }
    console.log('Cart items loaded:', cartItems?.length);

    if (!cartItems || cartItems.length === 0) {
      return { data: null, error: 'Cart is empty' }
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.product.discounted_price || item.product.price
      return sum + (price * item.quantity)
    }, 0)
    console.log('Total amount:', totalAmount);

    // Create order
    const orderData: CreateOrderData = {
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      notes: notes,
      items: cartItems.map(item => {
        const price = item.product.discounted_price || item.product.price
        return {
          product_id: item.product_id,
          seller_id: item.product.seller_id,
          product_name: item.product.name,
          product_price: price,
          quantity: item.quantity,
          subtotal: price * item.quantity
        }
      })
    }
    console.log('Order data prepared:', orderData);

    const { data: order, error: orderError } = await createOrder(orderData)
    if (orderError) {
      console.error('Order creation error:', orderError);
      return { data: null, error: orderError }
    }
    console.log('Order created successfully:', order?.id);

    // Clear cart after successful order creation
    await clearCart()
    console.log('Cart cleared');

    return { data: order, error: null }
  } catch (error: unknown) {
    console.error('Checkout exception:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update customer profile
export async function updateCustomerProfile(profileData: {
  first_name?: string;
  last_name?: string;
  address?: string;
  contact_number?: string;
  country?: string;
}): Promise<{ error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Try unified profile table first
    try {
      const { error } = await supabase
        .from('profile')
        .upsert({
          id: user.id,
          role: 'customer', // Ensure role is set for new profiles
          ...profileData,
          updated_at: new Date().toISOString()
        })

      if (!error) {
        return { error: null }
      }
      
      // If unified table fails, fall back to customer_profiles
      throw error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_unifiedError) {
      // Fall back to customer_profiles table
      const { error } = await supabase
        .from('customer_profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update seller profile
export async function updateSellerProfile(profileData: {
  first_name?: string;
  last_name?: string;
  business_name?: string;
  business_address?: string;
  contact_number?: string;
  country?: string;
  business_description?: string;
}): Promise<{ error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Try unified profile table first
    try {
      const { error } = await supabase
        .from('profile')
        .upsert({
          id: user.id,
          role: 'seller', // Ensure role is set for new profiles
          ...profileData,
          updated_at: new Date().toISOString()
        })

      if (!error) {
        return { error: null }
      }
      
      // If unified table fails, fall back to seller_profiles
      throw error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_unifiedError) {
      // Fall back to seller_profiles table
      const { error } = await supabase
        .from('seller_profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get top sellers by revenue (from delivered orders only)
export async function getTopSellers(limit: number = 3): Promise<{ data: TopSeller[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .rpc('get_top_sellers_by_revenue', { result_limit: limit })

    if (error) {
      // If the function doesn't exist, fall back to a direct query
      if (error.code === '42883') {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('seller_profiles')
          .select('*')
          .limit(limit)

        if (fallbackError) {
          throw fallbackError
        }

        return { data: fallbackData || [], error: null }
      }
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get top crafts by sales quantity (from delivered orders only)
export async function getTopCrafts(limit: number = 5): Promise<{ data: TopCraft[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .rpc('get_top_crafts_by_sales', { result_limit: limit })

    if (error) {
      // If the function doesn't exist, fall back to active products
      if (error.code === '42883') {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .limit(limit)

        if (fallbackError) {
          throw fallbackError
        }

        return { data: fallbackData || [], error: null }
      }
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get seller profile by ID
export async function getSellerProfile(sellerId: string): Promise<{ data: SellerProfile | null, error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', sellerId)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get products by seller ID
export async function getProductsBySellerId(sellerId: string): Promise<{ data: Product[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get product by ID
export async function getProductById(productId: string): Promise<{ data: Product | null, error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// =============================================
// MESSAGING SYSTEM TYPES AND FUNCTIONS
// =============================================

// Messaging Types
export interface Conversation {
  id: string
  customer_id: string
  seller_id: string
  product_id?: string
  subject: string
  status: 'active' | 'closed' | 'archived'
  last_message_at: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'customer' | 'seller'
  message_text: string
  attachment_url?: string
  attachment_type?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface ConversationWithDetails extends Conversation {
  customer_profile?: CustomerProfile
  seller_profile?: SellerProfile
  product?: Product
  unread_count?: number
  last_message?: Message
}

export interface MessageWithSender extends Message {
  sender_profile?: CustomerProfile | SellerProfile
}

// Create or get existing conversation
export async function getOrCreateConversation(
  customerId: string,
  sellerId: string,
  productId?: string,
  subject: string = 'General Inquiry'
): Promise<{ data: string | null, error: string | null }> {
  try {
    console.log('🔄 Creating conversation:', { customerId, sellerId, productId, subject })
    
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_customer_id: customerId,
      p_seller_id: sellerId,
      p_product_id: productId || null,
      p_subject: subject
    })

    if (error) {
      console.error('❌ Supabase RPC error:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      
      // Check for specific error types
      if (error.message?.includes('function get_or_create_conversation') || 
          error.code === '42883') {
        return { 
          data: null, 
          error: 'Messaging system database functions not set up. Please run docs/SAFE_MESSAGING_SETUP.sql in your Supabase dashboard.' 
        }
      }
      
      if (error.message?.includes('conversations') && error.message?.includes('does not exist')) {
        return { 
          data: null, 
          error: 'Conversations table does not exist. Please run docs/SAFE_MESSAGING_SETUP.sql in your Supabase dashboard.' 
        }
      }
      
      throw error
    }

    console.log('✅ Conversation created/found:', data)
    return { data, error: null }
  } catch (error: unknown) {
    console.error('❌ getOrCreateConversation exception:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Full error details:', JSON.stringify(error, null, 2))
    
    return { data: null, error: `Detailed error: ${errorMessage}` }
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderType: 'customer' | 'seller',
  messageText: string,
  attachmentUrl?: string,
  attachmentType?: string
): Promise<{ data: Message | null, error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_type: senderType,
        message_text: messageText,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get conversations for a user
export async function getUserConversations(
  userId: string,
  userType: 'customer' | 'seller'
): Promise<{ data: ConversationWithDetails[], error: string | null }> {
  try {
    const field = userType === 'customer' ? 'customer_id' : 'seller_id'
    const otherField = userType === 'customer' ? 'seller_id' : 'customer_id'
    const otherProfileTable = userType === 'customer' ? 'seller_profiles' : 'customer_profiles'

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        ${otherProfileTable}:${otherField} (*),
        products (*),
        messages (
          id,
          message_text,
          sender_type,
          is_read,
          created_at
        )
      `)
      .eq(field, userId)
      .order('last_message_at', { ascending: false })

    if (error) {
      throw error
    }

    // Process the data to include unread count and last message
    const processedData = (data || []).map(conv => {
      const messages = conv.messages || []
      const unreadMessages = messages.filter((msg: { is_read: boolean; sender_type: string }) => !msg.is_read && msg.sender_type !== userType)
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

      return {
        ...conv,
        [userType === 'customer' ? 'seller_profile' : 'customer_profile']: conv[otherProfileTable],
        unread_count: unreadMessages.length,
        last_message: lastMessage,
        messages: undefined // Remove messages array to clean up response
      }
    })

    return { data: processedData, error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if it's a table not found error and provide helpful message
    if (errorMessage.includes('relation "public.conversations" does not exist') || 
        errorMessage.includes('conversations') && errorMessage.includes('does not exist')) {
      return { 
        data: [], 
        error: 'Messaging tables not set up. Please run docs/MESSAGING_SYSTEM_SETUP.sql in your Supabase dashboard.' 
      }
    }
    
    return { data: [], error: errorMessage }
  }
}

// Get messages for a conversation
export async function getConversationMessages(
  conversationId: string,
  limit: number = 50
): Promise<{ data: MessageWithSender[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        customer_profiles!messages_sender_id_fkey (*),
        seller_profiles!messages_sender_id_fkey (*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      throw error
    }

    // Process data to include correct sender profile
    const processedData = (data || []).map(msg => ({
      ...msg,
      sender_profile: msg.sender_type === 'customer' 
        ? msg.customer_profiles 
        : msg.seller_profiles,
      customer_profiles: undefined,
      seller_profiles: undefined
    }))

    return { data: processedData, error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_conversation_id: conversationId,
      p_user_id: userId
    })

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get unread message count
export async function getUnreadMessageCount(
  userId: string
): Promise<{ data: number, error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('get_unread_message_count', {
      user_id: userId
    })

    if (error) {
      throw error
    }

    return { data: data || 0, error: null }
  } catch (error: unknown) {
    return { data: 0, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Upload message attachment
export async function uploadMessageAttachment(
  file: File,
  userId: string,
  conversationId: string
): Promise<{ data: string | null, error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${conversationId}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('message-attachments')
      .upload(fileName, file)

    if (error) {
      throw error
    }

    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(data.path)

    return { data: urlData.publicUrl, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Close/Archive conversation
export async function updateConversationStatus(
  conversationId: string,
  status: 'active' | 'closed' | 'archived'
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// =============================================
// ADMIN CONTACT SYSTEM TYPES AND FUNCTIONS
// =============================================

export type AdminContact = {
  id: string
  name: string
  email: string
  user_type: 'customer' | 'seller' | 'visitor'
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  admin_response?: string
  admin_notes?: string
  responded_at?: string
  responded_by?: string
  created_at: string
  updated_at: string
}

export type AdminContactFormData = {
  name: string
  email: string
  user_type: 'customer' | 'seller' | 'visitor'
  subject: string
  message: string
}

// Submit a contact message to admin
export async function submitAdminContact(
  contactData: AdminContactFormData
): Promise<{ data: string | null, error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('submit_admin_contact', {
      p_name: contactData.name,
      p_email: contactData.email,
      p_user_type: contactData.user_type,
      p_subject: contactData.subject,
      p_message: contactData.message
    })

    if (error) {
      console.error('Supabase error submitting admin contact:', error)
      
      // Check for specific error types
      if (error.message?.includes('function submit_admin_contact') || 
          error.code === '42883') {
        return { 
          data: null, 
          error: 'Admin contact system not set up. Please run docs/ADMIN_CONTACT_SYSTEM_SETUP.sql in your Supabase dashboard.' 
        }
      }
      
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    console.error('submitAdminContact exception:', error)
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get admin contacts (for admin dashboard)
export async function getAdminContacts(
  status?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: AdminContact[], error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('get_admin_contacts', {
      p_status: status || null,
      p_limit: limit,
      p_offset: offset
    })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Update admin contact response
export async function updateAdminContactResponse(
  contactId: string,
  status?: string,
  adminResponse?: string,
  adminNotes?: string,
  priority?: string
): Promise<{ error: string | null }> {
  try {
    const { data, error } = await supabase.rpc('update_admin_contact_response', {
      p_contact_id: contactId,
      p_status: status || null,
      p_admin_response: adminResponse || null,
      p_admin_notes: adminNotes || null,
      p_priority: priority || null
    })

    if (error) {
      throw error
    }

    if (!data) {
      return { error: 'Contact not found or update failed' }
    }

    return { error: null }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get admin contact statistics
export async function getAdminContactStats(): Promise<{ 
  data: {
    total_contacts: number
    new_contacts: number
    in_progress_contacts: number
    resolved_contacts: number
    closed_contacts: number
    urgent_contacts: number
    high_priority_contacts: number
  } | null, 
  error: string | null 
}> {
  try {
    const { data, error } = await supabase.rpc('get_admin_contact_stats')

    if (error) {
      throw error
    }

    return { data: data?.[0] || null, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Product Review Types
export interface ProductReview {
  id: string;
  product_id: string;
  customer_id: string;
  order_item_id: string;
  rating: number;
  comment?: string;
  is_anonymous: boolean;
  display_name?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  reported_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  seller_response?: string;
  seller_responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewHelpfulness {
  id: string;
  review_id: string;
  customer_id: string;
  is_helpful: boolean;
  created_at: string;
}

export interface ProductRatingSummary {
  average_rating: number;
  total_reviews: number;
  rating_5_count: number;
  rating_4_count: number;
  rating_3_count: number;
  rating_2_count: number;
  rating_1_count: number;
}

export interface ReviewForCommunity {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url: string;
  rating: number;
  comment: string;
  is_anonymous: boolean;
  display_name?: string;
  helpful_count: number;
  created_at: string;
  seller_name: string;
  seller_business_name?: string;
}

export interface ReviewFormData {
  product_id: string;
  order_item_id: string;
  rating: number;
  comment?: string;
  is_anonymous: boolean;
}

export interface CanReviewResponse {
  can_review: boolean;
  order_item_id?: string;
  reason: string;
}

// Submit a product review
export async function submitProductReview(reviewData: ReviewFormData): Promise<{ 
  data: string | null, 
  error: string | null 
}> {
  try {
    const { data, error } = await supabase.rpc('submit_product_review', {
      p_product_id: reviewData.product_id,
      p_order_item_id: reviewData.order_item_id,
      p_rating: reviewData.rating,
      p_comment: reviewData.comment || null,
      p_is_anonymous: reviewData.is_anonymous
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get product reviews
export async function getProductReviews(
  productId: string,
  limit: number = 10,
  offset: number = 0,
  orderBy: 'newest' | 'oldest' | 'highest_rated' | 'lowest_rated' | 'most_helpful' = 'newest'
): Promise<{ 
  data: (ProductReview & { is_own_review: boolean })[] | null, 
  error: string | null 
}> {
  try {
    const { data, error } = await supabase.rpc('get_product_reviews', {
      p_product_id: productId,
      p_limit: limit,
      p_offset: offset,
      p_order_by: orderBy
    })

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get recent reviews for community page
export async function getRecentReviewsForCommunity(limit: number = 20): Promise<{ 
  data: ReviewForCommunity[] | null, 
  error: string | null 
}> {
  try {
    // First try to use the database function
    const { data, error } = await supabase.rpc('get_recent_reviews_for_community', {
      p_limit: limit
    })

    if (error) {
      // If function doesn't exist, try direct table query
      if (error.message.includes('function') || error.message.includes('does not exist')) {
        console.warn('Function get_recent_reviews_for_community not found, trying direct query')
        
        const { data: directData, error: directError } = await supabase
          .from('product_reviews')
          .select(`
            id,
            product_id,
            rating,
            comment,
            is_anonymous,
            display_name,
            helpful_count,
            created_at,
            product:products(
              id,
              name,
              image_url,
              seller:seller_profiles(
                first_name,
                last_name,
                business_name
              )
            )
          `)
          .eq('status', 'approved')
          .not('comment', 'is', null)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (directError) {
          // If product_reviews table doesn't exist either, return empty array
          if (directError.message.includes('relation') && directError.message.includes('does not exist')) {
            return { data: [], error: 'Product review system not yet set up. Please run the PRODUCT_REVIEW_SYSTEM_SETUP.sql file.' }
          }
          throw directError
        }

        // Transform the data to match expected format
        const transformedData = (directData || []).map((review: Record<string, unknown>) => {
          const product = Array.isArray(review.product) ? review.product[0] : review.product as Record<string, unknown> | undefined
          const productRecord = product as Record<string, unknown> | undefined
          const sellerArray = productRecord && Array.isArray(productRecord.seller) ? productRecord.seller as Record<string, unknown>[] : null
          const seller = sellerArray ? sellerArray[0] : (productRecord ? productRecord.seller as Record<string, unknown> | undefined : null)
          
          return {
            id: review.id as string,
            product_id: review.product_id as string,
            product_name: productRecord?.name as string || 'Unknown Product',
            product_image_url: productRecord?.image_url as string || '',
            rating: review.rating as number,
            comment: review.comment as string,
            is_anonymous: review.is_anonymous as boolean,
            display_name: review.display_name as string,
            helpful_count: review.helpful_count as number,
            created_at: review.created_at as string,
            seller_name: seller ? 
              `${(seller as Record<string, unknown>).first_name || ''} ${(seller as Record<string, unknown>).last_name || ''}`.trim() || 'Unknown Seller' : 
              'Unknown Seller',
            seller_business_name: seller ? (seller as Record<string, unknown>).business_name as string || undefined : undefined
          }
        })

        return { data: transformedData, error: null }
      }
      throw error
    }

    return { data: data || [], error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get product rating summary
export async function getProductRatingSummary(productId: string): Promise<{ 
  data: ProductRatingSummary | null, 
  error: string | null 
}> {
  try {
    const { data, error } = await supabase.rpc('get_product_rating_summary', {
      p_product_id: productId
    })

    if (error) {
      throw error
    }

    return { data: data?.[0] || null, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Check if customer can review a product
export async function canCustomerReviewProduct(
  productId: string,
  customerId?: string
): Promise<{ 
  data: CanReviewResponse | null, 
  error: string | null 
}> {
  try {
    const { data, error } = await supabase.rpc('can_customer_review_product', {
      p_product_id: productId,
      p_customer_id: customerId || undefined
    })

    if (error) {
      throw error
    }

    return { data: data?.[0] || null, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get customer's delivered orders for a product (to enable reviews)
export async function getCustomerDeliveredOrders(customerId?: string): Promise<{ 
  data: (OrderItem & { 
    product: Pick<Product, 'id' | 'name' | 'image_url'>,
    can_review: boolean,
    has_reviewed: boolean
  })[] | null, 
  error: string | null 
}> {
  try {
    // Get current user if customerId not provided
    let userId = customerId
    if (!userId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return { data: null, error: 'Authentication required' }
      }
      userId = user.id
    }

    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(id, name, image_url)
      `)
      .eq('customer_id', userId)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false })

    if (orderError) {
      throw orderError
    }

    if (!orderItems) {
      return { data: [], error: null }
    }

    // Check which products have been reviewed
    const productIds = orderItems.map(item => item.product_id)
    
    let existingReviews: { product_id: string; order_item_id: string }[] = []
    if (productIds.length > 0) {
      const { data: reviews, error: reviewError } = await supabase
        .from('product_reviews')
        .select('product_id, order_item_id')
        .eq('customer_id', userId)
        .in('product_id', productIds)

      if (reviewError) {
        // If product_reviews table doesn't exist, that's fine - no reviews yet
        console.warn('Product reviews table not found:', reviewError.message)
      } else {
        existingReviews = reviews || []
      }
    }

    const reviewedItems = new Set(existingReviews.map(r => r.order_item_id))

    const enrichedItems = orderItems.map(item => ({
      ...item,
      can_review: true,
      has_reviewed: reviewedItems.has(item.id)
    }))

    return { data: enrichedItems, error: null }
  } catch (error: unknown) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
