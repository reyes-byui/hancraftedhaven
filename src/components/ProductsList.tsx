"use client";

import { useState } from "react";
import Image from "next/image";
import { updateProduct, deleteProduct, type Product } from "@/lib/supabase";
import AddProductModal from "./AddProductModal";

interface ProductsListProps {
  products: Product[];
  onProductUpdated: () => void;
}

export default function ProductsList({ products, onProductUpdated }: ProductsListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    setLoading(productId);
    try {
      const { error } = await updateProduct(productId, { is_active: !isActive });
      if (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product status');
      } else {
        onProductUpdated();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(productId);
    try {
      const { error } = await deleteProduct(productId);
      if (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      } else {
        onProductUpdated();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-[#8d6748] mb-2">No Products Yet</h3>
        <p className="text-[#4d5c3a]">Start by adding your first product to your store!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  <div className="text-4xl mb-2">🖼️</div>
                  <div className="text-sm">No Image</div>
                </div>
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Discount Badge */}
            {product.discount_percentage > 0 && (
              <div className="absolute top-2 left-2">
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  -{product.discount_percentage}%
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="mb-2">
              <h3 className="font-semibold text-[#8d6748] truncate" title={product.name}>
                {product.name}
              </h3>
              <p className="text-sm text-gray-600">{product.category}</p>
            </div>

            {product.description && (
              <p className="text-sm text-[#4d5c3a] mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="mb-3">
              {product.discount_percentage > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#8d6748]">
                    ${product.discounted_price?.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-[#8d6748]">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="mb-4">
              <span className="text-sm text-gray-600">
                Stock: {product.stock_quantity} {product.stock_quantity === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditingProduct(product)}
                disabled={loading === product.id}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Edit
              </button>
              
              <button
                onClick={() => handleToggleActive(product.id, product.is_active)}
                disabled={loading === product.id}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  product.is_active
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                } disabled:opacity-50`}
              >
                {loading === product.id ? '...' : product.is_active ? 'Deactivate' : 'Activate'}
              </button>
              
              <button
                onClick={() => handleDeleteProduct(product.id, product.name)}
                disabled={loading === product.id}
                className="px-3 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>

            {/* Created Date */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Created: {new Date(product.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {/* Edit Product Modal */}
      <AddProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onProductAdded={() => {
          setEditingProduct(null);
          onProductUpdated();
        }}
        editProduct={editingProduct}
      />
    </div>
  );
}
