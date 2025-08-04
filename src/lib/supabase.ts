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
  role: 'customer'
  first_name: string
  last_name: string
  photo_url?: string
  country?: string
  address?: string
  contact_number?: string
  username?: string
  profile_completed?: boolean
}

export type SellerProfile = {
  id: string
  role: 'seller'
  first_name: string
  last_name: string
  photo_url?: string
  country?: string
  address?: string
  contact_number?: string
  username?: string
  business_name: string
  business_address?: string
  business_description?: string
  profile_completed?: boolean
}

// Complete profile data for forms
export type CompleteCustomerProfile = Omit<CustomerProfile, 'id' | 'role' | 'profile_completed'> & {
  first_name: string
  last_name: string
  country: string
  address: string
}

export type CompleteSellerProfile = Omit<SellerProfile, 'id' | 'role' | 'profile_completed'> & {
  first_name: string
  last_name: string
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

    // Create minimal profile record
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profile')
          .insert({
            id: data.user.id,
            role: 'customer',
            profile_completed: false
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      } catch (profileErr) {
        console.log('Profile table may not exist yet. User auth was successful.')
      }
    }

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
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

    // Create minimal profile record
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profile')
          .insert({
            id: data.user.id,
            role: 'seller',
            profile_completed: false
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      } catch (profileErr) {
        console.log('Profile table may not exist yet. User auth was successful.')
      }
    }

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Complete customer profile
export async function completeCustomerProfile(userId: string, profileData: CompleteCustomerProfile) {
  try {
    const { data, error } = await supabase
      .from('profile')
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
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Complete seller profile
export async function completeSellerProfile(userId: string, profileData: CompleteSellerProfile) {
  try {
    const { data, error } = await supabase
      .from('profile')
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
  } catch (error: any) {
    return { data: null, error: error.message }
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
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Delete user account
export async function deleteAccount() {
  try {
    // First delete the profile (will cascade due to foreign key)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Delete profile first
      await supabase
        .from('profile')
        .delete()
        .eq('id', user.id)
      
      // Then delete auth user (requires admin privileges - this might need to be done server-side)
      // For now, we'll just sign out the user
      await supabase.auth.signOut()
    }

    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Upload profile photo
export async function uploadProfilePhoto(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    const filePath = `profiles/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath)

    // Update profile with photo URL
    const { error: updateError } = await supabase
      .from('profile')
      .update({ photo_url: data.publicUrl })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    return { data: data.publicUrl, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
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
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<CustomerProfile | SellerProfile>) {
  try {
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profile')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!existingProfile) {
      // Profile doesn't exist, create it first
      const { data, error } = await supabase
        .from('profile')
        .insert({
          id: userId,
          role: 'customer', // Default role, should be updated based on user type
          ...updates
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
        .from('profile')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    }
  } catch (error: any) {
    return { data: null, error: error.message }
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
  } catch (error: any) {
    return { data: null, error: error.message }
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
  } catch (error: any) {
    return { error: error.message }
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
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Get current user with profile
export async function getCurrentUserWithProfile() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null, profile: null, error: error?.message || 'No user found' }
    }

    // Try to get profile, but don't fail if table doesn't exist
    try {
      const { data: profile, error: profileError } = await getUserProfile(user.id)
      
      if (profileError) {
        console.log('Profile table may not exist yet or no profile found')
        // Return user data from auth metadata as fallback
        const fallbackProfile = {
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          business_name: user.user_metadata?.business_name,
          role: user.user_metadata?.user_type
        }
        return { user, profile: fallbackProfile, error: null }
      }

      return { user, profile, error: null }
    } catch (profileErr) {
      // Profile table doesn't exist, use auth metadata
      const fallbackProfile = {
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        business_name: user.user_metadata?.business_name,
        role: user.user_metadata?.user_type
      }
      return { user, profile: fallbackProfile, error: null }
    }
  } catch (error: any) {
    return { user: null, profile: null, error: error.message }
  }
}
