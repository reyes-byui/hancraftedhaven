"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCurrentUserWithProfile, signOut, getSellerProducts, getSellerOrders, updateOrderStatus, type Product, type OrderItem, type Order } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AddProductModal from "@/components/AddProductModal";
import ProductsList from "@/components/ProductsList";

export default function SellerDashboard() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; business_name?: string; photo_url?: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<(OrderItem & { order: Order })[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { user, profile, error } = await getCurrentUserWithProfile();
      if (error || !user) {
        router.push("/login/seller");
      } else {
        setUser(user);
        setProfile(profile);
        await loadProducts();
        await loadOrders();
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const { data, error } = await getSellerProducts();
      if (error) {
        console.error('Error loading products:', error);
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      console.log('Loading orders...');
      const { data, error } = await getSellerOrders();
      if (error) {
        console.error('Error loading orders:', error);
        alert(`Error loading orders: ${error}`);
        setOrders([]);
      } else {
        console.log('Orders loaded successfully:', data);
        setOrders(data);
      }
    } catch (error) {
      console.error('Caught error loading orders:', error);
      alert(`Caught error loading orders: ${error}`);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleProductAdded = () => {
    loadProducts();
  };

  const activeProducts = products.filter(p => p.is_active);
  // Calculate revenue from orders
  const totalRevenue = orders.reduce((sum, orderItem) => sum + orderItem.subtotal, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2]">
        <div className="text-[#8d6748] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="Handcrafted Haven Logo" 
                width={48} 
                height={48} 
                className="w-12 h-12"
              />
              <span className="text-2xl font-serif font-bold text-[#8d6748]">
                Handcrafted Haven
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/settings" className="text-[#8d6748] hover:underline">
                Settings
              </Link>
              <span className="text-[#4d5c3a]">
                Welcome, {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.email}
                {profile?.business_name && (
                  <span className="block text-sm text-gray-600">{profile.business_name}</span>
                )}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-[#bfa76a] hover:bg-[#8d6748] text-white px-4 py-2 rounded-full transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Dashboard Header */}
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-3xl font-serif text-[#8d6748] font-bold mb-4">Seller Dashboard</h1>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#a3b18a] text-white p-4 rounded-lg text-center">
                <h4 className="text-lg font-semibold">Total Products</h4>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="bg-[#bfa76a] text-white p-4 rounded-lg text-center">
                <h4 className="text-lg font-semibold">Active Products</h4>
                <p className="text-2xl font-bold">{activeProducts.length}</p>
              </div>
              <div className="bg-[#8d6748] text-white p-4 rounded-lg text-center">
                <h4 className="text-lg font-semibold">Revenue</h4>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-[#4d5c3a] text-white p-4 rounded-lg text-center">
                <h4 className="text-lg font-semibold">Categories</h4>
                <p className="text-2xl font-bold">{new Set(products.map(p => p.category)).size}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex px-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-[#8d6748] text-[#8d6748]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'products'
                    ? 'border-[#8d6748] text-[#8d6748]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'orders'
                    ? 'border-[#8d6748] text-[#8d6748]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders ({orders.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add New Product */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg border border-dashed border-[#bfa76a] transition-colors text-left"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">➕</div>
                    <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Add New Product</h3>
                    <p className="text-[#4d5c3a]">List a new handcrafted item for sale.</p>
                  </div>
                </button>

                {/* My Products Overview */}
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg border transition-colors text-left"
                >
                  <h3 className="text-xl font-semibold text-[#8d6748] mb-2">My Products</h3>
                  <p className="text-[#4d5c3a] mb-3">Manage your current product listings.</p>
                  <div className="text-2xl font-bold text-[#8d6748]">{products.length} Products</div>
                </button>

                {/* Orders */}
                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg border transition-colors text-left"
                >
                  <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Orders</h3>
                  <p className="text-[#4d5c3a] mb-3">View and manage customer orders.</p>
                  <div className="text-2xl font-bold text-[#8d6748]">{orders.length} Orders</div>
                </button>

                {/* Analytics */}
                <div className="bg-[#f8f5f2] p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Analytics</h3>
                  <p className="text-[#4d5c3a]">Track your sales performance and insights.</p>
                  <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
                </div>

                {/* Profile Settings */}
                <div className="bg-[#f8f5f2] p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Business Profile</h3>
                  <p className="text-[#4d5c3a]">Update your business information and settings.</p>
                  <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
                </div>

                {/* Community */}
                <Link href="/community" className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg transition-colors border">
                  <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Community</h3>
                  <p className="text-[#4d5c3a]">Connect with other sellers and share experiences.</p>
                </Link>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif font-bold text-[#8d6748]">My Products</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#8d6748] hover:bg-[#7a5c3f] text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    ➕ Add Product
                  </button>
                </div>

                {productsLoading ? (
                  <div className="text-center py-12">
                    <div className="text-[#8d6748] text-xl">Loading products...</div>
                  </div>
                ) : (
                  <ProductsList products={products} onProductUpdated={loadProducts} />
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#8d6748] mb-6">Customer Orders</h2>

                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="text-[#8d6748] text-xl">Loading orders...</div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-xl mb-4">No orders yet</div>
                    <p className="text-gray-400 mb-4">When customers purchase your products, orders will appear here.</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                      <p className="text-blue-800 text-sm">
                        <strong>Setup Required:</strong> To enable the full e-commerce functionality, you need to set up the database tables. 
                        Check the <code className="bg-blue-100 px-2 py-1 rounded">docs/ECOMMERCE_FEATURES_SETUP.md</code> file for instructions.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((orderItem) => (
                      <div key={orderItem.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-[#8d6748] mb-1">
                              {orderItem.product_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Order #{orderItem.order_id.slice(-8).toUpperCase()} • 
                              Placed on {orderItem.order && orderItem.order.created_at 
                                ? new Date(orderItem.order.created_at).toLocaleDateString()
                                : new Date(orderItem.created_at).toLocaleDateString()
                              }
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                Quantity: {orderItem.quantity}
                              </span>
                              <span className="text-sm text-gray-600">
                                Price: ${orderItem.product_price.toFixed(2)} each
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-[#8d6748] mb-2">
                              ${orderItem.subtotal.toFixed(2)}
                            </div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              !orderItem.order ? 'bg-gray-100 text-gray-800' :
                              orderItem.order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              orderItem.order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              orderItem.order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              orderItem.order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {!orderItem.order ? 'Unknown' : 
                                orderItem.order.status.charAt(0).toUpperCase() + orderItem.order.status.slice(1)
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Customer:</strong> Customer ID: {orderItem.order?.customer_id?.slice(-8) || 'Unknown'}
                            </div>
                            <div>
                              <strong>Payment:</strong> {orderItem.order?.payment_status 
                                ? orderItem.order.payment_status.charAt(0).toUpperCase() + orderItem.order.payment_status.slice(1)
                                : 'Unknown'
                              }
                            </div>
                            <div className="md:col-span-2">
                              <strong>Shipping Address:</strong> {orderItem.order?.shipping_address || 'Not available'}
                            </div>
                            {orderItem.order?.notes && (
                              <div className="md:col-span-2">
                                <strong>Notes:</strong> {orderItem.order.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
}
