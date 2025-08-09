"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCurrentUserWithProfile } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";

export default function CustomerDashboard() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ 
    first_name?: string; 
    last_name?: string; 
    photo_url?: string;
    address?: string;
    contact_number?: string;
    country?: string;
    role?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { user, profile, error } = await getCurrentUserWithProfile();
      if (error || !user) {
        router.push("/login/customer");
      } else {
        setUser(user);
        setProfile(profile);
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2]">
        <div className="text-[#8d6748] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* Use consistent header */}
      <MainHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-serif text-[#8d6748] font-bold mb-6">Customer Dashboard</h1>
          
          {/* Profile Information Display */}
          <div className="bg-[#f8f5f2] border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 mb-4">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {profile?.photo_url ? (
                    <Image 
                      src={profile.photo_url} 
                      alt="Profile" 
                      width={96} 
                      height={96} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs">No Photo</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-xl font-semibold text-[#8d6748] mb-4">Your Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
                  <div>
                    <span className="font-medium text-[#4d5c3a]">Name:</span>
                    <span className="ml-2 text-gray-700">
                      {profile?.first_name || profile?.last_name 
                        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                        : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-[#4d5c3a]">Email:</span>
                    <span className="ml-2 text-gray-700">{user?.email || 'Not available'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#4d5c3a]">Address:</span>
                    <span className="ml-2 text-gray-700">{profile?.address || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#4d5c3a]">Phone:</span>
                    <span className="ml-2 text-gray-700">{profile?.contact_number || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#4d5c3a]">Country:</span>
                    <span className="ml-2 text-gray-700">{profile?.country || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>
            {(!profile?.address || !profile?.first_name) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Incomplete Profile:</strong> Please update your profile information, especially your shipping address, to enable checkout.
                </p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Browse Products */}
            <Link href="/listings" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Browse Products</h3>
              <p className="text-[#4d5c3a]">Discover unique handcrafted items from talented artisans.</p>
            </Link>

            {/* Shopping Cart */}
            <Link href="/account/customer/cart" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Shopping Cart</h3>
              <p className="text-[#4d5c3a]">Review and checkout items you&apos;ve added to your cart.</p>
            </Link>

            {/* Order History */}
            <Link href="/account/customer/orders" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Order History</h3>
              <p className="text-[#4d5c3a]">View your past purchases and track current orders.</p>
            </Link>

            {/* Review Products */}
            <Link href="/my-reviews" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">⭐ Review Products</h3>
              <p className="text-[#4d5c3a]">Share your experience with delivered products and help the community.</p>
            </Link>

            {/* Favorites */}
            <Link href="/account/customer/favorites" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Favorites</h3>
              <p className="text-[#4d5c3a]">Keep track of items you love and want to purchase.</p>
            </Link>

            {/* Profile Settings */}
            <Link href="/settings" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Account Settings</h3>
              <p className="text-[#4d5c3a]">Update your personal information, photo, and account settings.</p>
            </Link>

            {/* Support */}
            <Link href="/contact" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Support</h3>
              <p className="text-[#4d5c3a]">Get help with your orders or account questions.</p>
            </Link>

            {/* Community */}
            <Link href="/community" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Community</h3>
              <p className="text-[#4d5c3a]">Connect with other craft enthusiasts and makers.</p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
