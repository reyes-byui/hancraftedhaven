

import MainHeader from "../components/MainHeader";
import Image from "next/image";
import Link from "next/link";

const topSellers = [
  {
    name: "Artisan Alice",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1520207588543-1e545b20c19e?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Craftsman Bob",
    country: "UK",
    image:
      "https://images.unsplash.com/photo-1521799022345-481a897e45ca?q=80&w=929&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Maker Mia",
    country: "Canada",
    image:
      "https://images.unsplash.com/photo-1719154717749-0d05f61a0588?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const craftImage = "https://images.unsplash.com/photo-1661185152130-4214a30ced36?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const topCrafts = [
  { name: "Hand-thrown Vase", category: "Ceramics", seller: "Artisan Alice", image: craftImage },
  { name: "Woven Scarf", category: "Textiles", seller: "Maker Mia", image: craftImage },
  { name: "Wooden Bowl", category: "Woodworking", seller: "Craftsman Bob", image: craftImage },
  { name: "Silver Pendant", category: "Jewelry", seller: "Artisan Alice", image: craftImage },
  { name: "Stained Glass Panel", category: "Glasswork", seller: "Maker Mia", image: craftImage },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header: Logo and Navigation */}
      <MainHeader />

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center px-4 py-12 gap-12">
        {/* Top Sellers Gallery */}
        <section className="max-w-4xl w-full mb-8">
          <h2 className="text-3xl font-serif font-bold text-[#8d6748] mb-8 text-center">Top Sellers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topSellers.map((seller) => (
              <div key={seller.name} className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-[#a3b18a]">
                <Image src={seller.image} alt={seller.name} width={120} height={120} className="mb-4 rounded-full object-cover" />
                <span className="font-bold text-[#8d6748]">{seller.name}</span>
                <span className="text-[#4d5c3a] text-sm">{seller.country}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Top Crafts Gallery */}
        <section className="max-w-4xl w-full">
          <h2 className="text-3xl font-serif font-bold text-[#8d6748] mb-8 text-center">Top Crafts</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {topCrafts.map((craft) => (
              <div key={craft.name} className="bg-white rounded-xl shadow p-6 flex flex-col items-start border-t-4 border-[#e07a5f]">
                <Image src={craft.image} alt={craft.name} width={160} height={160} className="mb-4 rounded-lg object-cover" />
                <span className="font-bold text-[#8d6748] text-left">{craft.name}</span>
                <span className="text-[#4d5c3a] text-sm text-left">{craft.category}</span>
                <span className="text-[#4d5c3a] text-xs text-left">by {craft.seller}</span>
              </div>
            ))}
          </div>
        </section>

        {/* About Section (Full Width, Below Top Crafts) */}
        <section className="w-full bg-white rounded-xl shadow p-8 mt-12 border-t-4 border-[#bfa76a]">
          <h2 className="text-3xl font-serif font-bold text-[#8d6748] mb-6 text-center">About Handcrafted Haven</h2>
          <div className="max-w-5xl mx-auto">
            <p className="text-[#4d5c3a] text-lg mb-2">Handcrafted Haven is a vibrant virtual marketplace designed to bridge the gap between talented artisans and conscious consumers.</p>
            <p className="text-[#4d5c3a] mb-2">Here, you can explore a diverse collection of unique, handcrafted creations, each telling its own story and reflecting the skill and passion of its maker. Our platform empowers independent artists by providing them with a space to showcase their work, while helping buyers discover meaningful products that support ethical craftsmanship and sustainable practices.</p>
            <p className="text-[#4d5c3a] mb-2">Join us to celebrate creativity, support small businesses, and find one-of-a-kind treasures that enrich your life and community.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold text-[#8d6748] mb-2">Mission</h3>
                <p className="text-[#4d5c3a] text-sm">Our mission is to foster a thriving community where artisans can share their craft, connect with passionate collectors, and promote ethical, sustainable artistry.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#8d6748] mb-2">Vision</h3>
                <p className="text-[#4d5c3a] text-sm">Our vision is to become the leading online destination for handcrafted goods, inspiring a global movement that values artistry, authenticity, and sustainability.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#8d6748] mb-2">Why Choose Us</h3>
                <ul className="list-disc ml-4 text-[#4d5c3a] text-sm">
                  <li>Authenticity Guaranteed</li>
                  <li>Support Independent Artists</li>
                  <li>Ethical & Sustainable</li>
                  <li>Curated Selection</li>
                  <li>Community Focused</li>
                  <li>Secure & Seamless Shopping</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#e7d7c1] py-6 flex flex-col items-center text-[#8d6748] text-sm mt-auto">
        <span>&copy; {new Date().getFullYear()} Handcrafted Haven. All rights reserved.</span>
        <nav className="flex gap-4 mt-2">
          <Link href="/" className="hover:underline focus:underline">Home</Link>
          <Link href="/sellers" className="hover:underline focus:underline">Sellers</Link>
          <Link href="/listings" className="hover:underline focus:underline">Listings</Link>
          <Link href="/about" className="hover:underline focus:underline">About</Link>
          <Link href="/contact" className="hover:underline focus:underline">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
