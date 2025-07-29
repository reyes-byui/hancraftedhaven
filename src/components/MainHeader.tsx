import Image from "next/image";
import Link from "next/link";

export default function MainHeader() {
  return (
    <header className="w-full flex items-center justify-between px-8 py-6 bg-white">
      <div className="flex items-center gap-4">
        <Image src="/logo.png" alt="Handcrafted Haven Logo" width={96} height={96} />
        <span className="text-3xl font-serif font-bold text-[#8d6748]">Handcrafted Haven</span>
      </div>
      <nav className="flex gap-6 text-lg font-medium">
        <Link href="/" className="text-[#8d6748] hover:underline">Home</Link>
        <Link href="/sellers" className="text-[#8d6748] hover:underline">Sellers</Link>
        <Link href="/listings" className="text-[#8d6748] hover:underline">Listings</Link>
        <Link href="/about" className="text-[#8d6748] hover:underline">About</Link>
        <Link href="/contact" className="text-[#8d6748] hover:underline">Contact</Link>
      </nav>
      <div>
        <Link href="/login" className="bg-[#a3b18a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-6 py-2 shadow-lg transition-colors">Log In</Link>
      </div>
    </header>
  );
}
