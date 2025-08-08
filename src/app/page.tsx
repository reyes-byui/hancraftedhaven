
'use client'

import MainHeader from "../components/MainHeader";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTopSellers, getTopCrafts, getMarketplaceStats } from "@/lib/supabase";

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
  const [stats, setStats] = useState({
    activeArtisans: 0,
    happyCustomers: 0,
    productsSold: 0
  });

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

      // Load marketplace statistics
      const { data: statsData, error: statsError } = await getMarketplaceStats();
      if (!statsError && statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading top data:', error);
      // Keep default data on error
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f2] via-white to-[#f0ede8] flex flex-col font-sans">
      {/* Header: Logo and Navigation */}
      <MainHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#8d6748] via-[#a3b18a] to-[#bfa76a] text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white opacity-10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white opacity-10 rounded-full animate-pulse delay-500"></div>
        </div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Discover Authentic
            <span className="block text-[#f8f5f2] drop-shadow-lg">Handcrafted Treasures</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with talented artisans and discover unique, handmade creations that tell a story. 
            Support independent creators while finding treasures you&apos;ll cherish forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/listings" 
              className="bg-white text-[#8d6748] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#f8f5f2] transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Shop Now
            </Link>
            <Link 
              href="/sellers" 
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-[#8d6748] transition-all duration-300 transform hover:scale-105"
            >
              Meet Artisans
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center px-4 py-16 gap-20">
        {/* Top Sellers Gallery */}
        <section className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#8d6748] mb-4">Featured Artisans</h2>
            <p className="text-lg text-[#4d5c3a] max-w-2xl mx-auto">
              Meet the talented creators behind our most beloved handcrafted pieces
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-2xl h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topSellers.map((seller, index) => (
                <Link 
                  key={seller.id}
                  href={`/sellers/${seller.id}`}
                  className="group block bg-white rounded-2xl shadow-lg p-8 border-t-4 border-[#a3b18a] hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#a3b18a]/5 to-[#8d6748]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center">
                    <div className="relative mb-6">
                      <Image 
                        src={seller.photo_url || "https://images.unsplash.com/photo-1520207588543-1e545b20c19e?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} 
                        alt={`${seller.first_name} ${seller.last_name}`} 
                        width={120} 
                        height={120} 
                        className="rounded-full object-cover w-[120px] h-[120px] border-4 border-[#a3b18a]" 
                      />
                      <div className="absolute -top-2 -right-2 bg-[#e07a5f] text-white text-xs px-2 py-1 rounded-full font-bold">
                        #{index + 1}
                      </div>
                    </div>
                    <h3 className="font-bold text-[#8d6748] text-xl mb-2 text-center">
                      {seller.business_name || `${seller.first_name} ${seller.last_name}`}
                    </h3>
                    <p className="text-[#4d5c3a] text-sm mb-4 flex items-center gap-1">
                      {seller.country}
                    </p>
                    <div className="bg-gradient-to-r from-[#8d6748] to-[#a3b18a] text-white text-sm font-medium px-4 py-2 rounded-full group-hover:shadow-lg transition-shadow duration-300">
                      View Artisan Profile →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Top Crafts Gallery */}
        <section className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#8d6748] mb-4">Trending Creations</h2>
            <p className="text-lg text-[#4d5c3a] max-w-2xl mx-auto">
              Discover the most popular handcrafted items loved by our community
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-2xl h-80"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {topCrafts.map((craft, index) => (
                <Link
                  key={craft.id}
                  href={`/products/${craft.id}`}
                  className="group block bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-[#e07a5f] hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative">
                    <Image 
                      src={craft.image_url || craftImage} 
                      alt={craft.name} 
                      width={200} 
                      height={200} 
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3 bg-[#e07a5f] text-white text-xs px-2 py-1 rounded-full font-bold">
                      🔥 #{index + 1}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-[#8d6748] text-lg mb-2 line-clamp-2">{craft.name}</h3>
                    <p className="text-[#4d5c3a] text-sm mb-1 flex items-center gap-1">
                      {craft.category}
                    </p>
                    <p className="text-[#4d5c3a] text-xs mb-3 flex items-center gap-1">
                      by {craft.seller_name}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[#e07a5f] text-lg font-bold">
                        ${craft.price.toFixed(2)}
                      </span>
                      <div className="bg-gradient-to-r from-[#e07a5f] to-[#d67357] text-white text-xs px-3 py-1 rounded-full font-medium group-hover:shadow-lg transition-shadow duration-300">
                        View →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Features Highlight Section */}
        <section className="w-full bg-gradient-to-r from-[#a3b18a]/10 via-[#bfa76a]/10 to-[#e07a5f]/10 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#8d6748] mb-4">Why Choose Handcrafted Haven</h2>
              <p className="text-lg text-[#4d5c3a] max-w-2xl mx-auto">
                Experience the difference of authentic craftsmanship and personal connections
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <h3 className="text-xl font-bold text-[#8d6748] mb-4 text-center">100% Authentic</h3>
                <p className="text-[#4d5c3a] text-center leading-relaxed">
                  Every item is genuinely handcrafted by skilled artisans. No mass production, just authentic creativity and traditional techniques.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <h3 className="text-xl font-bold text-[#8d6748] mb-4 text-center">Direct from Makers</h3>
                <p className="text-[#4d5c3a] text-center leading-relaxed">
                  Connect directly with artisans, learn their stories, and support independent creators around the world.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <h3 className="text-xl font-bold text-[#8d6748] mb-4 text-center">Sustainable Choice</h3>
                <p className="text-[#4d5c3a] text-center leading-relaxed">
                  Support ethical practices, sustainable materials, and small businesses that care about our planet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="w-full bg-gradient-to-br from-white to-[#f8f5f2] rounded-3xl shadow-2xl p-12 border-t-8 border-[#bfa76a]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#8d6748] mb-6">About Handcrafted Haven</h2>
              <div className="max-w-4xl mx-auto space-y-6 text-lg text-[#4d5c3a] leading-relaxed">
                <p className="text-xl font-medium text-[#8d6748]">
                  A vibrant virtual marketplace bridging talented artisans with conscious consumers who value authentic craftsmanship.
                </p>
                <p>
                  Discover a diverse collection of unique, handcrafted creations, each telling its own story and reflecting the skill and passion of its maker. Our platform empowers independent artists by providing them with a space to showcase their work, while helping buyers discover meaningful products that support ethical craftsmanship and sustainable practices.
                </p>
                <p>
                  Join us to celebrate creativity, support small businesses, and find one-of-a-kind treasures that enrich your life and community.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[#8d6748]/5 to-[#a3b18a]/5 rounded-2xl p-6 border-l-4 border-[#8d6748]">
                <h3 className="font-bold text-[#8d6748] text-xl mb-3">Our Mission</h3>
                <p className="text-[#4d5c3a] leading-relaxed">
                  Foster a thriving community where artisans can share their craft, connect with passionate collectors, and promote ethical, sustainable artistry.
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#a3b18a]/5 to-[#bfa76a]/5 rounded-2xl p-6 border-l-4 border-[#a3b18a]">
                <h3 className="font-bold text-[#8d6748] text-xl mb-3">Our Vision</h3>
                <p className="text-[#4d5c3a] leading-relaxed">
                  Become the leading online destination for handcrafted goods, inspiring a global movement that values artistry, authenticity, and sustainability.
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#bfa76a]/5 to-[#e07a5f]/5 rounded-2xl p-6 border-l-4 border-[#e07a5f]">
                <h3 className="font-bold text-[#8d6748] text-xl mb-3">Why Choose Us</h3>
                <ul className="text-[#4d5c3a] space-y-2 leading-relaxed">
                  <li>Authenticity Guaranteed</li>
                  <li>Support Independent Artists</li>
                  <li>Ethical & Sustainable</li>
                  <li>Curated Selection</li>
                  <li>Community Focused</li>
                  <li>Secure Shopping</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link 
                href="/about" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8d6748] to-[#a3b18a] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="w-full bg-gradient-to-r from-[#8d6748]/5 via-[#a3b18a]/5 to-[#bfa76a]/5 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#8d6748] mb-4">What Our Community Says</h2>
              <p className="text-lg text-[#4d5c3a] max-w-2xl mx-auto">
                Hear from our amazing customers and artisans who make our marketplace special
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8d6748] to-[#a3b18a] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    S
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-[#8d6748]">Sarah M.</h4>
                    <p className="text-sm text-[#4d5c3a]">Art Collector</p>
                  </div>
                  <div className="ml-auto text-yellow-500 text-xl">⭐⭐⭐⭐⭐</div>
                </div>
                <p className="text-[#4d5c3a] italic leading-relaxed">
                  &quot;The quality of handcrafted items here is exceptional! I love supporting independent artists and the stories behind each piece make them even more special.&quot;
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#a3b18a] to-[#bfa76a] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    M
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-[#8d6748]">Maria V.</h4>
                    <p className="text-sm text-[#4d5c3a]">Ceramic Artist</p>
                  </div>
                  <div className="ml-auto text-yellow-500 text-xl">⭐⭐⭐⭐⭐</div>
                </div>
                <p className="text-[#4d5c3a] italic leading-relaxed">
                  &quot;As an artisan, this platform has transformed my business. The community is supportive and customers truly appreciate handcrafted work!&quot;
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#bfa76a] to-[#e07a5f] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    J
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-[#8d6748]">James K.</h4>
                    <p className="text-sm text-[#4d5c3a]">Gift Buyer</p>
                  </div>
                  <div className="ml-auto text-yellow-500 text-xl">⭐⭐⭐⭐⭐</div>
                </div>
                <p className="text-[#4d5c3a] italic leading-relaxed">
                  &quot;Perfect for unique gifts! Every purchase feels meaningful knowing I&apos;m supporting real artisans. The shipping is fast and packaging beautiful too.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full bg-gradient-to-br from-[#8d6748] via-[#a3b18a] to-[#bfa76a] py-16 px-4 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Start Your Journey Today</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Whether you&apos;re an artisan ready to share your craft or a collector seeking unique treasures, 
              your perfect match awaits at Handcrafted Haven.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/products" 
                className="bg-white text-[#8d6748] px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:bg-[#f8f5f2] flex items-center gap-2"
              >
                Shop Now
              </Link>
              <Link 
                href="/become-seller" 
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#8d6748] transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                Become a Seller
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold mb-2">{stats.activeArtisans}+</div>
                <div className="text-sm opacity-80">Active Artisans</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold mb-2">{stats.happyCustomers}+</div>
                <div className="text-sm opacity-80">Happy Customers</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold mb-2">{stats.productsSold}+</div>
                <div className="text-sm opacity-80">Products Sold</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
