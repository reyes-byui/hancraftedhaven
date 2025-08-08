'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { submitProductReview, type ReviewFormData } from '@/lib/supabase'

// Simple Star Rating Component
function StarRating({ rating, onRate, editable = false }: { 
  rating: number
  onRate?: (rating: number) => void
  editable?: boolean 
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={editable ? "button" : undefined}
          onClick={editable ? () => onRate?.(star) : undefined}
          className={`text-3xl ${editable ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
          disabled={!editable}
        >
          {star <= rating ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function ReviewProductPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('productId')
  const orderItemId = searchParams.get('orderItemId')
  const productName = searchParams.get('productName')

  const [formData, setFormData] = useState<ReviewFormData>({
    product_id: productId || '',
    order_item_id: orderItemId || '',
    rating: 0,
    comment: '',
    is_anonymous: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Validate required parameters
  useEffect(() => {
    if (!productId || !orderItemId || !productName) {
      setError('Missing required product information')
    }
  }, [productId, orderItemId, productName])

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

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!productId || !orderItemId || !productName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Review Link</h2>
            <p className="text-gray-600 mb-4">
              The review link is missing required information.
            </p>
            <Link 
              href="/my-reviews"
              className="inline-block bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to My Reviews
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Review Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for sharing your experience with the community.
            </p>
            <div className="space-y-3">
              <Link 
                href="/community"
                className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                View Community Reviews
              </Link>
              <Link 
                href="/my-reviews"
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to My Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Write a Review</h1>
            <p className="text-gray-600">Share your experience with this handcrafted product</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Product Name */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Product</h2>
              <p className="text-gray-700">{decodeURIComponent(productName)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  ✓ Verified Purchase
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Rating */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  How would you rate this product? *
                </label>
                <div className="flex flex-col items-center gap-4">
                  <StarRating
                    rating={formData.rating}
                    onRate={(rating) => setFormData(prev => ({ ...prev, rating }))}
                    editable={true}
                  />
                  {formData.rating > 0 && (
                    <p className="text-lg text-gray-700 font-medium">
                      {formData.rating} star{formData.rating !== 1 ? 's' : ''} - 
                      {formData.rating === 5 && ' Excellent!'}
                      {formData.rating === 4 && ' Very Good'}
                      {formData.rating === 3 && ' Good'}
                      {formData.rating === 2 && ' Fair'}
                      {formData.rating === 1 && ' Poor'}
                    </p>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-lg font-medium text-gray-900 mb-3">
                  Tell us about your experience *
                </label>
                <textarea
                  id="comment"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
                  placeholder="What did you like about this product? How was the quality, craftsmanship, and overall experience? Your detailed feedback helps other customers make informed decisions."
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Share specific details about quality, craftsmanship, and your overall satisfaction
                  </p>
                  <span className="text-sm text-gray-400">
                    {formData.comment?.length || 0}/1000
                  </span>
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                    className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="anonymous" className="text-lg font-medium text-gray-900 cursor-pointer">
                      Post anonymously
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Your review will be displayed without your name if you choose this option. 
                      It will still show as a verified purchase.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 text-xl">❌</span>
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || formData.rating === 0}
                  className="flex-1 bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-lg"
                >
                  {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
                </button>
                <Link
                  href="/my-reviews"
                  className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 text-lg text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
