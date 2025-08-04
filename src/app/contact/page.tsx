import Link from "next/link";
import MainHeader from "../../components/MainHeader";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Contact</h1>
        {/* Messaging form */}
        <p className="mb-2">Send us a message or inquiry using the form below.</p>
        {/* TODO: Implement contact form UI */}
      </main>
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
