'use clien  const [unreadCount, setUnreadCount] = useState<number>(0);'

'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import MessageInterface from '@/components/MessageInterface'
import { getUnreadMessageCount } from '@/lib/supabase'
import MainHeader from '@/components/MainHeader'
import Footer from '@/components/Footer'

interface User {
  id: string;
  email?: string;
}

export default function MessagesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<'customer' | 'seller' | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadUnreadCount = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await getUnreadMessageCount(user.id)
      if (error) {
        console.error('Error loading unread count:', error)
        return
      }
      setUnreadCount(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }, [user])

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadUnreadCount()
      // Set up real-time updates for unread count
      const interval = setInterval(loadUnreadCount, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [user, loadUnreadCount])

  const checkUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        // Redirect to login
        window.location.href = '/auth'
        return
      }

      setUser(currentUser)

      // Check if user is a seller or customer
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('id')
        .eq('id', currentUser.id)
        .single()

      setUserType(sellerProfile ? 'seller' : 'customer')
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f2] flex flex-col">
        <MainHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[#8d6748]">Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user || !userType) {
    return (
      <div className="min-h-screen bg-[#f8f5f2] flex flex-col">
        <MainHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#8d6748] mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">Please log in to view your messages.</p>
            <a
              href="/auth"
              className="px-4 py-2 bg-[#a3b18a] text-white rounded-lg hover:bg-[#8d6748] transition-colors"
            >
              Log In
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] flex flex-col">
      <MainHeader />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#8d6748]">
                Messages
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="mt-2 text-gray-600">
                {userType === 'seller' 
                  ? 'Communicate with your customers' 
                  : 'Message sellers about products'
                }
              </p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <MessageInterface
                userId={user.id}
                userType={userType}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}