"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/supabase';
import MainHeader from '@/components/MainHeader';

export default function AuthRecoveryPage() {
  const router = useRouter();

  useEffect(() => {
    const clearAuthAndRedirect = async () => {
      try {
        // Sign out to clear any corrupted tokens
        await signOut();
        
        // Clear local storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        
        // Wait a moment then redirect
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (error) {
        console.log('Error during auth recovery:', error);
        // Even if signOut fails, still clear storage and redirect
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
        router.push('/');
      }
    };

    clearAuthAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-serif text-[#8d6748] font-bold mb-4">
            Recovering Authentication...
          </h1>
          <p className="text-gray-600 mb-4">
            We&apos;re clearing corrupted authentication tokens and redirecting you to the homepage.
          </p>
          <div className="text-sm text-gray-500">
            This should complete automatically in a moment.
          </div>
        </div>
      </main>
    </div>
  );
}
