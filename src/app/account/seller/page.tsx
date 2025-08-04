"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUserWithProfile, signOut } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SellerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { user, profile, error } = await getCurrentUserWithProfile();
      if (error || !user) {
        router.push("/login/seller");
      } else {
        setUser(user);
        setProfile(profile);
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2]">
        <div className="text-[#8d6748] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-serif font-bold text-[#8d6748]">
              Handcrafted Haven
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/settings" className="text-[#8d6748] hover:underline">
                Settings
              </Link>
              <span className="text-[#4d5c3a]">
                Welcome, {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.email}
                {profile?.business_name && (
                  <span className="block text-sm text-gray-600">{profile.business_name}</span>
                )}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-[#bfa76a] hover:bg-[#8d6748] text-white px-4 py-2 rounded-full transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-serif text-[#8d6748] font-bold mb-6">Seller Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Product */}
            <div className="bg-[#f8f5f2] p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Add New Product</h3>
              <p className="text-[#4d5c3a]">List a new handcrafted item for sale.</p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>

            {/* My Products */}
            <div className="bg-[#f8f5f2] p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">My Products</h3>
              <p className="text-[#4d5c3a]">Manage your current product listings.</p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>

            {/* Orders */}
            <div className="bg-[#f8f5f2] p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Orders</h3>
              <p className="text-[#4d5c3a]">View and manage customer orders.</p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>

            {/* Analytics */}
            <div className="bg-[#f8f5f2] p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Analytics</h3>
              <p className="text-[#4d5c3a]">Track your sales performance and customer insights.</p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>

            {/* Profile Settings */}
            <div className="bg-[#f8f5f2] p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Business Profile</h3>
              <p className="text-[#4d5c3a]">Update your business information and settings.</p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>

            {/* Community */}
            <Link href="/community" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Community</h3>
              <p className="text-[#4d5c3a]">Connect with other sellers and share experiences.</p>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#a3b18a] text-white p-4 rounded-lg text-center">
              <h4 className="text-lg font-semibold">Total Products</h4>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-[#bfa76a] text-white p-4 rounded-lg text-center">
              <h4 className="text-lg font-semibold">Total Orders</h4>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-[#8d6748] text-white p-4 rounded-lg text-center">
              <h4 className="text-lg font-semibold">Revenue</h4>
              <p className="text-2xl font-bold">$0</p>
            </div>
            <div className="bg-[#4d5c3a] text-white p-4 rounded-lg text-center">
              <h4 className="text-lg font-semibold">Reviews</h4>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
