"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getCurrentUserWithProfile, 
  getCustomerFavorites, 
  removeFromFavorites,
  createOrder,
  type FavoriteWithProduct,
  type CreateOrderData
} from "@/lib/supabase";

export default function FavoritesPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; address?: string } | null>(null);
  const [favorites, setFavorites] = useState<FavoriteWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FavoriteWithProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUserAndFavorites();
  }, []);

  const loadUserAndFavorites = async () => {
    const { user, profile, error } = await getCurrentUserWithProfile();
    if (error || !user) {
      router.push("/login/customer");
      return;
    }

    setUser(user);
    setProfile(profile);

    // Load favorites
    const { data: favoritesData, error: favoritesError } = await getCustomerFavorites();
    if (favoritesError) {
      console.error('Error loading favorites:', favoritesError);
    } else {
      setFavorites(favoritesData);
    }

    setLoading(false);
  };

  const handleRemoveFavorite = async (favoriteId: string, productId: string) => {
    try {
      await removeFromFavorites(productId);
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleBuyClick = (favorite: FavoriteWithProduct) => {
    setSelectedProduct(favorite);
    setQuantity(1);
    setShowBuyModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedProduct || !user || !profile?.address) {
      return;
    }

    setOrderLoading(true);
    
    try {
      const product = selectedProduct.product;
      const finalPrice = product.discounted_price || product.price;
      const subtotal = finalPrice * quantity;
      
      const orderData: CreateOrderData = {
        total_amount: subtotal,
        shipping_address: profile.address,
        payment_method: 'card',
        notes: `Order for ${quantity}x ${product.name}`,
        items: [{
          product_id: product.id,
          seller_id: product.seller_id,
          product_name: product.name,
          product_price: finalPrice,
          quantity: quantity,
          subtotal: subtotal
        }]
      };

      const { data, error } = await createOrder(orderData);
      
      if (error) {
        alert('Error creating order: ' + error);
      } else {
        alert('Order placed successfully! Check your order history for details.');
        setShowBuyModal(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const formatPrice = (product: any) => {
    const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
    const finalPrice = product.discounted_price || product.price;

    return (
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-[#8d6748]">
          ${finalPrice.toFixed(2)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-sm text-gray-500 line-through">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
              -{product.discount_percentage}%
            </span>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2]">
        <div className="text-[#8d6748] text-xl">Loading favorites...</div>
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
              <Link href="/account/customer" className="text-[#8d6748] hover:underline">
                Dashboard
              </Link>
              <span className="text-[#4d5c3a]">
                {profile?.first_name ? `${profile.first_name}` : user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif text-[#8d6748] font-bold">My Favorites</h1>
            <Link 
              href="/account/customer"
              className="text-[#8d6748] hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-xl mb-4">No favorites yet</div>
              <p className="text-gray-400 mb-6">Save products you love to easily find them later.</p>
              <Link 
                href="/listings"
                className="bg-[#a3b18a] hover:bg-[#8d6748] text-white px-6 py-3 rounded-lg transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite) => {
                const product = favorite.product;
                return (
                  <div key={favorite.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border">
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎨</div>
                            <div className="text-sm">No Image</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      {product.discount_percentage && product.discount_percentage > 0 && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            -{product.discount_percentage}% OFF
                          </span>
                        </div>
                      )}
                      
                      {/* Stock Badge */}
                      {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Only {product.stock_quantity} left
                          </span>
                        </div>
                      )}

                      {product.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-medium text-sm">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="font-bold text-lg text-[#8d6748] line-clamp-2 mb-1" title={product.name}>
                          {product.name}
                        </h3>
                        <p className="text-sm text-[#4d5c3a] font-medium">{product.category}</p>
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mb-4">
                        {formatPrice(product)}
                      </div>

                      {/* Stock Info */}
                      <div className="mb-4">
                        <span className="text-xs text-gray-500">
                          {product.stock_quantity > 0 
                            ? `${product.stock_quantity} in stock`
                            : 'Out of stock'
                          }
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBuyClick(favorite)}
                          disabled={product.stock_quantity === 0}
                          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                            product.stock_quantity === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#a3b18a] hover:bg-[#8d6748] text-white'
                          }`}
                        >
                          {product.stock_quantity === 0 ? 'Out of Stock' : 'Buy Now'}
                        </button>
                        
                        <button
                          onClick={() => handleRemoveFavorite(favorite.id, product.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove from favorites"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </button>
                      </div>

                      {/* Added Date */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-400 text-center">
                          Added {new Date(favorite.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Buy Modal */}
      {showBuyModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#8d6748] mb-4">Purchase Product</h2>
            
            <div className="mb-4">
              <div className="flex items-start gap-4">
                {selectedProduct.product.image_url ? (
                  <Image
                    src={selectedProduct.product.image_url}
                    alt={selectedProduct.product.name}
                    width={80}
                    height={80}
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[#8d6748]">{selectedProduct.product.name}</h3>
                  <p className="text-[#4d5c3a] text-sm">{selectedProduct.product.category}</p>
                  <div className="mt-2">
                    {formatPrice(selectedProduct.product)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
              >
                {Array.from({ length: Math.min(selectedProduct.product.stock_quantity, 10) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6 p-4 bg-[#f8f5f2] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#4d5c3a]">Total:</span>
                <span className="text-xl font-bold text-[#8d6748]">
                  ${((selectedProduct.product.discounted_price || selectedProduct.product.price) * quantity).toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Shipping to: {profile?.address || 'No address on file'}
              </p>
              {!profile?.address && (
                <p className="text-sm text-red-600 mt-1">
                  Please update your profile with a shipping address before ordering.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 px-4 py-2 text-[#8d6748] border border-[#8d6748] rounded-lg hover:bg-[#8d6748] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={orderLoading || !profile?.address}
                className="flex-1 px-4 py-2 bg-[#a3b18a] hover:bg-[#8d6748] text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {orderLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
