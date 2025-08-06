"use client";

import { useEffect, useState } from 'react';
import { handleAuthError } from '@/lib/supabase';
import Link from 'next/link';

export default function AuthCleanerPage() {
  const [status, setStatus] = useState<'idle' | 'clearing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const clearAuthState = async () => {
    setStatus('clearing');
    setMessage('Clearing authentication state...');

    try {
      // Clear Supabase auth
      await handleAuthError({ message: 'Manual cleanup' });
      
      // Clear all localStorage
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) keysToRemove.push(key);
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        sessionStorage.clear();
      }
      
      setStatus('success');
      setMessage('✅ Authentication state cleared successfully!');
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      
    } catch (error) {
      setStatus('error');
      setMessage('❌ Error clearing auth state: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Auto-clear on page load if there's a query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auto') === 'true') {
      clearAuthState();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-serif text-[#8d6748] font-bold mb-6">
          Authentication Reset
        </h1>
        
        <div className="mb-6">
          <p className="text-[#4d5c3a] mb-4">
            Use this tool to fix authentication errors like &quot;Invalid Refresh Token&quot;
          </p>
          
          {message && (
            <div className={`p-4 rounded-lg mb-4 ${
              status === 'success' ? 'bg-green-100 text-green-700' :
              status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={clearAuthState}
            disabled={status === 'clearing'}
            className="bg-[#a3b18a] hover:bg-[#8d6748] disabled:bg-gray-400 text-white font-semibold rounded-full px-6 py-3 transition-colors"
          >
            {status === 'clearing' ? 'Clearing...' : 'Clear Authentication State'}
          </button>

          <Link 
            href="/login"
            className="bg-[#bfa76a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-6 py-3 transition-colors inline-block"
          >
            Go to Login
          </Link>

          <Link 
            href="/"
            className="text-[#8d6748] hover:underline text-sm"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <p>This will clear all stored authentication tokens and session data.</p>
        </div>
      </div>
    </div>
  );
}
