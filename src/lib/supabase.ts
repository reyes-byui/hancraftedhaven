import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    
    if (error || !user) {
      return { user: null, profile: null, error: error?.message || 'No user found' }
    }

    // Determine user type from auth metadata
    const userType = user.user_metadata?.user_type
    
    try {
      let profile = null
      let profileError = null

      if (userType === 'seller') {
        // Try to get seller profile
        const { data, error } = await supabase
          .from('seller_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        
        profile = data
        profileError = error
      } else if (userType === 'customer') {
        // Try to get customer profile
        const { data, error } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        
        profile = data
        profileError = error
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
      // Profile table doesn't exist, use auth metadata
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
