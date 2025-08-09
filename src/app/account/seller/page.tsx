"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCurrentUserWithProfile, getSellerProducts, getSellerOrders, updateOrderItemStatus, getSellerInquiries, respondToInquiry, updateInquiryStatus, type Product, type OrderItem, type Order, type ProductInquiryWithProduct } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AddProductModal from "@/components/AddProductModal";
import ProductsList from "@/components/ProductsList";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";

export default function SellerDashboard() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ 
    first_name?: string; 
    last_name?: string; 
    business_name?: string; 
    photo_url?: string;
    contact_number?: string;
    business_address?: string;
    country?: string;
    business_description?: string;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<(OrderItem & { order: Order })[]>([]);
  const [inquiries, setInquiries] = useState<ProductInquiryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inquiries' | 'profile'>('overview');
  const [updatingOrderItemId, setUpdatingOrderItemId] = useState<string | null>(null);
  const [respondingToInquiry, setRespondingToInquiry] = useState<string | null>(null);
  const [inquiryResponse, setInquiryResponse] = useState('');
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
        await loadInquiries();
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

  const loadInquiries = async () => {
    setInquiriesLoading(true);
    try {
      console.log('Loading inquiries...');
      const { data, error } = await getSellerInquiries();
      if (error) {
        console.error('Error loading inquiries:', error);
        setInquiries([]);
      } else {
        console.log('Inquiries loaded successfully:', data);
        setInquiries(data);
      }
    } catch (error) {
      console.error('Caught error loading inquiries:', error);
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleProductAdded = () => {
    loadProducts();
  };

  const activeProducts = products.filter(p => p.is_active);
  
  // Calculate revenue from confirmed/delivered order items only
  const totalRevenue = orders.reduce((sum, orderItem) => {
    // Only count revenue from delivered individual items
    if (orderItem.status === 'delivered') {
      return sum + orderItem.subtotal;
    }
    return sum;
  }, 0);

  // Calculate pending revenue (from non-cancelled individual items)
  const pendingRevenue = orders.reduce((sum, orderItem) => {
    if (orderItem.status !== 'delivered' && orderItem.status !== 'cancelled') {
      return sum + orderItem.subtotal;
    }
    return sum;
  }, 0);

  // Count total orders
  const uniqueOrders = new Set(orders.map(item => item.order.id));
  const totalOrdersCount = uniqueOrders.size;

  // Handle order item status updates (NEW - individual items)
  const handleItemStatusUpdate = async (orderItemId: string, newStatus: OrderItem['status']) => {
    setUpdatingOrderItemId(orderItemId);
    try {
      const { error } = await updateOrderItemStatus(orderItemId, newStatus);
      if (error) {
        alert('Error updating item status: ' + error);
      } else {
        // Reload orders to reflect the change
        await loadOrders();
        // Show success message
        alert(`Item status updated to: ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Error updating item status. Please try again.');
    } finally {
      setUpdatingOrderItemId(null);
    }
  };

  // Handle inquiry response
  const handleInquiryResponse = async (inquiryId: string) => {
    if (!inquiryResponse.trim()) {
      alert('Please enter a response message');
      return;
    }

    setRespondingToInquiry(inquiryId);
    try {
      const { error } = await respondToInquiry(inquiryId, inquiryResponse.trim());
      if (error) {
        alert('Error sending response: ' + error);
      } else {
        alert('Response sent successfully!');
        setInquiryResponse('');
        await loadInquiries(); // Reload to reflect changes
      }
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Error sending response. Please try again.');
    } finally {
      setRespondingToInquiry(null);
    }
  };

  // Mark inquiry as resolved
  const handleMarkResolved = async (inquiryId: string) => {
    try {
      const { error } = await updateInquiryStatus(inquiryId, 'closed');
      if (error) {
        alert('Error updating inquiry status: ' + error);
      } else {
        alert('Inquiry marked as resolved!');
        await loadInquiries();
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      alert('Error updating inquiry status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2]">
        <div className="text-[#8d6748] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* Use consistent header */}
      <MainHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Dashboard Header */}
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-3xl font-serif text-[#8d6748] font-bold mb-4">Seller Dashboard</h1>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="text-sm opacity-90 mt-1">Delivered orders only</p>
              </div>
              <div className="bg-[#4d5c3a] text-white p-4 rounded-lg text-center">
                <h4 className="text-lg font-semibold">Total Orders</h4>
                <p className="text-2xl font-bold">{totalOrdersCount}</p>
              </div>
            </div>
            
            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-[#588157] text-white p-4 rounded-lg text-center">
                <h4 className="text-lg font-semibold">Pending Revenue</h4>
                <p className="text-2xl font-bold">${pendingRevenue.toFixed(2)}</p>
                <p className="text-sm opacity-90 mt-1">Orders in progress</p>
              </div>
              <div className="bg-[#3a5a40] text-white p-4 rounded-lg text-center">
                <h4 className="text-lg font-semibold">Categories</h4>
                <p className="text-2xl font-bold">{new Set(products.map(p => p.category)).size}</p>
              </div>
            </div>
          </div>

          {/* Seller Profile Information Display */}
          <div className="p-8 border-b border-gray-200">
            <div className="bg-[#f8f5f2] border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 mb-4">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profile?.photo_url ? (
                      <Image 
                        src={profile.photo_url} 
                        alt="Profile" 
                        width={96} 
                        height={96} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">No Photo</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Profile Info */}
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-xl font-semibold text-[#8d6748] mb-4">Your Seller Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Name:</span>
                      <span className="ml-2 text-gray-700">
                        {profile?.first_name || profile?.last_name 
                          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                          : 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Email:</span>
                      <span className="ml-2 text-gray-700">{user?.email || 'Not available'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Business Name:</span>
                      <span className="ml-2 text-gray-700">{profile?.business_name || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Phone:</span>
                      <span className="ml-2 text-gray-700">{profile?.contact_number || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Business Address:</span>
                      <span className="ml-2 text-gray-700">{profile?.business_address || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Country:</span>
                      <span className="ml-2 text-gray-700">{profile?.country || 'Not set'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-[#4d5c3a]">Business Description:</span>
                      <span className="ml-2 text-gray-700">{profile?.business_description || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </div>
              {(!profile?.business_name || !profile?.business_address || !profile?.business_description) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Incomplete Profile:</strong> Please complete your seller profile to improve visibility to customers and enable all features.
                  </p>
                </div>
              )}
              
              <div className="mt-4 flex gap-4">
                <Link
                  href="/settings"
                  className="px-4 py-2 bg-[#8d6748] text-white font-medium rounded-lg hover:bg-[#6b5235] transition-colors text-sm"
                >
                  ✏️ Account Settings
                </Link>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  👤 View Full Profile
                </button>
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
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'inquiries'
                    ? 'border-[#8d6748] text-[#8d6748]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📧 Inquiries ({inquiries.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-[#8d6748] text-[#8d6748]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👤 Business Profile
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

                {/* Business Profile */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className="bg-[#f8f5f2] hover:bg-[#f0ede8] p-6 rounded-lg border transition-colors text-left"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">👤</div>
                    <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Business Profile</h3>
                    <p className="text-[#4d5c3a]">Update your business information and settings.</p>
                    <div className="mt-2 flex gap-2 justify-center">
                      <span className="inline-block px-2 py-1 bg-[#a3b18a] text-white text-xs rounded">
                        ✓ Active
                      </span>
                      {(!profile?.business_name || !profile?.business_address || !profile?.business_description) && (
                        <span className="inline-block px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                          ⚠ Incomplete
                        </span>
                      )}
                    </div>
                  </div>
                </button>

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
                              !orderItem.status ? 'bg-gray-100 text-gray-800' :
                              orderItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              orderItem.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              orderItem.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              orderItem.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {!orderItem.status ? 'Unknown' : 
                                orderItem.status.charAt(0).toUpperCase() + orderItem.status.slice(1)
                              }
                            </span>
                          </div>
                        </div>

                        {/* Order Status Management */}
                        {orderItem.order && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-[#4d5c3a]">Update Item Status:</span>
                              <div className="flex gap-2">
                                {orderItem.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleItemStatusUpdate(orderItem.id, 'processing')}
                                      disabled={updatingOrderItemId === orderItem.id}
                                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs rounded transition-colors"
                                    >
                                      {updatingOrderItemId === orderItem.id ? '...' : 'Accept Item'}
                                    </button>
                                    <button
                                      onClick={() => handleItemStatusUpdate(orderItem.id, 'cancelled')}
                                      disabled={updatingOrderItemId === orderItem.id}
                                      className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-xs rounded transition-colors"
                                    >
                                      {updatingOrderItemId === orderItem.id ? '...' : 'Decline Item'}
                                    </button>
                                  </>
                                )}
                                {orderItem.status === 'processing' && (
                                  <button
                                    onClick={() => handleItemStatusUpdate(orderItem.id, 'shipped')}
                                    disabled={updatingOrderItemId === orderItem.id}
                                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white text-xs rounded transition-colors"
                                  >
                                    {updatingOrderItemId === orderItem.id ? '...' : 'Mark as Shipped'}
                                  </button>
                                )}
                                {orderItem.status === 'shipped' && (
                                  <button
                                    onClick={() => handleItemStatusUpdate(orderItem.id, 'delivered')}
                                    disabled={updatingOrderItemId === orderItem.id}
                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-xs rounded transition-colors"
                                  >
                                    {updatingOrderItemId === orderItem.id ? '...' : 'Mark as Delivered'}
                                  </button>
                                )}
                                {(['delivered', 'cancelled'].includes(orderItem.status)) && (
                                  <span className="text-xs text-gray-500 italic">Item Complete</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
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

            {activeTab === 'inquiries' && (
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#8d6748] mb-6">Customer Inquiries</h2>

                {inquiriesLoading ? (
                  <div className="text-center py-12">
                    <div className="text-[#8d6748] text-xl">Loading inquiries...</div>
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-xl mb-4">No inquiries yet</div>
                    <p className="text-gray-400 mb-4">When customers send inquiries about your products, they will appear here.</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                      <p className="text-blue-800 text-sm">
                        <strong>How it works:</strong>
                        <br />• Customers can send inquiries from product detail pages
                        <br />• You&apos;ll receive notifications via email
                        <br />• Respond to inquiries here or via email
                        <br />• Track inquiry status and history
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-[#8d6748] mb-1">
                              {inquiry.subject}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Product: <Link href={`/products/${inquiry.product_id}`} className="text-[#8d6748] hover:underline font-medium">{inquiry.product?.name}</Link>
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              From: {inquiry.customer_name} ({inquiry.customer_email})
                            </p>
                            <p className="text-sm text-gray-600">
                              Sent: {new Date(inquiry.created_at).toLocaleDateString()} at {new Date(inquiry.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              inquiry.status === 'responded' ? 'bg-blue-100 text-blue-800' :
                              inquiry.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Customer Message */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-[#4d5c3a] mb-2">Customer Message:</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                        </div>

                        {/* Seller Response Section */}
                        {inquiry.seller_response && (
                          <div className="mb-4 p-4 bg-[#f8f5f2] rounded-lg border-l-4 border-[#8d6748]">
                            <h4 className="font-medium text-[#4d5c3a] mb-2">Your Response:</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{inquiry.seller_response}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              Sent: {inquiry.responded_at ? new Date(inquiry.responded_at).toLocaleDateString() + ' at ' + new Date(inquiry.responded_at).toLocaleTimeString() : 'Unknown'}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                          {inquiry.status !== 'closed' && (
                            <>
                              {!inquiry.seller_response ? (
                                <div className="flex-1">
                                  <textarea
                                    value={respondingToInquiry === inquiry.id ? inquiryResponse : ''}
                                    onChange={(e) => {
                                      if (respondingToInquiry === inquiry.id) {
                                        setInquiryResponse(e.target.value);
                                      } else {
                                        setRespondingToInquiry(inquiry.id);
                                        setInquiryResponse('');
                                      }
                                    }}
                                    placeholder="Type your response here..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748] resize-none"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() => handleInquiryResponse(inquiry.id)}
                                      disabled={!inquiryResponse.trim() || respondingToInquiry !== inquiry.id}
                                      className="px-4 py-2 bg-[#8d6748] text-white rounded-lg hover:bg-[#7a5c3f] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                      Send Response
                                    </button>
                                    <button
                                      onClick={() => {
                                        setRespondingToInquiry(null);
                                        setInquiryResponse('');
                                      }}
                                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleMarkResolved(inquiry.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                >
                                  Mark as Resolved
                                </button>
                              )}
                            </>
                          )}
                          
                          <a
                            href={`mailto:${inquiry.customer_email}?subject=Re: ${inquiry.subject}&body=Hello ${inquiry.customer_name},%0D%0A%0D%0AThank you for your inquiry about "${inquiry.product?.name}".%0D%0A%0D%0A`}
                            className="px-4 py-2 bg-[#4d5c3a] text-white rounded-lg hover:bg-[#3d4a2e] text-sm font-medium text-center"
                          >
                            📧 Reply via Email
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <div className="bg-[#f8f5f2] border border-gray-200 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold text-[#8d6748] mb-4">Business Profile</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Name:</span>
                      <span className="ml-2 text-gray-700">
                        {profile?.first_name || profile?.last_name 
                          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                          : 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Email:</span>
                      <span className="ml-2 text-gray-700">{user?.email || 'Not available'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Business Name:</span>
                      <span className="ml-2 text-gray-700">{profile?.business_name || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Phone:</span>
                      <span className="ml-2 text-gray-700">{profile?.contact_number || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Business Address:</span>
                      <span className="ml-2 text-gray-700">{profile?.business_address || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-[#4d5c3a]">Country:</span>
                      <span className="ml-2 text-gray-700">{profile?.country || 'Not set'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-[#4d5c3a]">Business Description:</span>
                      <span className="ml-2 text-gray-700">{profile?.business_description || 'Not set'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Link
                      href="/settings"
                      className="px-6 py-3 bg-[#8d6748] text-white font-semibold rounded-lg hover:bg-[#6b5235] transition-colors"
                    >
                      ✏️ Account Settings
                    </Link>
                  </div>
                  
                  {(!profile?.business_name || !profile?.business_address || !profile?.business_description) && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>⚠️ Incomplete Profile:</strong> Please complete your seller profile to improve visibility to customers and enable all features.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
}
