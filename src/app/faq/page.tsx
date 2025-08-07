"use client";

import Link from "next/link";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#f8f5f2] flex flex-col">
      <MainHeader />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-serif font-bold text-[#8d6748] mb-6">Frequently Asked Questions</h1>
          
          <div className="space-y-8">
            <div className="border-b border-[#e7d7c1] pb-6">
              <h2 className="text-xl font-semibold text-[#8d6748] mb-3">1. What is Handcrafted Haven?</h2>
              <p className="text-[#4d5c3a]">
                Handcrafted Haven is an online marketplace for artisans and buyers to connect, discover, and purchase unique handmade goods.
              </p>
            </div>

            <div className="border-b border-[#e7d7c1] pb-6">
              <h2 className="text-xl font-semibold text-[#8d6748] mb-3">2. How do I create an account?</h2>
              <p className="text-[#4d5c3a]">
                Click the Register link in the navigation menu and follow the instructions to sign up. You'll need a valid email address.
              </p>
            </div>

            <div className="border-b border-[#e7d7c1] pb-6">
              <h2 className="text-xl font-semibold text-[#8d6748] mb-3">3. How do I list my products?</h2>
              <p className="text-[#4d5c3a]">
                After registering and logging in, navigate to the Sellers section and follow the prompts to create a new listing. Provide clear photos, descriptions, and pricing.
              </p>
            </div>

            <div className="border-b border-[#e7d7c1] pb-6">
              <h2 className="text-xl font-semibold text-[#8d6748] mb-3">4. What payment methods are accepted?</h2>
              <p className="text-[#4d5c3a]">
                Payment options may vary by seller. Most sellers accept major credit cards and secure payment platforms. Please review each listing for details.
              </p>
            </div>

            <div className="border-b border-[#e7d7c1] pb-6">
              <h2 className="text-xl font-semibold text-[#8d6748] mb-3">5. How do I contact a seller or resolve a dispute?</h2>
              <p className="text-[#4d5c3a]">
                Use the messaging feature on the Site to contact sellers directly. For disputes, communicate with the seller first. If unresolved, contact Handcrafted Haven support via the Contact page.
              </p>
            </div>

            <div className="border-b border-[#e7d7c1] pb-6">
              <h2 className="text-xl font-semibold text-[#8d6748] mb-3">6. Is my personal information safe?</h2>
              <p className="text-[#4d5c3a]">
                We take privacy seriously. Please review our <Link href="/privacy-policy" className="text-[#8d6748] hover:underline">Privacy Policy</Link> for details on how your information is collected, used, and protected.
              </p>
            </div>

            <div className="border-b border-[#e7d7c1] pb-6">
              <h2 className="text-xl font-semibold text-[#8d6748] mb-3">7. Can I delete my account?</h2>
              <p className="text-[#4d5c3a]">
                Yes. Go to your account settings and follow the instructions to delete your account. Note that this action is permanent and cannot be undone.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[#8d6748] mb-3">8. Who do I contact for support or questions?</h2>
              <p className="text-[#4d5c3a]">
                Visit the <Link href="/contact" className="text-[#8d6748] hover:underline">Contact page</Link> to reach our support team. We're here to help!
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
