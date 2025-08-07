"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

export default function ProductImageGallery({ 
  images = [], // Default to empty array
  productName, 
  className = "" 
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Sort images by primary first, then by display order
  const sortedImages = [...(images || [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  useEffect(() => {
    setSelectedImageIndex(0);
    setIsLoading(false);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-6xl text-gray-300 mb-4">🖼️</div>
          <p className="text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = sortedImages[selectedImageIndex];

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? sortedImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) => 
      prev === sortedImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  return (
    <div className={`space-y-4 ${className}`} onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Main Image Display */}
      <div className="relative bg-white rounded-lg overflow-hidden shadow-md">
        <div className="relative aspect-square">
          {isLoading ? (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : (
            <Image
              src={currentImage.image_url}
              alt={`${productName} - Image ${selectedImageIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={selectedImageIndex === 0}
            />
          )}
          
          {/* Primary Badge */}
          {currentImage.is_primary && (
            <div className="absolute top-3 left-3 bg-[#8d6748] text-white px-2 py-1 rounded-full text-xs font-medium">
              Main Photo
            </div>
          )}

          {/* Navigation Arrows - Only show if multiple images */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-opacity"
                aria-label="Previous image"
              >
                <span className="text-xl">‹</span>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-opacity"
                aria-label="Next image"
              >
                <span className="text-xl">›</span>
              </button>
            </>
          )}

          {/* Image Counter */}
          {sortedImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
              {selectedImageIndex + 1} / {sortedImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation - Only show if multiple images */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedImageIndex
                  ? 'border-[#8d6748] ring-2 ring-[#8d6748] ring-opacity-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image.image_url}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
              {image.is_primary && (
                <div className="absolute inset-0 bg-[#8d6748] bg-opacity-20 flex items-center justify-center">
                  <div className="text-white text-xs font-bold">★</div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
