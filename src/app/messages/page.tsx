'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import MessageInterface from '@/components/MessageInterface'
import { getUnreadMessageCount } from '@/lib/supabase'

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<'customer' | 'seller' | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

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
  }, [user])

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

  const loadUnreadCount = async () => {
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
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user || !userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to view your messages.</p>
          <a
            href="/auth"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Log In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
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

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">How messaging works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Start conversations by clicking "Message Seller" on product pages</li>
              <li>• Send text messages and attach images or documents (max 5MB)</li>
              <li>• Receive real-time notifications for new messages</li>
              <li>• Mark conversations as closed or archived when done</li>
              {userType === 'seller' && (
                <li>• Respond quickly to maintain good customer relationships</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
