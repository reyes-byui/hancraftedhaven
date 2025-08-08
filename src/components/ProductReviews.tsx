'use client'

import { useState, useEffect } from 'react'
import { getProductReviews, getProductRatingSummary, type ProductReview, type ProductRatingSummary } from '@/lib/supabase'

// Simple Star Rating Display
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const starSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-base'
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={starSize}>
          {star <= rating ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  )
}

// Single Review Display
function ReviewCard({ review }: { review: ProductReview & { is_own_review: boolean } }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      {/* Rating and Date */}
      <div className="flex items-center justify-between mb-3">
        <StarRating rating={review.rating} />
        <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 mb-3 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
      )}

      {/* Reviewer Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {review.is_anonymous ? '?' : (review.display_name?.[0] || 'U')}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900">
              {review.is_anonymous ? 'Anonymous Customer' : review.display_name}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-green-600">✓ Verified Purchase</span>
            </div>
          </div>
        </div>

        {/* Helpful Count */}
        {review.helpful_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>❤️ {review.helpful_count}</span>
          </div>
        )}
      </div>

      {/* Seller Response */}
      {review.seller_response && (
        <div className="mt-4 pl-4 border-l-2 border-purple-200 bg-purple-50 p-3 rounded">
          <div className="text-sm font-medium text-purple-800 mb-1">Seller Response:</div>
          <p className="text-sm text-purple-700">{review.seller_response}</p>
          {review.seller_responded_at && (
            <div className="text-xs text-purple-600 mt-1">
              {formatDate(review.seller_responded_at)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Rating Summary Component
function RatingSummary({ summary }: { summary: ProductRatingSummary }) {
  const getRatingPercentage = (count: number) => {
    return summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900">{summary.average_rating}</div>
          <StarRating rating={Math.round(summary.average_rating)} size="md" />
          <div className="text-sm text-gray-600 mt-1">
            {summary.total_reviews} review{summary.total_reviews !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = summary[`rating_${rating}_count` as keyof ProductRatingSummary] as number
          const percentage = getRatingPercentage(count)
          
          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm w-6">{rating}⭐</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Main Product Reviews Component
interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<(ProductReview & { is_own_review: boolean })[]>([])
  const [summary, setSummary] = useState<ProductRatingSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_rated' | 'lowest_rated' | 'most_helpful'>('newest')

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true)
        
        // Load both reviews and summary
        const [reviewsResult, summaryResult] = await Promise.all([
          getProductReviews(productId, 20, 0, sortBy),
          getProductRatingSummary(productId)
        ])

        if (reviewsResult.error) {
          throw new Error(reviewsResult.error)
        }

        if (summaryResult.error) {
          throw new Error(summaryResult.error)
        }

        setReviews(reviewsResult.data || [])
        setSummary(summaryResult.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reviews')
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [productId, sortBy])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">❌ Error loading reviews</div>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (!summary || summary.total_reviews === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
        <p className="text-gray-500">Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest_rated' | 'lowest_rated' | 'most_helpful')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest_rated">Highest rated</option>
          <option value="lowest_rated">Lowest rated</option>
          <option value="most_helpful">Most helpful</option>
        </select>
      </div>

      {/* Rating Summary */}
      <RatingSummary summary={summary} />

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load More Button (if needed) */}
      {reviews.length >= 20 && (
        <div className="text-center">
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  )
}
