"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";
import { getCurrentUserWithProfile, updateSellerProfile, type SellerProfile } from "@/lib/supabase";

export default function SellerProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    business_name: '',
    business_address: '',
    contact_number: '',
    country: '',
    business_description: ''
  });
  const router = useRouter();

  useEffect(() => {
    loadUserProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserProfile = async () => {
    const { user, profile, error } = await getCurrentUserWithProfile();
    if (error || !user) {
      router.push("/login/seller");
      return;
    }

    setUser(user);
    setProfile(profile);
    
    // Initialize form with existing data
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      business_name: profile?.business_name || '',
      business_address: profile?.business_address || '',
      contact_number: profile?.contact_number || '',
      country: profile?.country || '',
      business_description: profile?.business_description || ''
    });
    
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await updateSellerProfile(formData);
      if (error) {
        alert('Error updating profile: ' + error);
      } else {
        alert('Profile updated successfully!');
        loadUserProfile(); // Reload profile data
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Unexpected error occurred. Please try again.');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2]">
        <div className="text-[#8d6748] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* Use consistent header with logo */}
      <MainHeader />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/account/seller" 
              className="text-[#8d6748] hover:underline flex items-center gap-2"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <h1 className="text-3xl font-serif text-[#8d6748] font-bold mb-6">Edit Business Profile</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#8d6748] border-b border-gray-200 pb-2">
                Business Information
              </h3>

              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label htmlFor="business_address" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Business Address *
                </label>
                <textarea
                  id="business_address"
                  name="business_address"
                  value={formData.business_address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                  placeholder="Enter your business address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact_number" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                    placeholder="Enter your contact number"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                    placeholder="Enter your country"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="business_description" className="block text-sm font-medium text-[#4d5c3a] mb-2">
                  Business Description *
                </label>
                <textarea
                  id="business_description"
                  name="business_description"
                  value={formData.business_description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:border-transparent"
                  placeholder="Describe your business and the type of handcrafted items you create..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#8d6748] text-white font-semibold rounded-lg hover:bg-[#6b5235] focus:outline-none focus:ring-2 focus:ring-[#8d6748] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
              
              <Link
                href="/account/seller"
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
