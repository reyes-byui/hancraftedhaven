import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to handle auth errors and clear corrupted tokens
export async function handleAuthError(error: { message?: string } | Error | unknown) {
  const errorMessage = error instanceof Error ? error.message : 
                      (error as { message?: string })?.message || '';
  
  if (errorMessage.includes('Invalid Refresh Token') || 
      errorMessage.includes('Refresh Token Not Found') ||
      errorMessage.includes('refresh_token_not_found')) {
    console.log('Detected invalid refresh token, clearing auth state...')
    await supabase.auth.signOut()
    // Clear any local storage items related to auth
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token')
    }
    return true // Indicates token was cleared
  }
  return false
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
  customer_id?: string // Added for RLS policies
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
      // Handle refresh token errors
      const wasTokenCleared = await handleAuthError(error)
      if (wasTokenCleared) {
        return { user: null, profile: null, error: 'Session expired. Please sign in again.' }
      }
      return { user: null, profile: null, error: error?.message || 'Authentication error' }
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

    // Use SQL function to check and update stock quantities atomically
    console.log('Checking and updating stock availability...');
    
    const orderItemsForStock = orderData.items.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity
    }));

    console.log('Order items for stock update:', orderItemsForStock);

    const { data: stockResult, error: stockError } = await supabase
      .rpc('update_stock_for_order', {
        order_items_data: orderItemsForStock
      })

    console.log('Stock update RPC result:', { stockResult, stockError });

    // Check if the RPC function exists, if not fall back to direct updates
    if (stockError && stockError.code === '42883') {
      console.log('SQL function not found, falling back to direct stock updates...');
      
      // Fallback: Direct stock updates (temporary solution)
      for (const item of orderData.items) {
        // Check stock first
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock_quantity, name')
          .eq('id', item.product_id)
          .single()

        if (productError) {
          console.error('Error fetching product for stock check:', productError);
          await supabase.from('orders').delete().eq('id', order.id)
          return { data: null, error: `Product not found: ${item.product_name}` }
        }

        if (product.stock_quantity < item.quantity) {
          console.log(`Insufficient stock for ${product.name}: ${product.stock_quantity} available, ${item.quantity} requested`);
          await supabase.from('orders').delete().eq('id', order.id)
          return { data: null, error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.` }
        }

        // Update stock
        const newStock = product.stock_quantity - item.quantity;
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            stock_quantity: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product_id)

        if (updateError) {
          console.error('Error updating stock:', updateError);
          await supabase.from('orders').delete().eq('id', order.id)
          return { data: null, error: `Failed to update stock for ${item.product_name}` }
        }

        console.log(`Stock updated for ${item.product_name}: ${product.stock_quantity} -> ${newStock}`);
      }
      
      console.log('Direct stock updates completed successfully');
    } else if (stockError || !stockResult?.[0]?.success) {
      console.error('Stock update failed:', stockError || stockResult?.[0]?.message);
      // Rollback: delete the order
      await supabase.from('orders').delete().eq('id', order.id)
      return { 
        data: null, 
        error: stockResult?.[0]?.message || stockError?.message || 'Failed to update stock quantities' 
      }
    } else {
      console.log('Stock quantities updated successfully via SQL function:', stockResult[0].message);
    }

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
    console.log(`Attempting to update order item ${orderItemId} to status: ${status}`);
    
    // First check if the order item exists and belongs to the current user (seller)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }
    
    // Verify the order item exists and belongs to this seller
    const { data: existingItem, error: checkError } = await supabase
      .from('order_items')
      .select('id, seller_id, status, product_id, quantity')
      .eq('id', orderItemId)
      .eq('seller_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking order item:', checkError);
      return { data: null, error: `Error checking order item: ${checkError.message}` }
    }

    if (!existingItem) {
      console.error('Order item not found or not owned by seller');
      return { data: null, error: 'Order item not found or you do not have permission to update it' }
    }

    console.log('Order item found, current status:', existingItem.status, 'updating to:', status);

    // Handle stock management for all status transitions
    const oldStatus = existingItem.status;
    
    // Case 1: When seller DECLINES order (pending -> cancelled)
    // Need to restore stock since it was deducted when order was placed
    if (status === 'cancelled' && oldStatus === 'pending') {
      console.log('Seller declined order - restoring stock...');
      
      // Get current product stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', existingItem.product_id)
        .single()

      if (productError) {
        console.error('Error fetching product for stock restoration:', productError);
        return { data: null, error: `Failed to fetch product for stock restoration: ${productError.message}` }
      }

      // Restore stock quantity (add back what was deducted)
      const restoredStock = product.stock_quantity + existingItem.quantity;
      const { error: stockUpdateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: restoredStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.product_id)

      if (stockUpdateError) {
        console.error('Error restoring stock:', stockUpdateError);
        return { data: null, error: `Failed to restore stock: ${stockUpdateError.message}` }
      }

      console.log(`Stock restored for ${product.name}: ${product.stock_quantity} -> ${restoredStock} (+${existingItem.quantity})`);
    }
    
    // Case 2: When any cancelled order is reactivated (cancelled -> any other status)
    // Need to deduct stock again
    else if (oldStatus === 'cancelled' && status !== 'cancelled') {
      console.log('Reactivating cancelled order - deducting stock...');
      
      // Get current product stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', existingItem.product_id)
        .single()

      if (productError) {
        console.error('Error fetching product for stock deduction:', productError);
        return { data: null, error: `Failed to fetch product for stock deduction: ${productError.message}` }
      }

      // Check if enough stock is available
      if (product.stock_quantity < existingItem.quantity) {
        return { data: null, error: `Insufficient stock to reactivate order. Available: ${product.stock_quantity}, Required: ${existingItem.quantity}` }
      }

      // Deduct stock quantity
      const newStock = product.stock_quantity - existingItem.quantity;
      const { error: stockUpdateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.product_id)

      if (stockUpdateError) {
        console.error('Error deducting stock:', stockUpdateError);
        return { data: null, error: `Failed to deduct stock: ${stockUpdateError.message}` }
      }

      console.log(`Stock deducted for ${product.name}: ${product.stock_quantity} -> ${newStock} (-${existingItem.quantity})`);
    }

    // Note: Other status transitions (pending->processing, processing->shipped, etc.) 
    // don't require stock changes since stock was already deducted at order creation

    // Now update the order item status
    const { data, error } = await supabase
      .from('order_items')
      .update({ status })
      .eq('id', orderItemId)
      .eq('seller_id', user.id) // Double-check seller ownership
      .select()
      .maybeSingle() // Use maybeSingle instead of single to handle edge cases

    if (error) {
      console.error('Supabase error updating order item status:', error);
      return { data: null, error: `Database error: ${error.message}` }
    }

    if (!data) {
      console.error('No data returned after update');
      return { data: null, error: 'Update failed - no rows affected. Check permissions.' }
    }

    console.log('Order item status updated successfully:', data);
    return { data, error: null }
  } catch (error: unknown) {
    console.error('Error in updateOrderItemStatus:', error);
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
