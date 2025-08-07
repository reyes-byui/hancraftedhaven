"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#e7d7c1] py-6 flex flex-col items-center text-[#8d6748] text-sm mt-auto">
      <span>&copy; {new Date().getFullYear()} Handcrafted Haven. All rights reserved.</span>
      <nav className="flex gap-4 mt-2">
        <Link href="/disclaimer" className="hover:underline focus:underline">Disclaimer</Link>
        <Link href="/faq" className="hover:underline focus:underline">FAQ</Link>
        <Link href="/privacy-policy" className="hover:underline focus:underline">Privacy Policy</Link>
        <Link href="/terms-of-use" className="hover:underline focus:underline">Terms of Use</Link>
        <Link href="/contact" className="hover:underline focus:underline">Support</Link>
        <Link href="/community" className="hover:underline focus:underline">Community</Link>
      </nav>
    </footer>
  );
}
