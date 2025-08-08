'use client';

import MainHeader from "../../components/MainHeader";
import Footer from "../../components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { getAllProducts, type Product } from '@/lib/supabase';

export default function AboutPage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load products from the existing function
  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const { data, error } = await getAllProducts();
        if (error) {
          console.error('Error loading products:', error);
          setFeaturedProducts([]);
        } else {
          // Take first 6 products for the carousel, or create demo products if none exist
          const products = data && data.length > 0 ? data.slice(0, 6) : createDemoProducts();
          setFeaturedProducts(products);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    }

    // Create demo products for display when no real products exist
    function createDemoProducts(): Product[] {
      return [
        {
          id: 'demo-1',
          name: 'Handwoven Ceramic Bowl',
          description: 'Beautiful handcrafted ceramic bowl with intricate patterns and earthy tones.',
          category: 'Ceramics',
          price: 45.00,
          discounted_price: undefined,
          stock_quantity: 10,
          image_url: '',
          seller_id: 'demo-seller',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          discount_percentage: 0
        },
        {
          id: 'demo-2',
          name: 'Wooden Sculpture',
          description: 'Elegant wooden sculpture carved from sustainable oak with smooth finish.',
          category: 'Woodwork',
          price: 120.00,
          discounted_price: 95.00,
          stock_quantity: 3,
          image_url: '',
          seller_id: 'demo-seller',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          discount_percentage: 21
        },
        {
          id: 'demo-3',
          name: 'Textile Art Piece',
          description: 'Vibrant textile art showcasing traditional weaving techniques with modern design.',
          category: 'Textiles',
          price: 85.00,
          discounted_price: undefined,
          stock_quantity: 7,
          image_url: '',
          seller_id: 'demo-seller',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          discount_percentage: 0
        }
      ];
    }

    loadFeaturedProducts();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const formatPrice = (product: Product) => {
    const finalPrice = product.discounted_price || product.price;
    
    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg font-bold text-[#8d6748]">
          ${finalPrice.toFixed(2)}
        </span>
        {product.discounted_price && (
          <span className="text-sm text-gray-500 line-through">
            ${product.price.toFixed(2)}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 py-8 px-4 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#8d6748] mb-6">About Handcrafted Haven</h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            Handcrafted Haven is a vibrant virtual marketplace designed to bridge the gap between talented artisans and conscious consumers.
          </p>
        </div>

        {/* Community Section */}
        <div className="bg-[#f5f1eb] p-8 rounded-lg mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#8d6748] mb-4">
            "Join The Community Of Famous Collectors and Artisans!"
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Here, you can explore a diverse collection of unique, handcrafted creations, each telling its own story and reflecting the skill and passion of its maker. Our platform empowers independent artists by providing them with a space to showcase their work, while helping buyers discover meaningful products that support ethical craftsmanship and sustainable practices. Join us to celebrate creativity, support small businesses, and find one-of-a-kind treasures that enrich your life and community.
          </p>
        </div>

        {/* Featured Products Carousel */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-[#8d6748] mb-6 text-center">Discover Amazing Creations</h3>
          
          {loading ? (
            <div className="bg-gradient-to-r from-[#f5f1eb] to-[#e8ddd4] p-12 rounded-lg text-center">
              <p className="text-gray-600 italic">Loading featured works...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="bg-gradient-to-r from-[#f5f1eb] to-[#e8ddd4] p-12 rounded-lg text-center">
              <p className="text-gray-600 italic">No featured works available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="relative bg-gradient-to-r from-[#f5f1eb] to-[#e8ddd4] rounded-lg overflow-hidden">
              {/* Carousel Container */}
              <div className="relative h-96 overflow-hidden">
                {featuredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                      index === currentSlide ? 'translate-x-0' : 
                      index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                    }`}
                  >
                    <div className="flex h-full">
                      {/* Image Section */}
                      <div className="flex-1 relative">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            onError={() => {
                              console.log('Image failed to load:', product.image_url);
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#f5f1eb] to-[#e8ddd4]">
                            <div className="text-center text-[#8d6748]">
                              <div className="text-6xl mb-2">🎨</div>
                              <div className="font-medium">Handcrafted Artwork</div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      </div>
                      {/* Content Section */}
                      <div className="flex-1 p-8 flex flex-col justify-between bg-white">
                        <div>
                          <h4 className="text-2xl font-bold text-[#8d6748] mb-2">
                            {product.name}
                          </h4>
                          <p className="text-lg text-gray-600 mb-3">
                            {product.category}
                          </p>
                          {product.description && (
                            <p className="text-gray-700 leading-relaxed text-sm mb-4">
                              {product.description.length > 120 
                                ? product.description.substring(0, 120) + '...'
                                : product.description
                              }
                            </p>
                          )}
                          {formatPrice(product)}
                        </div>
                        <div className="mt-4">
                          <Link 
                            href={`/products/${product.id}`}
                            className="bg-[#8d6748] text-white px-6 py-3 rounded-lg hover:bg-[#6b4d35] transition-colors inline-block text-sm font-semibold"
                          >
                            View Product
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-[#8d6748] p-2 rounded-full shadow-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-[#8d6748] p-2 rounded-full shadow-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {featuredProducts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide ? 'bg-[#8d6748]' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border-2 border-[#8d6748] p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-[#8d6748] mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              Our mission is to foster a thriving community where artisans can share their craft, connect with passionate collectors, and promote ethical, sustainable artistry. We strive to make handmade goods accessible to everyone, supporting creativity, fair trade, and positive social impact.
            </p>
          </div>
          <div className="bg-white border-2 border-[#8d6748] p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-[#8d6748] mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              Our vision is to become the leading online destination for handcrafted goods, inspiring a global movement that values artistry, authenticity, and sustainability. We aim to nurture a supportive ecosystem where creativity flourishes, artisans thrive, and every purchase makes a positive difference in the world.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-[#8d6748] mb-8 text-center">Why Choose Handcrafted Haven</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#f5f1eb] p-6 rounded-lg">
              <h4 className="text-xl font-bold text-[#8d6748] mb-3">Authenticity Guaranteed</h4>
              <p className="text-gray-700">Every item is handcrafted by skilled artisans, ensuring genuine quality and originality.</p>
            </div>
            <div className="bg-[#f5f1eb] p-6 rounded-lg">
              <h4 className="text-xl font-bold text-[#8d6748] mb-3">Support Independent Artists</h4>
              <p className="text-gray-700">Your purchases directly empower small businesses and creative entrepreneurs.</p>
            </div>
            <div className="bg-[#f5f1eb] p-6 rounded-lg">
              <h4 className="text-xl font-bold text-[#8d6748] mb-3">Ethical & Sustainable</h4>
              <p className="text-gray-700">We prioritize fair trade and eco-friendly practices, making every purchase a responsible choice.</p>
            </div>
            <div className="bg-[#f5f1eb] p-6 rounded-lg">
              <h4 className="text-xl font-bold text-[#8d6748] mb-3">Curated Selection</h4>
              <p className="text-gray-700">Discover exclusive, one-of-a-kind pieces you won't find anywhere else.</p>
            </div>
            <div className="bg-[#f5f1eb] p-6 rounded-lg">
              <h4 className="text-xl font-bold text-[#8d6748] mb-3">Community Focused</h4>
              <p className="text-gray-700">Join a passionate community of collectors and makers who value creativity and connection.</p>
            </div>
            <div className="bg-[#f5f1eb] p-6 rounded-lg">
              <h4 className="text-xl font-bold text-[#8d6748] mb-3">Secure & Seamless Shopping</h4>
              <p className="text-gray-700">Enjoy a safe, user-friendly experience from browsing to checkout.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#8d6748] to-[#6b4d35] text-white p-8 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
          <p className="mb-6">Explore our marketplace and discover the perfect handcrafted treasures waiting for you.</p>
          <div className="space-x-4">
            <a 
              href="/listings" 
              className="bg-white text-[#8d6748] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Browse Products
            </a>
            <a 
              href="/sellers" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#8d6748] transition-colors inline-block"
            >
              Meet Our Artists
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
