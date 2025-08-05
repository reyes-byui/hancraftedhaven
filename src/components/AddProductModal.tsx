"use client";

import { useState } from "react";
import { createProduct, uploadProductImage, PRODUCT_CATEGORIES, type CreateProductData } from "@/lib/supabase";
import Image from "next/image";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

export default function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    category: PRODUCT_CATEGORIES[0],
    price: 0,
    discount_percentage: 0,
    stock_quantity: 1
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'discount_percentage' || name === 'stock_quantity' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Product name is required');
      }
      if (formData.price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      // Create the product first
      const { data: product, error: createError } = await createProduct(formData);
      
      if (createError || !product) {
        throw new Error(createError || 'Failed to create product');
      }

      // Upload image if selected
      let imageUrl = '';
      if (selectedFile) {
        const { data: uploadUrl, error: uploadError } = await uploadProductImage(selectedFile, product.id);
        if (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Don't fail the entire process if image upload fails
        } else if (uploadUrl) {
          imageUrl = uploadUrl;
          // Update product with image URL
          await fetch('/api/products/update-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id, imageUrl })
          });
        }
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: PRODUCT_CATEGORIES[0],
        price: 0,
        discount_percentage: 0,
        stock_quantity: 1
      });
      setSelectedFile(null);
      setPreviewUrl('');
      
      onProductAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#8d6748]">Add New Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
                placeholder="Enter product name"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
              >
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
                placeholder="Describe your product..."
              />
            </div>

            {/* Price and Discount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="discount_percentage" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="discount_percentage"
                  name="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="stock_quantity" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stock_quantity"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                Product Image
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
              />
              {previewUrl && (
                <div className="mt-2">
                  <div className="relative w-32 h-32">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Price Preview */}
            {formData.price > 0 && (
              <div className="p-3 bg-[#f8f5f2] rounded-lg">
                <div className="text-sm text-[#4d5c3a]">Price Preview:</div>
                <div className="flex items-center gap-2">
                  {(formData.discount_percentage || 0) > 0 ? (
                    <>
                      <span className="text-lg font-bold text-[#8d6748]">
                        ${(formData.price * (1 - (formData.discount_percentage || 0) / 100)).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${formData.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-red-600 font-medium">
                        ({formData.discount_percentage || 0}% off)
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-[#8d6748]">
                      ${formData.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#8d6748] text-white rounded-lg hover:bg-[#7a5c3f] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
