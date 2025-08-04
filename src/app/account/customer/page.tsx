"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUserWithProfile, signOut } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; photo_url?: string } | null>(null);
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
              </span>
              <button
                onClick={handleSignOut}
                className="bg-[#a3b18a] hover:bg-[#8d6748] text-white px-4 py-2 rounded-full transition-colors"
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
          <h1 className="text-3xl font-serif text-[#8d6748] font-bold mb-6">Customer Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Browse Products */}
            <Link href="/listings" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Browse Products</h3>
              <p className="text-[#4d5c3a]">Discover unique handcrafted items from talented artisans.</p>
            </Link>

            {/* Order History */}
            <div className="bg-[#f8f5f2] p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Order History</h3>
              <p className="text-[#4d5c3a]">View your past purchases and track current orders.</p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>

            {/* Favorites */}
            <div className="bg-[#f8f5f2] p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Favorites</h3>
              <p className="text-[#4d5c3a]">Keep track of items you love and want to purchase.</p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>

            {/* Profile Settings */}
            <div className="bg-[#f8f5f2] p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Profile Settings</h3>
              <p className="text-[#4d5c3a]">Update your personal information and preferences.</p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>

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
    </div>
  );
}
