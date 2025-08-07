'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';
import { getCurrentUserWithProfile, getSellerProfile, getProductsBySellerId, type SellerProfile, type Product } from '@/lib/supabase';

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sellerId) {
      loadSellerData();
      loadCurrentUser();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  const loadCurrentUser = async () => {
    const { user } = await getCurrentUserWithProfile();
    setCurrentUser(user);
  };

  const loadSellerData = async () => {
    try {
      setLoading(true);
      
      // Load seller profile
      const { data: sellerData, error: sellerError } = await getSellerProfile(sellerId);
      if (sellerError) {
        setError(sellerError);
        return;
      }
      setSeller(sellerData);

      // Load seller's products
      const { data: productsData, error: productsError } = await getProductsBySellerId(sellerId);
      if (productsError) {
        console.error('Error loading products:', productsError);
        setProducts([]);
      } else {
        setProducts(productsData || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddToCart = (_productId: string) => {
    if (!currentUser) {
      router.push('/login/customer');
      return;
    }
    // Add to cart logic would go here
    alert('Add to cart functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <MainHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8d6748] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading seller profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <MainHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Seller Not Found</h1>
            <p className="text-gray-600 mb-4">The seller you&apos;re looking for doesn&apos;t exist.</p>
            <button 
              onClick={() => router.back()} 
              className="bg-[#8d6748] text-white px-6 py-2 rounded-lg hover:bg-[#6b4d35] transition-colors"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MainHeader />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {/* Seller Profile Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-t-4 border-[#a3b18a]">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Image
              src={seller.photo_url || "https://images.unsplash.com/photo-1520207588543-1e545b20c19e?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
              alt={`${seller.first_name} ${seller.last_name}`}
              width={150}
              height={150}
              className="rounded-full object-cover w-[150px] h-[150px]"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-serif font-bold text-[#8d6748] mb-2">
                {seller.business_name || `${seller.first_name} ${seller.last_name}`}
              </h1>
              <p className="text-lg text-[#4d5c3a] mb-1">
                {seller.first_name} {seller.last_name}
              </p>
              <p className="text-[#4d5c3a] mb-4">📍 {seller.country}</p>
              
              {seller.business_description && (
                <div className="mb-4">
                  <h3 className="font-bold text-[#8d6748] mb-2">About</h3>
                  <p className="text-[#4d5c3a] text-sm leading-relaxed">
                    {seller.business_description}
                  </p>
                </div>
              )}
              
              {seller.business_address && (
                <div className="mb-4">
                  <h3 className="font-bold text-[#8d6748] mb-2">Business Location</h3>
                  <p className="text-[#4d5c3a] text-sm">
                    {seller.business_address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#e07a5f]">
          <h2 className="text-2xl font-serif font-bold text-[#8d6748] mb-6">
            Products ({products.length})
          </h2>
          
          {products.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              This seller hasn&apos;t listed any products yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <Image
                    src={product.image_url || "https://images.unsplash.com/photo-1661185152130-4214a30ced36?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-[200px] object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-bold text-[#8d6748] mb-1">{product.name}</h3>
                  <p className="text-sm text-[#4d5c3a] mb-2">{product.category}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-[#e07a5f]">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                      <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        Only {product.stock_quantity} left
                      </span>
                    )}
                  </div>
                  
                  {product.stock_quantity === 0 ? (
                    <button 
                      disabled
                      className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg text-sm cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="w-full bg-[#8d6748] text-white py-2 px-4 rounded-lg text-sm hover:bg-[#6b4d35] transition-colors"
                    >
                      {currentUser ? 'Add to Cart' : 'Log in to Buy'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
