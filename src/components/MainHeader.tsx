"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentUserWithProfile, signOut, getCartItemCount } from "@/lib/supabase";

export default function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; role?: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { user, profile } = await getCurrentUserWithProfile();
      setUser(user);
      setProfile(profile);
      
      // Load cart count if user is a customer
      if (user && profile && !profile.role) { // customers don't have a role field
        loadCartCount();
      }
      
      setLoading(false);
    }
    checkUser();
  }, []);

  const loadCartCount = async () => {
    try {
      const { data: count } = await getCartItemCount();
      setCartCount(count);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
    // Refresh the page to update the UI
    window.location.reload();
  };

  const getUserDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    } else if (profile?.first_name) {
      return profile.first_name;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <header className="w-full bg-white shadow-sm relative z-40">
      {/* Desktop: Two-row layout with better spacing */}
      <div className="hidden md:block px-4 sm:px-8 py-4 sm:py-6">
        {/* Top Row: Logo, Title, and User Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Handcrafted Haven Logo" width={64} height={64} className="sm:w-20 sm:h-20" />
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#8d6748]">Handcrafted Haven</span>
          </div>
          
          <div className="flex items-center">
            {loading ? (
              <div className="text-[#8d6748]">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="text-[#8d6748] text-right">
                  <span className="text-sm">Logged in as</span>
                  <br />
                  <span className="font-semibold">{getUserDisplayName()}</span>
                </div>
                <div className="flex gap-2">
                  {profile?.role === 'customer' && (
                    <Link 
                      href="/account/customer/cart"
                      className="relative bg-[#588157] hover:bg-[#3a5a40] text-white font-semibold rounded-full px-4 py-2 shadow-lg transition-colors text-sm flex items-center gap-2"
                    >
                      🛒 Cart
                      {cartCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <Link 
                    href={profile?.role === 'seller' ? '/account/seller' : '/account/customer'}
                    className="bg-[#a3b18a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-4 py-2 shadow-lg transition-colors text-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-full px-4 py-2 shadow-lg transition-colors text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="bg-[#a3b18a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-6 py-2 shadow-lg transition-colors">
                Log In
              </Link>
            )}
          </div>
        </div>

        {/* Bottom Row: Navigation */}
        <div className="flex justify-center border-t border-gray-100 pt-4">
          <nav className="flex gap-8 text-lg font-medium">
            <Link href="/" className="text-[#8d6748] hover:underline hover:text-[#6b5235] transition-colors">Home</Link>
            <Link href="/sellers" className="text-[#8d6748] hover:underline hover:text-[#6b5235] transition-colors">Sellers</Link>
            <Link href="/listings" className="text-[#8d6748] hover:underline hover:text-[#6b5235] transition-colors">Listings</Link>
            <Link href="/about" className="text-[#8d6748] hover:underline hover:text-[#6b5235] transition-colors">About</Link>
            <Link href="/contact" className="text-[#8d6748] hover:underline hover:text-[#6b5235] transition-colors">Contact</Link>
          </nav>
        </div>
      </div>

      {/* Mobile: Original single column layout */}
      <div className="md:hidden flex flex-col px-4 sm:px-8 py-4 sm:py-6 gap-4">
        {/* Logo - Mobile: Top Center */}
        <div className="flex justify-center">
          <Image src="/logo.png" alt="Handcrafted Haven Logo" width={64} height={64} className="sm:w-24 sm:h-24" />
        </div>

        {/* Title - Mobile: Center */}
        <div className="flex justify-center">
          <span className="text-xl sm:text-3xl font-serif font-bold text-[#8d6748]">Handcrafted Haven</span>
        </div>

        {/* Mobile: User Info and Hamburger */}
        <div className="flex justify-between items-center">
          <div className="flex-1">
            {loading ? (
              <div className="text-[#8d6748] text-sm">Loading...</div>
            ) : user ? (
              <div className="text-[#8d6748] text-sm">
                <span>Welcome, {getUserDisplayName()}</span>
              </div>
            ) : null}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="flex flex-col justify-center items-center w-8 h-8 space-y-1"
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-0.5 bg-[#8d6748] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[#8d6748] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[#8d6748] transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-white border-t border-b border-gray-300 shadow-xl transition-all duration-300 ease-in-out z-50 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`} style={{backgroundColor: '#ffffff', backdropFilter: 'blur(8px)'}}>
        <div className="bg-white">
          <nav className="flex flex-col items-center px-4 py-4 space-y-4 bg-white">
          <Link 
            href="/" 
            className="text-[#8d6748] hover:underline text-lg font-medium py-2 text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/sellers" 
            className="text-[#8d6748] hover:underline text-lg font-medium py-2 text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Sellers
          </Link>
          <Link 
            href="/listings" 
            className="text-[#8d6748] hover:underline text-lg font-medium py-2 text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Listings
          </Link>
          <Link 
            href="/about" 
            className="text-[#8d6748] hover:underline text-lg font-medium py-2 text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className="text-[#8d6748] hover:underline text-lg font-medium py-2 text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          
          {/* Mobile Login/User Info */}
          {loading ? (
            <div className="text-[#8d6748] mt-4">Loading...</div>
          ) : user ? (
            <div className="flex flex-col items-center gap-3 mt-4">
              <div className="text-[#8d6748] text-center">
                <div className="text-sm">Logged in as</div>
                <div className="font-semibold">{getUserDisplayName()}</div>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {profile?.role === 'customer' && (
                  <Link 
                    href="/account/customer/cart"
                    className="relative bg-[#588157] hover:bg-[#3a5a40] text-white font-semibold rounded-full px-6 py-3 shadow-lg transition-colors text-center flex items-center justify-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🛒 Cart
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link 
                  href={profile?.role === 'seller' ? '/account/seller' : '/account/customer'}
                  className="bg-[#a3b18a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-6 py-3 shadow-lg transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-full px-6 py-3 shadow-lg transition-colors text-center"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-[#a3b18a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-6 py-3 shadow-lg transition-colors text-center mt-4"
              onClick={() => setIsMenuOpen(false)}
            >
              Log In
            </Link>
          )}
        </nav>
        </div>
      </div>
    </header>
  );
}
