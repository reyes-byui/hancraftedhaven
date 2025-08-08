'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ChevronLeft, ChevronRight, Heart, MessageCircle, Shield, Award, Send } from 'lucide-react'
import { getRecentReviewsForCommunity, addPlatformReview, getPlatformReviews, getCurrentUser, type ReviewForCommunity, type PlatformReview } from '@/lib/supabase'
import MainHeader from "../../components/MainHeader";
import Footer from "../../components/Footer";
import DatabaseSetupMessage from "../../components/DatabaseSetupMessage";

// Star Rating Component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

// Review Card Component
function ReviewCard({ review }: { review: ReviewForCommunity }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-[280px] sm:min-w-[350px] sm:max-w-[400px] border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      {/* Product Info */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={review.product_image_url || '/placeholder-product.jpg'}
            alt={review.product_name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Link 
            href={`/products/${review.product_id}`}
            className="font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-2 text-sm"
          >
            {review.product_name}
          </Link>
          <p className="text-xs text-gray-500 mt-1">
            by {review.seller_business_name || review.seller_name}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <StarRating rating={review.rating} size="sm" />
        <span className="text-sm font-medium text-gray-700">{review.rating}/5</span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
      </div>

      {/* Review Comment */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>

      {/* Reviewer Info & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {review.is_anonymous ? '?' : (review.display_name?.[0] || 'U')}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {review.is_anonymous ? 'Anonymous Customer' : review.display_name}
            </p>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">Verified Purchase</span>
            </div>
          </div>
        </div>

        {/* Helpful Count */}
        {review.helpful_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Heart className="w-3 h-3" />
            <span>{review.helpful_count}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Reviews Carousel Component
function ReviewsCarousel({ reviews }: { reviews: ReviewForCommunity[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640) // sm breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate items per view and max index based on screen size
  const itemsPerView = isMobile ? 1 : 3
  const maxIndex = Math.max(0, reviews.length - itemsPerView)

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || reviews.length <= 1 || maxIndex === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (maxIndex + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, reviews.length, maxIndex])

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
    setIsAutoPlaying(false)
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
        <p className="text-gray-500">Be the first to share your experience!</p>
      </div>
    )
  }

  const canGoLeft = currentIndex > 0 && reviews.length > itemsPerView
  const canGoRight = currentIndex < maxIndex && reviews.length > itemsPerView

  return (
    <div className="relative">
      {/* Navigation Buttons - Only show when there are more reviews than can fit */}
      {reviews.length > itemsPerView && (
        <>
          <button
            onClick={goToPrevious}
            disabled={!canGoLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
              canGoLeft
                ? 'hover:bg-gray-50 hover:shadow-xl cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>

          <button
            onClick={goToNext}
            disabled={!canGoRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
              canGoRight
                ? 'hover:bg-gray-50 hover:shadow-xl cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </>
      )}

      {/* Carousel Container */}
      <div className={`overflow-hidden ${reviews.length > itemsPerView ? 'mx-12 sm:mx-16' : 'mx-2 sm:mx-4'}`}>
        <div
          className={`flex transition-transform duration-500 ease-in-out ${
            reviews.length <= itemsPerView ? 'justify-center' : ''
          }`}
          style={{
            transform: reviews.length > itemsPerView ? `translateX(-${currentIndex * (100 / itemsPerView)}%)` : 'none',
          }}
        >
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className={`${
                reviews.length > itemsPerView ? (isMobile ? 'w-full' : 'w-1/3') : 'w-auto'
              } flex-shrink-0 px-1 sm:px-2 ${
                isMobile && reviews.length > itemsPerView ? 'flex justify-center' : ''
              }`}
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>

      {/* Indicators - Only show when there are more reviews than can fit */}
      {reviews.length > itemsPerView && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsAutoPlaying(false)
              }}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      <div className="text-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isAutoPlaying ? 'Auto-playing' : 'Auto-play paused'} • Click to {isAutoPlaying ? 'pause' : 'resume'}
        </button>
      </div>
    </div>
  )
}

// Community Stats Component
function CommunityStats({ reviewCount }: { reviewCount: number }) {
  const stats = [
    {
      label: 'Happy Customers',
      value: reviewCount.toLocaleString(),
      icon: Heart,
      color: 'text-red-500'
    },
    {
      label: 'Product Reviews',
      value: reviewCount.toLocaleString(),
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      label: 'Verified Purchases',
      value: reviewCount.toLocaleString(),
      icon: Shield,
      color: 'text-green-500'
    },
    {
      label: 'Quality Guarantee',
      value: '100%',
      icon: Award,
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3`}>
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// Platform Review Form Component
function PlatformReviewForm({ onReviewSubmitted }: { onReviewSubmitted: () => void }) {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [userType, setUserType] = useState<'customer' | 'seller' | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getCurrentUser()
      if (user) {
        setUser(user)
        // Try to determine user type by checking which profile exists
        // This is a simplified check - you might want to enhance this
        setUserType('customer') // Default to customer, you can enhance this logic
      }
    }
    checkUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userType || rating === 0 || !reviewText.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await addPlatformReview(rating, reviewText.trim(), userType)
      if (error) {
        alert(error)
      } else {
        setRating(0)
        setReviewText('')
        onReviewSubmitted()
        alert('Thank you for your review!')
      }
    } catch (err) {
      alert('Failed to submit review. Please try again.')
      console.error('Error submitting platform review:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Share Your Experience</h3>
        <p className="text-gray-600 mb-6">
          Help us improve Handcrafted Haven by sharing your experience with our platform.
        </p>
        <div className="space-x-4">
          <Link
            href="/login/customer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Login as Customer
          </Link>
          <Link
            href="/login/seller"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Login as Seller
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Review Handcrafted Haven</h3>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        {/* Rating Stars */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you rate your overall experience with Handcrafted Haven?
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200 hover:fill-yellow-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-600">
              {rating === 0 ? 'Select a rating' : `${rating} star${rating !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Share your thoughts about the platform
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="What do you like about Handcrafted Haven? How has your experience been as a user of our platform?"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {reviewText.length}/500 characters
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0 || !reviewText.trim()}
            className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Platform Reviews Display Component
function PlatformReviewsDisplay({ reviews }: { reviews: PlatformReview[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [reviewsPerPage, setReviewsPerPage] = useState(3)
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)

  // Responsive reviews per page
  useEffect(() => {
    const updateReviewsPerPage = () => {
      if (window.innerWidth < 768) {
        setReviewsPerPage(1) // Mobile: 1 review
      } else if (window.innerWidth < 1024) {
        setReviewsPerPage(2) // Tablet: 2 reviews
      } else {
        setReviewsPerPage(3) // Desktop: 3 reviews
      }
    }

    updateReviewsPerPage()
    window.addEventListener('resize', updateReviewsPerPage)
    return () => window.removeEventListener('resize', updateReviewsPerPage)
  }, [])

  // Reset to first page when reviewsPerPage changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [reviewsPerPage])

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No platform reviews yet. Be the first to share your experience!</p>
      </div>
    )
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || totalPages <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPages)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, totalPages])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  const getCurrentReviews = () => {
    const start = currentIndex * reviewsPerPage
    const end = start + reviewsPerPage
    return reviews.slice(start, end)
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[280px]">
          {getCurrentReviews().map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    review.user_type === 'seller' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {review.user_type === 'seller' ? 'Artisan' : 'Customer'}
                  </span>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <p className="text-gray-700 text-sm mb-3 line-clamp-4">{review.review_text}</p>
              <div className="text-xs text-gray-500">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls - Only show if more than one page */}
      {totalPages > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-purple-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          {/* Page Info & Auto-play Status */}
          <div className="text-center mt-4">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {totalPages} • {reviews.length} total reviews
              {isAutoPlaying && totalPages > 1 && (
                <span className="ml-2 text-purple-600">
                  • Auto-playing
                </span>
              )}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

// Main Community Page Component
export default function CommunityPage() {
  const [reviews, setReviews] = useState<ReviewForCommunity[]>([])
  const [platformReviews, setPlatformReviews] = useState<PlatformReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true)
        
        // Load product reviews
        const { data, error } = await getRecentReviewsForCommunity(50)
        if (error) {
          // If it's a function not found error, show a helpful message
          if (error.includes('function') || error.includes('does not exist')) {
            setError('Database functions not set up yet. Please run the PRODUCT_REVIEW_SYSTEM_SETUP.sql file in your Supabase dashboard.')
            return
          }
          throw new Error(error)
        }
        setReviews(data || [])

        // Load platform reviews
        const { data: platformData } = await getPlatformReviews(10)
        setPlatformReviews(platformData || [])
        
      } catch (err) {
        console.error('Error loading reviews:', err)
        if (err instanceof Error && err.message.includes('function')) {
          setError('Database functions not set up yet. Please run the PRODUCT_REVIEW_SYSTEM_SETUP.sql file in your Supabase dashboard.')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load reviews. Please ensure the database is properly set up.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [])

  const handlePlatformReviewSubmitted = async () => {
    // Reload platform reviews after submission
    const { data: platformData } = await getPlatformReviews(10)
    setPlatformReviews(platformData || [])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <MainHeader />
        <main className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading community reviews...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <MainHeader />
        <main className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container mx-auto px-4 py-12">
            {error.includes('Database functions not set up') || error.includes('Product review system not yet set up') ? (
              <DatabaseSetupMessage message={error} />
            ) : (
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Unable to load reviews</h3>
                <p className="text-gray-500">{error}</p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Community & Reviews
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover what our community is saying about handcrafted treasures. 
              Real reviews from verified customers who experienced the magic of authentic craftsmanship.
            </p>
          </div>

          {/* Community Stats */}
          <CommunityStats reviewCount={reviews.length} />

          {/* Reviews Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Customer Reviews</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                See what our customers are saying about their handcrafted purchases. 
                Every review is from a verified purchase to ensure authenticity.
              </p>
            </div>

            <ReviewsCarousel reviews={reviews} />
          </div>

          {/* Platform Reviews Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Review Handcrafted Haven</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Share your experience with our platform and help us improve our service for all users.
              </p>
            </div>

            {/* Platform Review Form */}
            <div className="mb-12">
              <PlatformReviewForm onReviewSubmitted={handlePlatformReviewSubmitted} />
            </div>

            {/* Platform Reviews Display */}
            {platformReviews.length > 0 && (
              <div className="px-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">What Our Community Says About Us</h3>
                  <p className="text-gray-600">
                    Honest feedback from our customers and artisans about their experience with Handcrafted Haven.
                  </p>
                </div>
                <PlatformReviewsDisplay reviews={platformReviews} />
              </div>
            )}
          </div>

          {/* Community Features */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Join Our Community</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Share Your Experience</h3>
                <p className="text-gray-600">
                  After receiving your handcrafted items, share your thoughts and help other customers discover amazing products.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Support Artisans</h3>
                <p className="text-gray-600">
                  Your reviews and feedback help our talented artisans improve their craft and reach more customers.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Build Trust</h3>
                <p className="text-gray-600">
                  Every review is from a verified purchase, creating a trustworthy community for authentic handcrafted goods.
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Explore Products
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
