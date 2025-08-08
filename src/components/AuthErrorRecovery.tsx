/**
 * Auth Error Recovery Component
 * This component detects and handles authentication errors like invalid refresh tokens
 * It should be added to pages that require authentication to automatically clean up corrupted auth state
 */

"use client";

import { useEffect } from 'react';
import { clearAuthState, recoverFromAuthError } from '@/lib/supabase';

interface AuthErrorRecoveryProps {
  children: React.ReactNode;
}

export default function AuthErrorRecovery({ children }: AuthErrorRecoveryProps) {
  useEffect(() => {
    // Listen for unhandled auth errors
    const handleError = async (event: ErrorEvent) => {
      const error = event.error;
      const errorMessage = error?.message || error?.toString() || '';
      
      if (errorMessage.includes('AuthApiError') ||
          errorMessage.includes('Invalid Refresh Token') || 
          errorMessage.includes('Refresh Token Not Found') ||
          errorMessage.includes('refresh_token_not_found') ||
          errorMessage.includes('invalid_grant')) {
        
        console.log('🚨 Detected auth error, attempting recovery...');
        
        // Try to recover first
        const recovered = await recoverFromAuthError();
        if (!recovered) {
          console.log('🚨 Recovery failed, clearing auth state...');
          // Show user-friendly message before redirect
          alert('Your session has expired. You will be redirected to the login page.');
        }
      }
    };

    // Listen for promise rejections (common source of auth errors)
    const handlePromiseRejection = async (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const errorMessage = error?.message || error?.toString() || '';
      
      if (errorMessage.includes('AuthApiError') ||
          errorMessage.includes('Invalid Refresh Token') || 
          errorMessage.includes('Refresh Token Not Found') ||
          errorMessage.includes('refresh_token_not_found') ||
          errorMessage.includes('invalid_grant')) {
        
        console.log('🚨 Detected auth promise rejection, attempting recovery...');
        
        // Try to recover first
        const recovered = await recoverFromAuthError();
        if (!recovered) {
          console.log('🚨 Recovery failed, clearing auth state...');
          // Show user-friendly message before redirect
          alert('Your session has expired. You will be redirected to the login page.');
        }
        
        event.preventDefault(); // Prevent the error from being logged
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  return <>{children}</>;
}

/**
 * Hook to manually clear auth state when errors occur
 */
export function useAuthErrorRecovery() {
  const clearAuthStateManually = async () => {
    try {
      console.log('🧹 Manual auth state cleanup initiated...');
      await clearAuthState();
    } catch (error) {
      console.error('❌ Error clearing auth state:', error);
      // Fallback: hard redirect to login
      window.location.href = '/login';
    }
  };

  const recoverAuth = async () => {
    try {
      console.log('🔄 Manual auth recovery initiated...');
      const recovered = await recoverFromAuthError();
      return recovered;
    } catch (error) {
      console.error('❌ Error recovering auth:', error);
      return false;
    }
  };

  return { 
    clearAuthState: clearAuthStateManually,
    recoverAuth
  };
}
