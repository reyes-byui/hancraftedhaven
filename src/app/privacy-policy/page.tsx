"use client";

import Link from "next/link";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8f5f2] flex flex-col">
      <MainHeader />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-serif font-bold text-[#8d6748] mb-6">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-[#4d5c3a]">
            <p className="mb-6">
              Handcrafted Haven is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our website.
            </p>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">1. Information We Collect:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Personal information you provide when registering, making purchases, posting content, or contacting us (e.g., name, email, address).</li>
              <li>Usage data such as IP address, browser type, device information, and pages visited.</li>
              <li>Cookies and similar technologies to enhance your experience and analyze site usage.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">2. How We Use Your Information:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>To operate and improve the website and services.</li>
              <li>To process transactions, respond to inquiries, and provide customer support.</li>
              <li>To personalize your experience and deliver relevant content.</li>
              <li>To communicate updates, offers, and important notices (you may opt out of marketing communications).</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">3. Sharing Your Information:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>We do not sell your personal information.</li>
              <li>We may share information with service providers who help us operate the site (e.g., payment processors, hosting providers).</li>
              <li>We may disclose information if required by law, to protect our rights, or to comply with legal processes.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">4. Data Security:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>We use reasonable measures to protect your information from unauthorized access, loss, or misuse.</li>
              <li>However, no method of transmission or storage is completely secure; use the site at your own risk.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">5. Third-Party Links:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Our site may contain links to third-party websites. We are not responsible for their privacy practices. Please review their policies before providing information.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">6. Children&apos;s Privacy:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>The site is not intended for children under 13. We do not knowingly collect personal information from children.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">7. Changes to This Policy:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>We may update this Privacy Policy from time to time. Changes will be posted on this page, and your continued use of the site means you accept the updated policy.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">8. Contact Us:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>If you have questions or concerns about this Privacy Policy, please contact us via the <Link href="/contact" className="text-[#8d6748] hover:underline">Contact page</Link>.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
