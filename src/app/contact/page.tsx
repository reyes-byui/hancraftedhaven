'use client';

import MainHeader from "../../components/MainHeader";
import Footer from "../../components/Footer";
import { useState } from 'react';
import { submitAdminContact, type AdminContactFormData } from '@/lib/supabase';

export default function ContactPage() {
  const [formData, setFormData] = useState<AdminContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    user_type: 'visitor'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Submit to admin contact system
      const { data, error } = await submitAdminContact(formData);
      
      if (error) {
        throw new Error(error);
      }
      
      if (!data) {
        throw new Error('Failed to submit contact message');
      }
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        user_type: 'visitor'
      });
      
      setSubmitStatus('success');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 py-8 px-4 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#8d6748] mb-6">Contact Us</h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            We'd love to hear from you! Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-[#f5f1eb] p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-[#8d6748] mb-6">Send us a Message</h2>
            
            {submitStatus === 'success' && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                <p className="font-medium">Message sent successfully!</p>
                <p className="text-sm">We'll get back to you within 24 hours.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <p className="font-medium">Error sending message</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              {/* User Type */}
              <div>
                <label htmlFor="user_type" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  I am a...
                </label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                >
                  <option value="visitor">Visitor/Potential Customer</option>
                  <option value="customer">Existing Customer</option>
                  <option value="seller">Seller/Artisan</option>
                </select>
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                  placeholder="What is this about?"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent resize-vertical"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#8d6748] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#6b4d35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-[#8d6748] mb-6">Get in Touch</h2>
              <p className="text-gray-700 mb-6">
                Have questions about our marketplace, need help with your account, or want to learn more about selling on our platform? We're here to help!
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-[#8d6748] text-white p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#8d6748]">Email Us</h3>
                  <p className="text-gray-600">support@handcraftedhaven.com</p>
                  <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#8d6748] text-white p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#8d6748]">Business Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                  <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM EST</p>
                  <p className="text-gray-600">Sunday: Closed</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#8d6748] text-white p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#8d6748]">Address</h3>
                  <p className="text-gray-600">123 Artisan Way</p>
                  <p className="text-gray-600">Craftville, CA 90210</p>
                  <p className="text-gray-600">United States</p>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-[#f5f1eb] p-6 rounded-lg">
              <h3 className="font-semibold text-[#8d6748] mb-3">Frequently Asked Questions</h3>
              <p className="text-gray-700 text-sm mb-4">
                Before reaching out, you might find your answer in our FAQ section.
              </p>
              <a 
                href="/faq" 
                className="text-[#8d6748] font-medium hover:underline text-sm"
              >
                Visit FAQ →
              </a>
            </div>

            {/* Quick Links */}
            <div className="bg-[#f5f1eb] p-6 rounded-lg">
              <h3 className="font-semibold text-[#8d6748] mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <a href="/about" className="block text-[#8d6748] hover:underline">About Us</a>
                <a href="/sellers" className="block text-[#8d6748] hover:underline">Become a Seller</a>
                <a href="/listings" className="block text-[#8d6748] hover:underline">Browse Products</a>
                <a href="/account/customer" className="block text-[#8d6748] hover:underline">My Account</a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
