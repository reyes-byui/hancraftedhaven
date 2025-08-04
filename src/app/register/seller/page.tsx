"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { signUpSeller } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SellerRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUpSeller(email, password);

      if (error) {
        setError(error);
      } else if (data?.user) {
        // Redirect to profile completion page
        router.push(`/profile-setup/seller?user_id=${data.user.id}`);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f2] px-4 py-8">
      <Link href="/" className="absolute left-4 top-4" aria-label="Home">
        <Image src="/file.svg" alt="Home" width={32} height={32} className="hover:scale-110 transition-transform" />
      </Link>
      
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md mt-8">
        <h1 className="text-2xl font-serif text-[#8d6748] font-bold mb-6 text-center">Create Seller Account</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[#4d5c3a] font-medium">Email</span>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" 
              required 
            />
          </label>
          
          <label className="flex flex-col gap-1">
            <span className="text-[#4d5c3a] font-medium">Password</span>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" 
              required 
              minLength={6}
            />
          </label>
          
          <label className="flex flex-col gap-1">
            <span className="text-[#4d5c3a] font-medium">Confirm Password</span>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" 
              required 
              minLength={6}
            />
          </label>
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#bfa76a] hover:bg-[#8d6748] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full px-6 py-2 mt-2 transition-colors"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        
        <div className="flex justify-between mt-4 text-sm">
          <Link href="/login/seller" className="text-[#8d6748] hover:underline">Already have an account?</Link>
          <Link href="/register/customer" className="text-[#8d6748] hover:underline">Register as Customer</Link>
        </div>
      </div>
    </div>
  );
}
