"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainHeader from "@/components/MainHeader";
import { 
  getCurrentUserWithProfile, 
  getCustomerOrders, 
  getOrderItems,
  type Order, 
  type OrderItem 
} from "@/lib/supabase";

export default function OrderHistoryPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [orderId: string]: OrderItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    loadUserAndOrders();
    
    // Set up periodic refresh to catch order status updates
    const interval = setInterval(() => {
      loadUserAndOrders();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadUserAndOrders = async () => {
    const { user, profile, error } = await getCurrentUserWithProfile();
    if (error || !user) {
      router.push("/login/customer");
      return;
    }

    setUser(user);
    setProfile(profile);

    // Load orders
    const { data: ordersData, error: ordersError } = await getCustomerOrders();
    if (ordersError) {
      console.error('Error loading orders:', ordersError);
    } else {
      setOrders(ordersData);
    }

    setLoading(false);
  };

  const loadOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return; // Already loaded

    const { data, error } = await getOrderItems(orderId);
    if (error) {
      console.error('Error loading order items:', error);
    } else {
      setOrderItems(prev => ({ ...prev, [orderId]: data }));
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      loadOrderItems(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2]">
        <div className="text-[#8d6748] text-xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* Use consistent header with logo */}
      <MainHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-serif text-[#8d6748] font-bold">Order History</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={loadUserAndOrders}
                className="bg-[#a3b18a] hover:bg-[#8d6748] text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                🔄 Refresh Orders
              </button>
              <Link 
                href="/account/customer"
                className="text-[#8d6748] hover:underline"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-xl mb-4">No orders found</div>
              <p className="text-gray-400 mb-6">You haven&apos;t made any purchases yet.</p>
              <Link 
                href="/listings"
                className="bg-[#a3b18a] hover:bg-[#8d6748] text-white px-6 py-3 rounded-lg transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#8d6748] mb-1">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <p className="text-lg font-bold text-[#8d6748] mt-1">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        <strong>Shipping to:</strong> {order.shipping_address}
                      </p>
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="text-[#8d6748] hover:underline text-sm"
                      >
                        {expandedOrders.has(order.id) ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Order Details */}
                  {expandedOrders.has(order.id) && (
                    <div className="p-4">
                      {orderItems[order.id] ? (
                        <div className="space-y-3">
                          <h4 className="font-medium text-[#8d6748] mb-3">Items Ordered:</h4>
                          {orderItems[order.id].map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <div>
                                <p className="font-medium text-[#8d6748]">{item.product_name}</p>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${item.subtotal.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">${item.product_price.toFixed(2)} each</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500">Loading order details...</div>
                      )}
                      
                      {order.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {order.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
