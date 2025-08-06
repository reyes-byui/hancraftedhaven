"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import MainHeader from "../../components/MainHeader";
import { getAllSellers, type SellerDisplay } from "@/lib/supabase";

type SortOption = 'business_name_asc' | 'business_name_desc' | 'name_asc' | 'name_desc' | 'country_asc' | 'country_desc';

export default function SellersPage() {
  const [sellers, setSellers] = useState<SellerDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>('business_name_asc');

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    setLoading(true);
    const { data, error } = await getAllSellers();
    
    if (error) {
      setError(error);
    } else {
      setSellers(data);
    }
    setLoading(false);
  };

  const sortSellers = (sellers: SellerDisplay[], option: SortOption): SellerDisplay[] => {
    const sorted = [...sellers];
    
    switch (option) {
      case 'business_name_asc':
        return sorted.sort((a, b) => a.business_name.localeCompare(b.business_name));
      case 'business_name_desc':
        return sorted.sort((a, b) => b.business_name.localeCompare(a.business_name));
      case 'name_asc':
        return sorted.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
      case 'name_desc':
        return sorted.sort((a, b) => `${b.first_name} ${b.last_name}`.localeCompare(`${a.first_name} ${a.last_name}`));
      case 'country_asc':
        return sorted.sort((a, b) => a.country.localeCompare(b.country));
      case 'country_desc':
        return sorted.sort((a, b) => b.country.localeCompare(a.country));
      default:
        return sorted;
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const sortedSellers = sortSellers(sellers, sortOption);

  return (
    <div className="min-h-screen bg-[#f8f5f2] flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-[#8d6748] font-bold mb-4">Meet Our Sellers</h1>
          <p className="text-[#4d5c3a] text-lg mb-6">
            Discover talented artisans and craftspeople from around the world. Each seller brings unique skills 
            and passion to create beautiful handcrafted items just for you.
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#4d5c3a] font-medium">Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="border border-[#bfa76a] rounded-lg px-3 py-2 bg-white text-[#4d5c3a] focus:outline-none focus:ring-2 focus:ring-[#bfa76a]"
            >
              <option value="business_name_asc">Business Name (A-Z)</option>
              <option value="business_name_desc">Business Name (Z-A)</option>
              <option value="name_asc">Owner Name (A-Z)</option>
              <option value="name_desc">Owner Name (Z-A)</option>
              <option value="country_asc">Country (A-Z)</option>
              <option value="country_desc">Country (Z-A)</option>
            </select>
          </div>
          
          <div className="text-[#4d5c3a] text-sm">
            {sortedSellers.length} seller{sortedSellers.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-[#8d6748] text-xl">Loading sellers...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error loading sellers: {error}
          </div>
        )}

        {/* Sellers Grid */}
        {!loading && !error && (
          <>
            {sortedSellers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-[#8d6748] text-xl mb-4">No sellers found</div>
                <p className="text-[#4d5c3a] mb-6">Be the first to join our community of talented artisans!</p>
                <Link 
                  href="/register/seller"
                  className="bg-[#bfa76a] hover:bg-[#8d6748] text-white font-semibold px-6 py-3 rounded-full transition-colors"
                >
                  Become a Seller
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedSellers.map((seller) => (
                  <Link 
                    key={seller.id} 
                    href={`/sellers/${seller.id}`}
                    className="block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    {/* Seller Photo */}
                    <div className="h-48 bg-gradient-to-br from-[#e7d7c1] to-[#bfa76a] flex items-center justify-center">
                      {seller.photo_url ? (
                        <Image 
                          src={seller.photo_url} 
                          alt={`${seller.first_name} ${seller.last_name}`}
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                          <span className="text-[#8d6748] font-bold text-2xl">
                            {seller.first_name.charAt(0)}{seller.last_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Seller Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-serif text-[#8d6748] font-bold mb-2">
                        {seller.business_name}
                      </h3>
                      <p className="text-[#4d5c3a] font-medium mb-2">
                        {seller.first_name} {seller.last_name}
                      </p>
                      <p className="text-[#4d5c3a] text-sm mb-3 flex items-center">
                        <span className="inline-block w-4 h-4 mr-2">🌍</span>
                        {seller.country}
                      </p>
                      <p className="text-[#4d5c3a] text-sm mb-4 line-clamp-3">
                        {seller.business_description}
                      </p>
                      
                      {/* Click indicator */}
                      <div className="text-center">
                        <span className="text-[#8d6748] text-sm font-medium hover:underline">
                          View Profile →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        {!loading && !error && sortedSellers.length > 0 && (
          <div className="mt-12 text-center bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-serif text-[#8d6748] font-bold mb-4">
              Ready to Start Your Craft Business?
            </h2>
            <p className="text-[#4d5c3a] mb-6">
              Join our community of talented artisans and share your unique creations with the world.
            </p>
            <Link 
              href="/register/seller"
              className="bg-[#bfa76a] hover:bg-[#8d6748] text-white font-semibold px-8 py-3 rounded-full transition-colors"
            >
              Become a Seller
            </Link>
          </div>
        )}
      </main>
      
      <footer className="w-full bg-[#e7d7c1] py-6 flex flex-col items-center text-[#8d6748] text-sm mt-auto">
        <span>&copy; {new Date().getFullYear()} Handcrafted Haven. All rights reserved.</span>
        <nav className="flex gap-4 mt-2">
          <Link href="/" className="hover:underline focus:underline">Home</Link>
          <Link href="/sellers" className="hover:underline focus:underline">Sellers</Link>
          <Link href="/listings" className="hover:underline focus:underline">Listings</Link>
          <Link href="/about" className="hover:underline focus:underline">About</Link>
          <Link href="/contact" className="hover:underline focus:underline">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
