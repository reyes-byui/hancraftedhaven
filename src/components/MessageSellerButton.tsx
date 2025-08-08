'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import MessageInterface from './MessageInterface'

interface MessageSellerButtonProps {
  sellerId: string
  productId?: string
  productName?: string
  className?: string
}

interface User {
  id: string;
  email?: string;
}

export default function MessageSellerButton({
  sellerId,
  productId,
  productName = 'Product',
  className = ''
}: MessageSellerButtonProps) {
  const [showMessages, setShowMessages] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const handleMessageSeller = async () => {
    setLoading(true)
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        // Redirect to login or show login modal
        alert('Please log in to message the seller')
        return
      }

      setUser(currentUser)
      setShowMessages(true)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to start conversation')
    } finally {
      setLoading(false)
    }
  }

  if (showMessages && user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-5/6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Message Seller {productName && `about ${productName}`}
            </h2>
            <button
              onClick={() => setShowMessages(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <MessageInterface
            userId={user.id}
            userType="customer"
            initialSellerId={sellerId}
            initialProductId={productId}
          />
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleMessageSeller}
      disabled={loading}
      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${className}`}
    >
      <span>💬</span>
      <span>{loading ? 'Loading...' : 'Message Seller'}</span>
    </button>
  )
}
