"use client";

import Link from "next/link";
import MainHeader from "@/components/MainHeader";
import Footer from "@/components/Footer";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#f8f5f2] flex flex-col">
      <MainHeader />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-serif font-bold text-[#8d6748] mb-6">Disclaimer</h1>
          
          <div className="prose prose-lg max-w-none text-[#4d5c3a]">
            <p className="mb-6">
              Handcrafted Haven provides this website and its content for informational and marketplace purposes only. By using the Site, you acknowledge and agree to the following:
            </p>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">1. No Professional Advice:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>The Site does not provide legal, financial, or professional advice. All information, listings, and content are for general informational purposes only.</li>
              <li>You should consult qualified professionals for advice specific to your situation.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">2. Marketplace Risks:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Transactions between buyers and sellers are conducted at your own risk. Handcrafted Haven does not guarantee the quality, safety, legality, or authenticity of any products or services listed.</li>
              <li>We are not responsible for disputes, damages, or losses resulting from marketplace interactions.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">3. Third-Party Content:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>The Site may contain links or references to third-party websites and content. We do not endorse or control these sites and are not responsible for their practices or content.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">4. No Warranties:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>The Site is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not warrant that the Site will be error-free, secure, or continuously available.</li>
            </ul>

            <h2 className="text-xl font-semibold text-[#8d6748] mt-8 mb-4">5. Limitation of Liability:</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Handcrafted Haven is not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Site.</li>
            </ul>

            <p className="mt-8 p-4 bg-[#f8f5f2] rounded-lg border border-[#e7d7c1]">
              If you have questions about this Disclaimer, please contact us via the <Link href="/contact" className="text-[#8d6748] hover:underline">Contact page</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
