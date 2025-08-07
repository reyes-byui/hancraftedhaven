"use client";

import { useState, useEffect } from "react";
import { createProduct, uploadProductImage, updateProduct, uploadMultipleProductImages, getProductImages, deleteProductImage, setProductPrimaryImage, PRODUCT_CATEGORIES, type CreateProductData, type Product, type ProductImage } from "@/lib/supabase";
import Image from "next/image";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  editProduct?: Product | null; // Optional product to edit
}

export default function AddProductModal({ isOpen, onClose, onProductAdded, editProduct }: AddProductModalProps) {
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    category: PRODUCT_CATEGORIES[0],
    price: 0,
    discount_percentage: 0,
    stock_quantity: 1
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    const loadExistingImages = async () => {
      if (editProduct) {
        const { data: images } = await getProductImages(editProduct.id);
        setExistingImages(images || []);
      }
    };

    if (editProduct) {
      setFormData({
        name: editProduct.name,
        description: editProduct.description || '',
        category: editProduct.category,
        price: editProduct.price,
        discount_percentage: editProduct.discount_percentage || 0,
        stock_quantity: editProduct.stock_quantity
      });
      setPreviewUrl(editProduct.image_url || '');
      loadExistingImages();
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        category: PRODUCT_CATEGORIES[0],
        price: 0,
        discount_percentage: 0,
        stock_quantity: 1
      });
      setPreviewUrl('');
      setExistingImages([]);
    }
    setSelectedFile(null);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setError('');
  }, [editProduct, isOpen]);

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

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    } else {
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  };

  const removePreviewImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const removeExistingImage = async (imageId: string) => {
    const { error } = await deleteProductImage(imageId);
    if (error) {
      alert('Failed to delete image: ' + error);
    } else {
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const setPrimaryImage = async (imageId: string, productId: string) => {
    const { error } = await setProductPrimaryImage(imageId, productId);
    if (error) {
      alert('Failed to set primary image: ' + error);
    } else {
      setExistingImages(prev => prev.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));
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

      let product;
      
      if (editProduct) {
        // Update existing product
        const { data: updatedProduct, error: updateError } = await updateProduct(editProduct.id, formData);
        if (updateError || !updatedProduct) {
          throw new Error(updateError || 'Failed to update product');
        }
        product = updatedProduct;
      } else {
        // Create new product
        const { data: newProduct, error: createError } = await createProduct(formData);
        if (createError || !newProduct) {
          throw new Error(createError || 'Failed to create product');
        }
        product = newProduct;
      }

      // Upload images if selected
      if (selectedFiles.length > 0) {
        const { data: uploadedImages, error: uploadError } = await uploadMultipleProductImages(selectedFiles, product.id);
        if (uploadError) {
          console.error('Multiple images upload failed:', uploadError);
          // Don't fail the entire process if image upload fails
        } else if (uploadedImages && uploadedImages.length > 0) {
          console.log(`Successfully uploaded ${uploadedImages.length} images`);
        }
      } else if (selectedFile) {
        // Fallback to single image upload for backward compatibility
        const { data: uploadUrl, error: uploadError } = await uploadProductImage(selectedFile, product.id);
        if (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Don't fail the entire process if image upload fails
        } else if (uploadUrl) {
          // Update product with image URL
          await fetch('/api/products/update-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id, imageUrl: uploadUrl })
          });
        }
      }

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
            <h2 className="text-2xl font-serif font-bold text-[#8d6748]">
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
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

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                Product Images
              </label>
              
              {/* Existing Images (when editing) */}
              {editProduct && existingImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-[#4d5c3a] mb-2">Current Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative">
                        <div className="relative w-full h-32">
                          <Image
                            src={image.image_url}
                            alt={image.alt_text || 'Product image'}
                            fill
                            className="object-cover rounded-lg"
                          />
                          {image.is_primary && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                              Primary
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 mt-2">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(image.id, editProduct.id)}
                            disabled={image.is_primary}
                            className="flex-1 px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 rounded text-xs"
                          >
                            {image.is_primary ? 'Primary' : 'Set Primary'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id)}
                            className="px-2 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiple Images Upload */}
              <div className="mb-4">
                <label htmlFor="multiple-images" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Add New Images (Multiple)
                </label>
                <input
                  type="file"
                  id="multiple-images"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleFilesChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Select multiple images (first image will be the primary image)
                </p>
              </div>

              {/* Preview new images */}
              {previewUrls.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-[#4d5c3a] mb-2">New Images Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <div className="relative w-full h-32">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                              Primary
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePreviewImage(index)}
                          className="w-full mt-2 px-2 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Image Upload (backward compatibility) */}
              <div>
                <label htmlFor="single-image" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Or Add Single Image
                </label>
                <input
                  type="file"
                  id="single-image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
                />
                {(previewUrl || editProduct?.image_url) && (
                  <div className="mt-2">
                    <div className="relative w-32 h-32">
                      <Image
                        src={previewUrl || editProduct?.image_url || ''}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                      {editProduct?.image_url && !selectedFile && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                          Current Image
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
                {loading 
                  ? (editProduct ? 'Updating Product...' : 'Adding Product...') 
                  : (editProduct ? 'Update Product' : 'Add Product')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
