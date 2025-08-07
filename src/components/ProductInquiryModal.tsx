"use client";

import { useState } from "react";
import { createProductInquiry, type CreateInquiryData } from "@/lib/supabase";

interface ProductInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  sellerId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
}

export default function ProductInquiryModal({ 
  isOpen, 
  onClose, 
  productId, 
  sellerId, 
  productName,
  customerName,
  customerEmail
}: ProductInquiryModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!subject.trim() || !message.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const inquiryData: CreateInquiryData = {
        product_id: productId,
        seller_id: sellerId,
        subject: subject.trim(),
        message: message.trim(),
        customer_email: customerEmail,
        customer_name: customerName
      };

      const { data, error: createError } = await createProductInquiry(inquiryData);
      
      if (createError) {
        throw new Error(createError);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setSubject('');
        setMessage('');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send inquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setMessage('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-serif font-bold text-[#8d6748] mb-2">
              Inquiry Sent Successfully!
            </h2>
            <p className="text-[#4d5c3a] mb-4">
              Your inquiry about "{productName}" has been sent to the seller. They will respond via email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#8d6748]">
              Send Inquiry About This Item
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-4 bg-[#f8f5f2] rounded-lg">
            <div className="text-sm text-[#4d5c3a]">
              <strong>Product:</strong> {productName}
            </div>
            <div className="text-sm text-[#4d5c3a] mt-1">
              <strong>Your Email:</strong> {customerEmail}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                Subject *
              </label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
              >
                <option value="">Select a subject</option>
                <option value="Product Information">Product Information</option>
                <option value="Pricing & Availability">Pricing & Availability</option>
                <option value="Custom Order Request">Custom Order Request</option>
                <option value="Shipping & Delivery">Shipping & Delivery</option>
                <option value="Product Care Instructions">Product Care Instructions</option>
                <option value="Bulk Order Inquiry">Bulk Order Inquiry</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                Message *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748]"
                placeholder="Please describe your inquiry in detail..."
              />
              <div className="text-sm text-gray-500 mt-1">
                Be specific about your questions or requirements to get the best response.
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <strong>📧 How it works:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Your inquiry will be sent directly to the seller</li>
                  <li>• The seller will respond to your email address</li>
                  <li>• You can track your inquiries in your customer dashboard</li>
                  <li>• Sellers typically respond within 24-48 hours</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !subject.trim() || !message.trim()}
                className="flex-1 px-4 py-2 bg-[#8d6748] text-white rounded-lg hover:bg-[#7a5c3f] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Inquiry...' : 'Send Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
