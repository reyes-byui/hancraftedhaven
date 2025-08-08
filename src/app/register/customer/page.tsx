"use client";

import Link from "next/link";
import { useState } from "react";
import { signUpCustomer } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";

export default function CustomerRegisterPage() {
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
      const { data, error } = await signUpCustomer(email, password);

      if (error) {
        setError(error);
      } else if (data?.user) {
        // Show success message and redirect to login
        alert("Registration successful! Please check your email to verify your account. You can complete your profile later through your account settings.");
        router.push("/login/customer");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      <MainHeader />
      
      <div className="flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-serif text-[#8d6748] font-bold mb-6 text-center">Create Customer Account</h1>
          
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
              className="border rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" 
              required 
            />
          </label>
          
          <label className="flex flex-col gap-1">
            <span className="text-[#4d5c3a] font-medium">Password</span>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" 
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
              className="border rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" 
              required 
              minLength={6}
            />
          </label>
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#a3b18a] hover:bg-[#8d6748] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-full px-6 py-2 mt-2 transition-colors"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        
        <div className="flex justify-between mt-4 text-sm">
          <Link href="/login/customer" className="text-[#8d6748] hover:underline">Already have an account?</Link>
          <Link href="/register/seller" className="text-[#8d6748] hover:underline">Register as Seller</Link>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
