'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MainHeader from '@/components/MainHeader';
import Footer from '@/components/Footer';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductInquiryModal from '@/components/ProductInquiryModal';
import MessageSellerButton from '@/components/MessageSellerButton';
import ProductReviews from '@/components/ProductReviews';
import { getCurrentUserWithProfile, getSellerProfile, addToCart, getProductWithImages, type SellerProfile, type ProductWithImages } from '@/lib/supabase';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProductData();
      loadCurrentUser();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const loadCurrentUser = async () => {
    const { user } = await getCurrentUserWithProfile();
    setCurrentUser(user);
  };

  const loadProductData = async () => {
    try {
      setLoading(true);
      
      // Load product details with images
      console.log('Loading product with images for ID:', productId);
      const { data: productData, error: productError } = await getProductWithImages(productId);
      if (productError) {
        console.error('Product error:', productError);
        setError(productError);
        return;
      }
      console.log('Product data loaded:', productData);
      console.log('Product images:', productData?.images);
      setProduct(productData);

      // Load seller info
      if (productData?.seller_id) {
        const { data: sellerData, error: sellerError } = await getSellerProfile(productData.seller_id);
        if (!sellerError) {
          setSeller(sellerData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      router.push('/login/customer');
      return;
    }

    try {
      setAddingToCart(true);
      const { error } = await addToCart(productId, 1);
      if (error) {
        alert(`Error adding to cart: ${error}`);
      } else {
        alert('Product added to cart successfully!');
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <MainHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8d6748] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <MainHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images Gallery */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#e07a5f]">
            {(() => {
              console.log('Checking product images:', product.images);
              console.log('Images array length:', product.images?.length);
              return product.images && product.images.length > 0;
            })() ? (
              <ProductImageGallery 
                images={product.images} 
                productName={product.name}
                className="w-full"
              />
            ) : (
              /* Fallback to single image if database not set up */
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.image_url || "https://images.unsplash.com/photo-1661185152130-4214a30ced36?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#a3b18a]">
            <h1 className="text-3xl font-serif font-bold text-[#8d6748] mb-4">
              {product.name}
            </h1>
            
            <div className="mb-4">
              <span className="text-sm text-[#4d5c3a] bg-gray-100 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            <div className="text-3xl font-bold text-[#e07a5f] mb-4">
              ${product.price.toFixed(2)}
            </div>

            {/* Stock Information */}
            <div className="mb-6">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                product.stock_quantity === 0 
                  ? 'bg-red-100 text-red-800' 
                  : product.stock_quantity <= 5 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {product.stock_quantity === 0 
                  ? '❌ Out of stock'
                  : product.stock_quantity <= 5
                  ? `⚠️ Only ${product.stock_quantity} left in stock`
                  : `✅ ${product.stock_quantity} available`
                }
              </div>
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="font-bold text-[#8d6748] mb-2">Description</h3>
                <p className="text-[#4d5c3a] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#4d5c3a]">Availability:</span>
                <span className={`font-semibold ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </span>
              </div>
              {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  ⚠️ Only {product.stock_quantity} left in stock!
                </div>
              )}
            </div>

            {/* Seller Info */}
            {seller && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-[#8d6748] mb-2">Sold by</h3>
                <Link href={`/sellers/${seller.id}`} className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded transition-colors">
                  <Image
                    src={seller.photo_url || "https://images.unsplash.com/photo-1520207588543-1e545b20c19e?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                    alt={`${seller.first_name} ${seller.last_name}`}
                    width={50}
                    height={50}
                    className="rounded-full object-cover w-[50px] h-[50px]"
                  />
                  <div>
                    <div className="font-semibold text-[#8d6748]">
                      {seller.business_name || `${seller.first_name} ${seller.last_name}`}
                    </div>
                    <div className="text-sm text-[#4d5c3a]">{seller.country}</div>
                  </div>
                </Link>
              </div>
            )}

            {/* Add to Cart and Inquiry Buttons */}
            <div className="space-y-3">
              {product.stock_quantity === 0 ? (
                <button 
                  disabled
                  className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg text-lg font-semibold cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-[#8d6748] text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-[#6b4d35] transition-colors disabled:opacity-50"
                >
                  {addingToCart ? 'Adding to Cart...' : currentUser ? 'Add to Cart' : 'Log in to Buy'}
                </button>
              )}

              {/* Modern Messaging Button - Available to all logged-in users */}
              {currentUser && seller && (
                <MessageSellerButton
                  sellerId={seller.id}
                  productId={product.id}
                  productName={product.name}
                  className="w-full"
                />
              )}

              {/* Legacy Send Inquiry Button - Keep for users who haven't run messaging setup */}
              {currentUser && currentUser.role === 'customer' && !seller && (
                <button
                  onClick={() => setShowInquiryModal(true)}
                  className="w-full bg-[#4d5c3a] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#3d4a2e] transition-colors"
                >
                  📧 Send Inquiry About This Item
                </button>
              )}
              
              {/* Database setup reminder */}
              {!product.images && (
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Setup Required:</strong> Run the SQL scripts to enable multiple images, inquiries, and messaging!
                    <br />
                    Check <code className="bg-blue-100 px-1 rounded">docs/COMPLETE_MESSAGING_SYSTEM_GUIDE.md</code>
                  </p>
                </div>
              )}
              
              <Link 
                href="/listings" 
                className="block w-full text-center bg-gray-200 text-[#8d6748] py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        {product && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProductReviews productId={product.id} />
          </div>
        )}

        {/* Product Inquiry Modal */}
        {showInquiryModal && currentUser && seller && product && (
          <ProductInquiryModal
            isOpen={showInquiryModal}
            onClose={() => setShowInquiryModal(false)}
            productId={product.id}
            sellerId={product.seller_id}
            productName={product.name}
            customerName={`${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim()}
            customerEmail={currentUser.email || ''}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
