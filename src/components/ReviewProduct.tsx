'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, CheckCircle, AlertCircle, Loader2, ShoppingBag, User, UserX } from 'lucide-react'
import { 
  submitProductReview, 
  canCustomerReviewProduct, 
  getCustomerDeliveredOrders,
  type ReviewFormData,
  type CanReviewResponse 
} from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

// Star Rating Input Component
function StarRatingInput({ 
  rating, 
  onRatingChange, 
  size = 'lg' 
}: { 
  rating: number
  onRatingChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg' 
}) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onRatingChange(star)}
          className="transition-transform duration-200 hover:scale-110"
        >
          <Star
            className={`${sizeClasses[size]} transition-colors duration-200 ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {rating > 0 && (
          <>
            {rating} star{rating !== 1 ? 's' : ''}
            {rating === 5 && ' - Excellent!'}
            {rating === 4 && ' - Very Good'}
            {rating === 3 && ' - Good'}
            {rating === 2 && ' - Fair'}
            {rating === 1 && ' - Poor'}
          </>
        )}
      </span>
    </div>
  )
}

// Single Review Form Component
function ReviewForm({ 
  product, 
  orderItemId, 
  onSubmitSuccess, 
  onCancel 
}: {
  product: {
    id: string
    name: string
    image_url: string
  }
  orderItemId: string
  onSubmitSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<ReviewFormData>({
    product_id: product.id,
    order_item_id: orderItemId,
    rating: 0,
    comment: '',
    is_anonymous: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!formData.comment?.trim()) {
      setError('Please write a comment about your experience')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await submitProductReview({
        ...formData,
        comment: formData.comment?.trim()
      })

      if (error) {
        throw new Error(error)
      }

      onSubmitSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-start gap-4 mb-6">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={product.image_url || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600">Share your experience with this product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            How would you rate this product? *
          </label>
          <StarRatingInput
            rating={formData.rating}
            onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-900 mb-2">
            Tell us about your experience *
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="What did you like about this product? How was the quality, craftsmanship, and overall experience?"
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Share specific details to help other customers make informed decisions
            </p>
            <span className="text-xs text-gray-400">
              {formData.comment?.length || 0}/1000
            </span>
          </div>
        </div>

        {/* Anonymous Option */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="anonymous"
            checked={formData.is_anonymous}
            onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
            className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <div className="flex-1">
            <label htmlFor="anonymous" className="text-sm font-medium text-gray-900 cursor-pointer">
              Post anonymously
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Your review will be displayed without your name if you choose this option
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || formData.rating === 0}
            className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Review...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// Reviewable Products List Component
function ReviewableProductsList() {
  const { user } = useAuth()
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<{
    product: any
    orderItemId: string
  } | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    async function loadDeliveredOrders() {
      if (!user) return

      try {
        setIsLoading(true)
        const { data, error } = await getCustomerDeliveredOrders()

        if (error) {
          throw new Error(error)
        }

        // Filter to only show products that haven't been reviewed
        const reviewableProducts = (data || []).filter(item => !item.has_reviewed)
        setDeliveredOrders(reviewableProducts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }

    loadDeliveredOrders()
  }, [user])

  const handleReviewSuccess = () => {
    setSelectedProduct(null)
    setReviewSuccess(true)
    // Remove the reviewed product from the list
    if (selectedProduct) {
      setDeliveredOrders(prev => 
        prev.filter(item => 
          !(item.id === selectedProduct.orderItemId && item.product_id === selectedProduct.product.id)
        )
      )
    }
    
    // Hide success message after 3 seconds
    setTimeout(() => setReviewSuccess(false), 3000)
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Please log in</h3>
        <p className="text-gray-500">You need to be logged in to review products</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading your delivered orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error loading orders</h3>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (reviewSuccess) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-600 mb-2">Review submitted successfully!</h3>
        <p className="text-gray-600 mb-4">Thank you for sharing your experience with the community.</p>
        <button
          onClick={() => setReviewSuccess(false)}
          className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          Review Another Product
        </button>
      </div>
    )
  }

  if (selectedProduct) {
    return (
      <ReviewForm
        product={selectedProduct.product}
        orderItemId={selectedProduct.orderItemId}
        onSubmitSuccess={handleReviewSuccess}
        onCancel={() => setSelectedProduct(null)}
      />
    )
  }

  if (deliveredOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No products to review</h3>
        <p className="text-gray-500 mb-4">
          You can review products after they have been delivered and you haven't reviewed them yet.
        </p>
        <a
          href="/products"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          Browse Products
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Products Available for Review</h2>
      
      {deliveredOrders.map((orderItem) => (
        <div
          key={orderItem.id}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={orderItem.product.image_url || '/placeholder-product.jpg'}
                alt={orderItem.product.name}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {orderItem.product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Delivered • Ready for review
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Verified Purchase</span>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedProduct({
                product: orderItem.product,
                orderItemId: orderItem.id
              })}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Write Review
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Main Review Product Page Component
export default function ReviewProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Review Your Products
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your experience with handcrafted products you've purchased. 
            Your honest reviews help other customers and support our artisan community.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <ReviewableProductsList />
        </div>
      </div>
    </div>
  )
}
