"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import MainHeader from "../../components/MainHeader";
import { 
  getAllProducts, 
  PRODUCT_CATEGORIES, 
  type Product,
  addToFavorites,
  removeFromFavorites,
  isProductInFavorites,
  addToCart,
  getCurrentUserWithProfile
} from "@/lib/supabase";

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'price-low' | 'price-high';

export default function ListingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const loadUser = async () => {
    const { user } = await getCurrentUserWithProfile();
    setUser(user);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllProducts();
      if (error) {
        console.error('Error loading products:', error);
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductFavorites = async () => {
    if (!user) return;
    
    try {
      const favoritePromises = products.map(async (product) => {
        const { data: isFav } = await isProductInFavorites(product.id);
        return { productId: product.id, isFavorite: isFav };
      });
      
      const favoriteResults = await Promise.all(favoritePromises);
      const newFavorites = new Set<string>();
      favoriteResults.forEach(({ productId, isFavorite }) => {
        if (isFavorite) newFavorites.add(productId);
      });
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'price-low':
          const priceA = a.discounted_price || a.price;
          const priceB = b.discounted_price || b.price;
          return priceA - priceB;
        case 'price-high':
          const priceA2 = a.discounted_price || a.price;
          const priceB2 = b.discounted_price || b.price;
          return priceB2 - priceA2;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy]);

  useEffect(() => {
    loadProducts();
    loadUser();
  }, []);

  // Load favorites status for products after user is loaded
  useEffect(() => {
    if (user && products.length > 0) {
      loadProductFavorites();
    }
  }, [user, products]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login/customer';
      return;
    }

    const isFavorite = favorites.has(productId);
    
    try {
      if (isFavorite) {
        await removeFromFavorites(productId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(productId);
          return newFavorites;
        });
      } else {
        await addToFavorites(productId);
        setFavorites(prev => new Set(prev).add(productId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      window.location.href = '/login/customer';
      return;
    }
    
    setAddingToCart(product.id);
    
    try {
      const { error } = await addToCart(product.id, 1);
      
      if (error) {
        alert('Error adding to cart: ' + error);
      } else {
        alert('Product added to cart!');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (product: Product) => {
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

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#8d6748] mb-4">Product Catalog</h1>
          <p className="text-lg text-[#4d5c3a] mb-6">
            Welcome to Handcrafted Haven&apos;s Catalog. Browse and select from various product categories to find items that match your interests.
          </p>

          {/* Filters and Sorting */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-[#f8f5f2] rounded-lg">
            <div className="flex-1">
              <label htmlFor="category" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
              >
                <option value="All">All Categories</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="sort" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="bg-[#8d6748] text-white px-4 py-2 rounded-lg text-sm font-medium">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#8d6748] text-xl">Loading products...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">
              {selectedCategory === 'All' ? 'No products found' : `No products found in "${selectedCategory}" category`}
            </div>
            <p className="text-gray-400">
              {selectedCategory !== 'All' && 'Try selecting a different category or '}
              Check back later for new products!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Product Image */}
                <div className="relative h-64 bg-gray-100">
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
                        <div className="text-6xl mb-2">🎨</div>
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
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Favorite Button */}
                  {user && (
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all z-10"
                    >
                      <svg
                        className={`w-5 h-5 ${
                          favorites.has(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                        }`}
                        fill={favorites.has(product.id) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
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
                      disabled={product.stock_quantity === 0 || addingToCart === product.id}
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        product.stock_quantity === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : addingToCart === product.id
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-[#a3b18a] hover:bg-[#8d6748] text-white'
                      }`}
                    >
                      {product.stock_quantity === 0 ? 'Out of Stock' : 
                       addingToCart === product.id ? 'Adding...' :
                       user ? 'Add to Cart' : 'Login to Add'}
                    </button>
                    
                    {user && product.stock_quantity > 0 && (
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className={`p-2 rounded-lg font-medium transition-colors ${
                          favorites.has(product.id)
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={favorites.has(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Product Footer */}
                <div className="px-4 pb-4 pt-0">
                  <div className="text-xs text-gray-400 text-center">
                    Listed {new Date(product.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="w-full bg-[#e7d7c1] py-6 flex flex-col items-center text-[#8d6748] text-sm mt-auto">
        <span>&copy; {new Date().getFullYear()} Handcrafted Haven. All rights reserved.</span>
        <nav className="flex gap-4 mt-2">
          <Link href="/" className="hover:underline focus:underline">Home</Link>
          <Link href="/sellers" className="hover:underline focus:underline">Sellers</Link>
          <Link href="/listings" className="hover:underline focus:underline">Listings</Link>
          <Link href="/about" className="hover:underline focus:underline">About</Link>
          <Link href="/contact" className="hover:underline focus:underline">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
