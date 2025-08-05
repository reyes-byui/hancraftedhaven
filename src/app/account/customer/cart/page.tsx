"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getCurrentUserWithProfile, 
  getCartItems, 
  updateCartItemQuantity,
  removeFromCart,
  checkoutCart,
  type CartItemWithProduct 
} from "@/lib/supabase";

export default function ShoppingCartPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; address?: string } | null>(null);
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUserAndCart();
  }, []);

  const loadUserAndCart = async () => {
    const { user, profile, error } = await getCurrentUserWithProfile();
    if (error || !user) {
      router.push("/login/customer");
      return;
    }

    setUser(user);
    setProfile(profile);

    // Load cart items
    const { data: cartData, error: cartError } = await getCartItems();
    if (cartError) {
      console.error('Error loading cart:', cartError);
    } else {
      setCartItems(cartData);
    }

    setLoading(false);
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    setUpdating(cartItemId);
    
    const { error } = await updateCartItemQuantity(cartItemId, newQuantity);
    if (error) {
      alert('Error updating cart: ' + error);
    } else {
      // Reload cart to get updated data
      await loadUserAndCart();
    }
    
    setUpdating(null);
  };

  const removeItem = async (cartItemId: string) => {
    setUpdating(cartItemId);
    
    const { error } = await removeFromCart(cartItemId);
    if (error) {
      alert('Error removing item: ' + error);
    } else {
      // Reload cart to get updated data
      await loadUserAndCart();
    }
    
    setUpdating(null);
  };

  const handleCheckout = async () => {
    if (!profile?.address) {
      console.log('Profile data:', profile);
      alert('Please add a shipping address to your profile before checking out.');
      router.push('/account/customer');
      return;
    }

    setCheckingOut(true);
    
    try {
      console.log('Starting checkout with address:', profile.address);
      const { data: order, error } = await checkoutCart(profile.address, 'card', 'Order from shopping cart');
      
      if (error) {
        console.error('Checkout error:', error);
        alert('Error during checkout: ' + error);
      } else {
        console.log('Order created successfully:', order);
        alert('Order placed successfully! Check your order history for details.');
        router.push('/account/customer/orders');
      }
    } catch (err) {
      console.error('Unexpected error during checkout:', err);
      alert('Unexpected error occurred during checkout. Please try again.');
    }
    
    setCheckingOut(false);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.product.discounted_price || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
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
        <div className="text-[#8d6748] text-xl">Loading cart...</div>
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
            <h1 className="text-3xl font-serif text-[#8d6748] font-bold">Shopping Cart</h1>
            <Link 
              href="/listings"
              className="text-[#8d6748] hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-xl mb-4">Your cart is empty</div>
              <p className="text-gray-400 mb-6">Add some products to get started!</p>
              <Link 
                href="/listings"
                className="bg-[#a3b18a] hover:bg-[#8d6748] text-white px-6 py-3 rounded-lg transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-4xl text-gray-400">
                          🎨
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#8d6748] mb-1">{item.product.name}</h3>
                      <p className="text-sm text-[#4d5c3a] mb-2">{item.product.category}</p>
                      {formatPrice(item.product)}
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {item.product.stock_quantity} available
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= item.product.stock_quantity}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[100px]">
                      <p className="font-bold text-lg text-[#8d6748]">
                        ${((item.product.discounted_price || item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating === item.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 p-2"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</p>
                    <p className="text-2xl font-bold text-[#8d6748]">${calculateTotal().toFixed(2)}</p>
                  </div>
                </div>

                {/* Shipping Address Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Shipping Address:</strong> {profile?.address || 'No address on file'}
                  </p>
                  {!profile?.address && (
                    <Link 
                      href="/account/customer"
                      className="text-blue-600 underline text-sm"
                    >
                      Add shipping address in your profile
                    </Link>
                  )}
                </div>

                {/* Checkout Button */}
                <div className="flex gap-4">
                  <Link
                    href="/listings"
                    className="flex-1 text-center py-3 px-6 border border-[#8d6748] text-[#8d6748] rounded-lg hover:bg-[#8d6748] hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut || !profile?.address || cartItems.length === 0}
                    className="flex-1 py-3 px-6 bg-[#a3b18a] hover:bg-[#8d6748] text-white rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {checkingOut ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
