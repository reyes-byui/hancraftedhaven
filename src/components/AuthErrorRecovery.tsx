/**
 * Auth Error Recovery Component
 * This component detects and handles authentication errors like invalid refresh tokens
 * It should be added to pages that require authentication to automatically clean up corrupted auth state
 */

"use client";

import { useEffect } from 'react';
import { handleAuthError } from '@/lib/supabase';

interface AuthErrorRecoveryProps {
  children: React.ReactNode;
}

export default function AuthErrorRecovery({ children }: AuthErrorRecoveryProps) {
  useEffect(() => {
    // Listen for unhandled auth errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      if (error?.message?.includes('Invalid Refresh Token') || 
          error?.message?.includes('Refresh Token Not Found') ||
          error?.message?.includes('refresh_token_not_found')) {
        console.log('Detected auth error, cleaning up...');
        handleAuthError(error);
        // Optionally reload the page after cleanup
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    // Listen for promise rejections (common source of auth errors)
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error?.message?.includes('Invalid Refresh Token') || 
          error?.message?.includes('Refresh Token Not Found') ||
          error?.message?.includes('refresh_token_not_found')) {
        console.log('Detected auth promise rejection, cleaning up...');
        handleAuthError(error);
        event.preventDefault(); // Prevent the error from being logged
        // Optionally reload the page after cleanup
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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
  const clearAuthState = async () => {
    try {
      await handleAuthError({ message: 'Manual auth cleanup' });
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  return { clearAuthState };
}
