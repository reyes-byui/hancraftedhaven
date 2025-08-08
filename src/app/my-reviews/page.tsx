'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCustomerDeliveredOrders } from '@/lib/supabase'
import DatabaseSetupMessage from '../../components/DatabaseSetupMessage'

// Simple Star Rating Display
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="text-lg">
          {star <= rating ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  )
}

// Order Item Card for Review
function OrderItemCard({ orderItem }: { orderItem: any }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* Product Image */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={orderItem.product.image_url || '/placeholder-product.jpg'}
            alt={orderItem.product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {orderItem.product.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              ✓ Delivered
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(orderItem.created_at)}
            </span>
          </div>
          
          {/* Review Status */}
          <div className="flex items-center justify-between">
            <div>
              {orderItem.has_reviewed ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">You reviewed this product</span>
                  <span className="text-green-600">✓</span>
                </div>
              ) : (
                <span className="text-sm text-purple-600">Ready for review</span>
              )}
            </div>

            {/* Review Button */}
            {!orderItem.has_reviewed && (
              <Link
                href={`/review-product?productId=${orderItem.product_id}&orderItemId=${orderItem.id}&productName=${encodeURIComponent(orderItem.product.name)}`}
                className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm flex items-center gap-2"
              >
                ⭐ Write Review
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CustomerReviewDashboard() {
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'reviewed' | 'pending'>('all')

  useEffect(() => {
    async function loadDeliveredOrders() {
      try {
        setIsLoading(true)
        const { data, error } = await getCustomerDeliveredOrders()

        if (error) {
          // If it's a function not found error, show a helpful message
          if (error.includes('function') || error.includes('does not exist')) {
            setError('Database functions not set up yet. Please run the PRODUCT_REVIEW_SYSTEM_SETUP.sql file in your Supabase dashboard.')
            return
          }
          throw new Error(error)
        }

        setDeliveredOrders(data || [])
      } catch (err) {
        console.error('Error loading orders:', err)
        if (err instanceof Error && err.message.includes('function')) {
          setError('Database functions not set up yet. Please run the PRODUCT_REVIEW_SYSTEM_SETUP.sql file in your Supabase dashboard.')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load orders. Please ensure the database is properly set up.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadDeliveredOrders()
  }, [])

  // Filter orders based on review status
  const filteredOrders = deliveredOrders.filter(order => {
    if (filter === 'reviewed') return order.has_reviewed
    if (filter === 'pending') return !order.has_reviewed
    return true
  })

  const pendingReviewsCount = deliveredOrders.filter(order => !order.has_reviewed).length
  const completedReviewsCount = deliveredOrders.filter(order => order.has_reviewed).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
              <div className="grid gap-4 max-w-4xl mx-auto">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {error.includes('Database functions not set up') || error.includes('Product review system not yet set up') ? (
            <DatabaseSetupMessage message={error} />
          ) : (
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Orders</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Review Your Products
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your experience with products you've purchased. Your reviews help other customers and support our artisan community.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{deliveredOrders.length}</div>
            <div className="text-gray-600">Total Delivered</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{pendingReviewsCount}</div>
            <div className="text-gray-600">Pending Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{completedReviewsCount}</div>
            <div className="text-gray-600">Reviews Complete</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setFilter('all')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Orders ({deliveredOrders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Reviews ({pendingReviewsCount})
            </button>
            <button
              onClick={() => setFilter('reviewed')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === 'reviewed'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviewed ({completedReviewsCount})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="max-w-4xl mx-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {filter === 'pending' ? 'No pending reviews' : 
                 filter === 'reviewed' ? 'No completed reviews yet' : 
                 'No delivered orders'}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === 'pending' ? 'All your products have been reviewed!' :
                 filter === 'reviewed' ? 'Start reviewing your delivered products.' :
                 'Once you receive products, you can review them here.'}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View All Orders
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((orderItem) => (
                <OrderItemCard key={orderItem.id} orderItem={orderItem} />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        {pendingReviewsCount > 0 && (
          <div className="text-center mt-12">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-purple-600 text-4xl mb-3">⭐</div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                You have {pendingReviewsCount} product{pendingReviewsCount !== 1 ? 's' : ''} waiting for review!
              </h3>
              <p className="text-purple-700 mb-4">
                Your feedback helps other customers and supports our artisan community.
              </p>
              <button
                onClick={() => setFilter('pending')}
                className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Review Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
