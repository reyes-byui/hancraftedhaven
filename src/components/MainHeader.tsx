"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentUserWithProfile, signOut } from "@/lib/supabase";

export default function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { user, profile } = await getCurrentUserWithProfile();
      setUser(user);
      setProfile(profile);
      setLoading(false);
    }
    checkUser();
  }, []);

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
    <header className="w-full bg-white shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 sm:px-8 py-4 sm:py-6 gap-4 md:gap-0">
        {/* Logo - Mobile: Top Center, Desktop: Left */}
        <div className="flex justify-center md:justify-start">
          <Image src="/logo.png" alt="Handcrafted Haven Logo" width={64} height={64} className="sm:w-24 sm:h-24" />
        </div>

        {/* Title - Mobile: Center, Desktop: With Logo */}
        <div className="flex justify-center md:justify-start md:-ml-16">
          <span className="text-xl sm:text-3xl font-serif font-bold text-[#8d6748]">Handcrafted Haven</span>
        </div>

        {/* Mobile: Hamburger Button Center, Desktop: Navigation + Login */}
        <div className="flex justify-center md:justify-end items-center gap-6">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 text-lg font-medium">
            <Link href="/" className="text-[#8d6748] hover:underline">Home</Link>
            <Link href="/sellers" className="text-[#8d6748] hover:underline">Sellers</Link>
            <Link href="/listings" className="text-[#8d6748] hover:underline">Listings</Link>
            <Link href="/about" className="text-[#8d6748] hover:underline">About</Link>
            <Link href="/contact" className="text-[#8d6748] hover:underline">Contact</Link>
          </nav>

          {/* Desktop Login/User Info */}
          <div className="hidden md:block">
            {loading ? (
              <div className="text-[#8d6748]">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="text-[#8d6748]">
                  <span className="text-sm">Logged in as</span>
                  <br />
                  <span className="font-semibold">{getUserDisplayName()}</span>
                </div>
                <div className="flex gap-2">
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

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
            aria-label="Toggle menu"
          >
            <span className={`w-6 h-0.5 bg-[#8d6748] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[#8d6748] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-6 h-0.5 bg-[#8d6748] transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white border-t border-gray-200 transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <nav className="flex flex-col items-center px-4 py-4 space-y-4">
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
    </header>
  );
}
