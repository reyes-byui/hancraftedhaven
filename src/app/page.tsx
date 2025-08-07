
'use client'

import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTopSellers, getTopCrafts } from "@/lib/supabase";

// Fallback data in case of no real data
const defaultSellers = [
  {
    id: "default-1",
    first_name: "Artisan",
    last_name: "Alice",
    country: "USA",
    photo_url: "https://images.unsplash.com/photo-1520207588543-1e545b20c19e?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    business_name: "Alice's Art",
    total_revenue: 0
  },
  {
    id: "default-2", 
    first_name: "Craftsman",
    last_name: "Bob",
    country: "UK",
    photo_url: "https://images.unsplash.com/photo-1521799022345-481a897e45ca?q=80&w=929&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    business_name: "Bob's Workshop",
    total_revenue: 0
  },
  {
    id: "default-3",
    first_name: "Maker",
    last_name: "Mia", 
    country: "Canada",
    photo_url: "https://images.unsplash.com/photo-1719154717749-0d05f61a0588?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    business_name: "Mia's Creations",
    total_revenue: 0
  }
];

const craftImage = "https://images.unsplash.com/photo-1661185152130-4214a30ced36?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const defaultCrafts = [
  { id: "default-1", name: "Hand-thrown Vase", category: "Ceramics", seller_name: "Artisan Alice", seller_country: "USA", image_url: craftImage, price: 25.00, total_sold: 0 },
  { id: "default-2", name: "Woven Scarf", category: "Textiles", seller_name: "Maker Mia", seller_country: "Canada", image_url: craftImage, price: 35.00, total_sold: 0 },
  { id: "default-3", name: "Wooden Bowl", category: "Woodworking", seller_name: "Craftsman Bob", seller_country: "UK", image_url: craftImage, price: 45.00, total_sold: 0 },
  { id: "default-4", name: "Silver Pendant", category: "Jewelry", seller_name: "Artisan Alice", seller_country: "USA", image_url: craftImage, price: 55.00, total_sold: 0 },
  { id: "default-5", name: "Stained Glass Panel", category: "Glasswork", seller_name: "Maker Mia", seller_country: "Canada", image_url: craftImage, price: 85.00, total_sold: 0 },
];

export default function Home() {
  const [topSellers, setTopSellers] = useState(defaultSellers);
  const [topCrafts, setTopCrafts] = useState(defaultCrafts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopData();
  }, []);

  const loadTopData = async () => {
    try {
      // Load top sellers
      const { data: sellersData, error: sellersError } = await getTopSellers(3);
      if (!sellersError && sellersData && sellersData.length > 0) {
        setTopSellers(sellersData);
      }

      // Load top crafts
      const { data: craftsData, error: craftsError } = await getTopCrafts(5);
      if (!craftsError && craftsData && craftsData.length > 0) {
        setTopCrafts(craftsData);
      }
    } catch (error) {
      console.error('Error loading top data:', error);
      // Keep default data on error
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header: Logo and Navigation */}
      <MainHeader />

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center px-4 py-12 gap-12">
        {/* Top Sellers Gallery */}
        <section className="max-w-4xl w-full mb-8">
          <h2 className="text-3xl font-serif font-bold text-[#8d6748] mb-8 text-center">Top Sellers</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-48"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topSellers.map((seller) => (
                <Link 
                  key={seller.id}
                  href={`/sellers/${seller.id}`}
                  className="block bg-white rounded-xl shadow p-6 border-t-4 border-[#a3b18a] hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <Image 
                      src={seller.photo_url || "https://images.unsplash.com/photo-1520207588543-1e545b20c19e?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} 
                      alt={`${seller.first_name} ${seller.last_name}`} 
                      width={120} 
                      height={120} 
                      className="mb-4 rounded-full object-cover w-[120px] h-[120px]" 
                    />
                    <span className="font-bold text-[#8d6748]">
                      {seller.business_name || `${seller.first_name} ${seller.last_name}`}
                    </span>
                    <span className="text-[#4d5c3a] text-sm">{seller.country}</span>
                    <span className="mt-3 text-[#8d6748] text-sm font-medium hover:underline">
                      View Profile →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Top Crafts Gallery */}
        <section className="max-w-4xl w-full">
          <h2 className="text-3xl font-serif font-bold text-[#8d6748] mb-8 text-center">Top Crafts</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {topCrafts.map((craft) => (
                <Link
                  key={craft.id}
                  href={`/products/${craft.id}`}
                  className="block bg-white rounded-xl shadow p-6 border-t-4 border-[#e07a5f] hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col items-start">
                    <Image 
                      src={craft.image_url || craftImage} 
                      alt={craft.name} 
                      width={160} 
                      height={160} 
                      className="mb-4 rounded-lg object-cover w-full h-[160px]" 
                    />
                    <span className="font-bold text-[#8d6748] text-left">{craft.name}</span>
                    <span className="text-[#4d5c3a] text-sm text-left">{craft.category}</span>
                    <span className="text-[#4d5c3a] text-xs text-left">by {craft.seller_name}</span>
                    <div className="mt-2 flex justify-between items-center w-full">
                      <span className="text-[#e07a5f] text-sm font-semibold">
                        ${craft.price.toFixed(2)}
                      </span>
                    </div>
                    <span className="mt-3 text-[#e07a5f] text-sm font-medium hover:underline self-center">
                      View Details →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* About Section (Full Width, Below Top Crafts) */}
        <section className="w-full bg-white rounded-xl shadow p-8 mt-12 border-t-4 border-[#bfa76a]">
          <h2 className="text-3xl font-serif font-bold text-[#8d6748] mb-6 text-center">About Handcrafted Haven</h2>
          <div className="max-w-5xl mx-auto">
            <p className="text-[#4d5c3a] text-lg mb-2">Handcrafted Haven is a vibrant virtual marketplace designed to bridge the gap between talented artisans and conscious consumers.</p>
            <p className="text-[#4d5c3a] mb-2">Here, you can explore a diverse collection of unique, handcrafted creations, each telling its own story and reflecting the skill and passion of its maker. Our platform empowers independent artists by providing them with a space to showcase their work, while helping buyers discover meaningful products that support ethical craftsmanship and sustainable practices.</p>
            <p className="text-[#4d5c3a] mb-2">Join us to celebrate creativity, support small businesses, and find one-of-a-kind treasures that enrich your life and community.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-[#8d6748] mb-2">Mission</h3>
                <p className="text-[#4d5c3a] text-sm">Our mission is to foster a thriving community where artisans can share their craft, connect with passionate collectors, and promote ethical, sustainable artistry.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#8d6748] mb-2">Vision</h3>
                <p className="text-[#4d5c3a] text-sm">Our vision is to become the leading online destination for handcrafted goods, inspiring a global movement that values artistry, authenticity, and sustainability.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#8d6748] mb-2">Why Choose Us</h3>
                <ul className="list-disc ml-4 text-[#4d5c3a] text-sm">
                  <li>Authenticity Guaranteed</li>
                  <li>Support Independent Artists</li>
                  <li>Ethical & Sustainable</li>
                  <li>Curated Selection</li>
                  <li>Community Focused</li>
                  <li>Secure & Seamless Shopping</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
