"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { completeCustomerProfile, uploadProfilePhotoOnly, getCurrentUser } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function CustomerProfileSetup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('user_id');

  useEffect(() => {
    if (!userId) {
      router.push('/register');
    } else {
      // Get current user to fetch email
      getCurrentUser().then(({ user }) => {
        if (user?.email) {
          setUserEmail(user.email);
        }
      });
    }
  }, [userId, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !country.trim() || !address.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (!userId) {
      setError("Invalid user session");
      return;
    }

    setLoading(true);

    try {
      // Upload photo first if provided
      let photoUrl = "";
      if (profilePhoto) {
        const { data: uploadData, error: uploadError } = await uploadProfilePhotoOnly(userId, profilePhoto);
        if (uploadError) {
          console.error("Photo upload failed:", uploadError);
        } else {
          photoUrl = uploadData || "";
        }
      }

      // Complete profile with photo URL
      const { data, error } = await completeCustomerProfile(userId, {
        first_name: firstName,
        last_name: lastName,
        email: userEmail,
        country,
        address,
        contact_number: contactNumber || undefined,
        photo_url: photoUrl || undefined,
      });

      if (error) {
        setError(error);
        return;
      }

      // Redirect to customer dashboard
      router.push("/account/customer");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f2] px-4 py-8">
      <Link href="/" className="absolute left-4 top-4" aria-label="Home">
        <Image src="/file.svg" alt="Home" width={32} height={32} className="hover:scale-110 transition-transform" />
      </Link>
      
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md mt-8">
        <h1 className="text-2xl font-serif text-[#8d6748] font-bold mb-6 text-center">Complete Your Profile</h1>
        <p className="text-[#4d5c3a] text-center mb-6">Please provide your information to get started</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">Photo</span>
              )}
            </div>
            <label className="cursor-pointer bg-[#a3b18a] hover:bg-[#8d6748] text-white px-4 py-2 rounded-full transition-colors">
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-[#4d5c3a] font-medium">First Name *</span>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" 
                required 
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[#4d5c3a] font-medium">Last Name *</span>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" 
                required 
              />
            </label>
          </div>
          
          <label className="flex flex-col gap-1">
            <span className="text-[#4d5c3a] font-medium">Country *</span>
            <input 
              type="text" 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" 
              required 
              placeholder="e.g., United States"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[#4d5c3a] font-medium">Address *</span>
            <textarea 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a] resize-none h-20" 
              required
              placeholder="Your full address"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[#4d5c3a] font-medium">Contact Number</span>
            <input 
              type="tel" 
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" 
              placeholder="Your phone number"
            />
          </label>
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#a3b18a] hover:bg-[#8d6748] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full px-6 py-3 mt-4 transition-colors"
          >
            {loading ? "Completing Profile..." : "Complete Profile"}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          * Required fields
        </p>
      </div>
    </div>
  );
}
