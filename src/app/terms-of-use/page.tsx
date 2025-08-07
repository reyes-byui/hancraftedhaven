"use client";

import Link from "next/link";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-[#f8f5f2] flex flex-col">
      <MainHeader />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-serif font-bold text-[#8d6748] mb-6">Terms of Use</h1>
          
          <div className="prose prose-lg max-w-none text-[#4d5c3a]">
            <p className="mb-6">
              By accessing and using Handcrafted Haven ("the Site"), you agree to comply with and be bound by the following terms and conditions. Please read them carefully before using the Site.
            </p>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">1. Use of Site:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>You may use this website for personal, non-commercial purposes only.</li>
              <li>You agree not to misuse the Site, attempt to gain unauthorized access, or interfere with its operation.</li>
              <li>Automated scraping, data mining, or use of bots is strictly prohibited.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">2. User Content:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>You are responsible for any content you post, including listings, reviews, comments, and messages.</li>
              <li>Do not post unlawful, offensive, defamatory, or misleading material.</li>
              <li>You grant Handcrafted Haven a non-exclusive, royalty-free license to use, display, and distribute your posted content for the purpose of operating and promoting the Site.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">3. Intellectual Property:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>All content, images, graphics, and trademarks on this Site are owned by Handcrafted Haven or its contributors unless otherwise stated.</li>
              <li>You may not copy, reproduce, modify, or distribute any content without prior written permission.</li>
              <li>You may not use our logo, branding, or trademarks for any purpose without consent.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">4. Account Security:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>Notify us immediately of any unauthorized use or suspected breach of your account.</li>
              <li>You agree not to share your account with others or create multiple accounts for fraudulent purposes.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">5. Purchases and Transactions:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>All sales and transactions are subject to our policies and may be subject to additional terms.</li>
              <li>Handcrafted Haven is a marketplace platform; we are not liable for disputes, damages, or losses arising from transactions between buyers and sellers.</li>
              <li>Users are responsible for ensuring the accuracy of listings and for resolving any disputes directly.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">6. Prohibited Activities:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>You may not use the Site for illegal activities, harassment, spamming, or to promote violence or discrimination.</li>
              <li>You may not upload viruses, malware, or any harmful code.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">7. Privacy:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Your use of the Site is also governed by our <Link href="/privacy-policy" className="text-[#8d6748] hover:underline">Privacy Policy</Link>. Please review it for details on how your information is collected and used.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">8. Changes to Terms:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Handcrafted Haven may update these terms at any time. We will notify users of significant changes, but it is your responsibility to review the terms regularly.</li>
              <li>Continued use of the Site after changes are posted constitutes acceptance of those changes.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">9. Termination:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>We reserve the right to suspend or terminate accounts that violate these terms, with or without notice.</li>
              <li>Termination may result in loss of access to your account and any content or data associated with it.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">10. Disclaimer and Limitation of Liability:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>The Site is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service or error-free operation.</li>
              <li>Handcrafted Haven is not responsible for any damages, losses, or claims arising from your use of the Site.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">11. Governing Law:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>These terms are governed by the laws of the jurisdiction in which Handcrafted Haven operates.</li>
            </ul>

            <p className="mt-8 p-4 bg-[#f8f5f2] rounded-lg border border-[#e7d7c1]">
              For questions or concerns, please contact us via the <Link href="/contact" className="text-[#8d6748] hover:underline">Contact page</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
