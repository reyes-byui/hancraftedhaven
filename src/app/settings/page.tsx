"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCurrentUserWithProfile, updateUserProfile, updatePassword, deleteAccount, uploadProfilePhoto } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AccountSettings() {
  const [user, setUser] = useState<{ id: string; email?: string; created_at?: string } | null>(null);
  const [profile, setProfile] = useState<{ role?: string; first_name?: string; last_name?: string; country?: string; address?: string; contact_number?: string; business_name?: string; business_address?: string; business_description?: string; photo_url?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'account'>('profile');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // Profile form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  // Password form fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete account confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    async function loadUserData() {
      const { user, profile, error } = await getCurrentUserWithProfile();
      if (error || !user) {
        router.push("/login");
      } else {
        setUser(user);
        setProfile(profile);
        
        // Populate form fields
        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setCountry(profile.country || "");
          setAddress(profile.address || "");
          setContactNumber(profile.contact_number || "");
          setBusinessName(profile.business_name || "");
          setBusinessAddress(profile.business_address || "");
          setBusinessDescription(profile.business_description || "");
          setPhotoPreview(profile.photo_url || "");
        }
      }
      setLoading(false);
    }
    loadUserData();
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("User not authenticated");
      return;
    }
    
    setError("");
    setSuccess("");
    setIsUpdating(true);

    try {
      let photoUrl = profile?.photo_url || "";
      
      // Upload new photo if provided
      if (profilePhoto && user?.id) {
        const { data: uploadData, error: uploadError } = await uploadProfilePhoto(user.id, profilePhoto);
        if (uploadError) {
          console.error("Photo upload failed:", uploadError);
        } else {
          photoUrl = uploadData || photoUrl;
        }
      }

      // Update profile
      const updates: Record<string, string | null> = {
        first_name: firstName,
        last_name: lastName,
        country,
        address,
        contact_number: contactNumber || null,
        photo_url: photoUrl || null,
      };

      // Add seller-specific fields if user is a seller
      if (profile?.role === 'seller') {
        updates.business_name = businessName;
        updates.business_address = businessAddress;
        updates.business_description = businessDescription;
      }

      const { error } = await updateUserProfile(user.id, updates);

      if (error) {
        setError(error);
      } else {
        setSuccess("Profile updated successfully!");
        setProfile({ ...profile, ...updates });
        setProfilePhoto(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        setError(error);
      } else {
        setSuccess("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setError("Please type 'DELETE' to confirm account deletion");
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await deleteAccount();

      if (error) {
        setError(error);
      } else {
        // Redirect to home page
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-serif font-bold text-[#8d6748]">
              Handcrafted Haven
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href={profile?.role === 'seller' ? '/account/seller' : '/account/customer'}
                className="text-[#8d6748] hover:underline"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-[#8d6748] text-[#8d6748]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-[#8d6748] text-[#8d6748]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-[#8d6748] text-[#8d6748]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Management
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h2 className="text-2xl font-serif text-[#8d6748] font-bold mb-6">Profile Information</h2>
                
                {/* Profile Photo */}
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {photoPreview ? (
                      <Image src={photoPreview} alt="Profile" width={128} height={128} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400">No Photo</span>
                    )}
                  </div>
                  <label className="cursor-pointer bg-[#a3b18a] hover:bg-[#8d6748] text-white px-4 py-2 rounded-full transition-colors">
                    <span>Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a] resize-none h-20"
                    required
                  />
                </div>

                {/* Seller-specific fields */}
                {profile?.role === 'seller' && (
                  <>
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-[#8d6748] mb-4">Business Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                            Business Name
                          </label>
                          <input
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                            Business Address
                          </label>
                          <textarea
                            value={businessAddress}
                            onChange={(e) => setBusinessAddress(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a] resize-none h-20"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                            Business Description
                          </label>
                          <textarea
                            value={businessDescription}
                            onChange={(e) => setBusinessDescription(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a] resize-none h-24"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-[#a3b18a] hover:bg-[#8d6748] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full px-8 py-3 transition-colors"
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
                <h2 className="text-2xl font-serif text-[#8d6748] font-bold mb-6">Change Password</h2>
                
                <div>
                  <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]"
                    minLength={6}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#4d5c3a] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]"
                    minLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-[#a3b18a] hover:bg-[#8d6748] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full px-8 py-3 transition-colors"
                >
                  {isUpdating ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}

            {/* Account Management Tab */}
            {activeTab === 'account' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-serif text-[#8d6748] font-bold mb-6">Account Management</h2>
                
                {/* Account Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#8d6748] mb-4">Account Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Account Type:</strong> {profile?.role === 'seller' ? 'Seller' : 'Customer'}</p>
                    <p><strong>Member Since:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This action cannot be undone. This will permanently delete your account and remove all associated data.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type &quot;DELETE&quot; to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="w-full max-w-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                        placeholder="DELETE"
                      />
                    </div>
                    
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isUpdating || deleteConfirmation !== "DELETE"}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full px-6 py-2 transition-colors"
                    >
                      {isUpdating ? "Deleting..." : "Delete Account"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
