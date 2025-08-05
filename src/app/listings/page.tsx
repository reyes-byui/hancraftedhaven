"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import MainHeader from "../../components/MainHeader";
import { getAllProducts, PRODUCT_CATEGORIES, type Product } from "@/lib/supabase";

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'price-low' | 'price-high';

export default function ListingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy]);

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

  const filterAndSortProducts = () => {
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
            Welcome to Handcrafted Haven's Catalog. Browse and select from various product categories to find items that match your interests.
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

                  {/* Action Button */}
                  <button
                    disabled={product.stock_quantity === 0}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      product.stock_quantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#a3b18a] hover:bg-[#8d6748] text-white'
                    }`}
                  >
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'View Details'}
                  </button>
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
