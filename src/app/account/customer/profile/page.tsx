"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainHeader from "@/components/MainHeader";
import { getCurrentUserWithProfile, updateCustomerProfile, type CustomerProfile } from "@/lib/supabase";

export default function CustomerProfilePage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    contact_number: '',
    country: ''
  });
  const router = useRouter();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const { user, profile, error } = await getCurrentUserWithProfile();
    if (error || !user) {
      router.push("/login/customer");
      return;
    }

    setUser(user);
    setProfile(profile);
    
    // Initialize form with existing data
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      address: profile?.address || '',
      contact_number: profile?.contact_number || '',
      country: profile?.country || ''
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
      const { error } = await updateCustomerProfile(formData);
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
              href="/account/customer" 
              className="text-[#8d6748] hover:underline flex items-center gap-2"
            >
              ← Back to Dashboard
            </Link>
          </div>
          
          <h1 className="text-3xl font-serif text-[#8d6748] font-bold mb-6">Profile Settings</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-[#8d6748] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3b18a] focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-[#8d6748] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3b18a] focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-[#8d6748] mb-2">
                Shipping Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3b18a] focus:border-transparent"
                placeholder="Enter your complete shipping address..."
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                This address will be used for order deliveries.
              </p>
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contact_number" className="block text-sm font-medium text-[#8d6748] mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3b18a] focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-[#8d6748] mb-2">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3b18a] focus:border-transparent"
                placeholder="Enter your country"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#a3b18a] hover:bg-[#8d6748] text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              
              <Link
                href="/account/customer"
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-block text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
