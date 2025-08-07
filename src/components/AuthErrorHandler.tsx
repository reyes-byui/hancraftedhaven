'use client'

import { useEffect } from 'react'
import { clearAuthState, recoverFromAuthError } from '@/lib/supabase'

export default function AuthErrorHandler() {
  useEffect(() => {
    // Global error handler for unhandled auth errors
    const handleGlobalError = async (event: ErrorEvent) => {
      const error = event.error || event.message
      const errorString = error?.toString() || ''
      
      if (errorString.includes('AuthApiError') ||
          errorString.includes('Invalid Refresh Token') ||
          errorString.includes('Refresh Token Not Found') ||
          errorString.includes('refresh_token_not_found')) {
        
        console.log('🚨 Global auth error detected:', errorString)
        
        // Try to recover first
        const recovered = await recoverFromAuthError()
        if (!recovered) {
          // If recovery fails, show user-friendly message
          alert('Your session has expired. You will be redirected to the login page.')
        }
      }
    }

    // Global promise rejection handler
    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const errorString = reason?.message || reason?.toString() || ''
      
      if (errorString.includes('AuthApiError') ||
          errorString.includes('Invalid Refresh Token') ||
          errorString.includes('Refresh Token Not Found') ||
          errorString.includes('refresh_token_not_found')) {
        
        console.log('🚨 Unhandled auth promise rejection:', errorString)
        
        // Try to recover first
        const recovered = await recoverFromAuthError()
        if (!recovered) {
          // If recovery fails, show user-friendly message
          alert('Your session has expired. You will be redirected to the login page.')
        }
        
        // Prevent the error from being logged to console
        event.preventDefault()
      }
    }

    // Add event listeners
    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup event listeners
    return () => {
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // This component doesn't render anything
  return null
}
