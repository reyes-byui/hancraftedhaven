"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCurrentUserWithProfile, signOut, getSellerProducts, type Product } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AddProductModal from "@/components/AddProductModal";
import ProductsList from "@/components/ProductsList";

export default function SellerDashboard() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ first_name?: string; last_name?: string; business_name?: string; photo_url?: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview');
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleProductAdded = () => {
    loadProducts();
  };

  const activeProducts = products.filter(p => p.is_active);
  // TODO: Replace with actual sales data when orders/sales system is implemented
  const totalRevenue = 0; // Real revenue will be calculated from actual sales/orders

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
                <div className="bg-[#f8f5f2] p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold text-[#8d6748] mb-2">Orders</h3>
                  <p className="text-[#4d5c3a]">View and manage customer orders.</p>
                  <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
                </div>

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
