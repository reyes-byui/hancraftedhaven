
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f5f2] flex flex-col font-sans">
      {/* Hero Section */}
      <header className="w-full bg-gradient-to-b from-[#e7d7c1] to-[#f8f5f2] py-12 px-4 flex flex-col items-center text-center relative">
        {/* Auth Button Top Right */}
        <div className="absolute right-4 top-4">
          <div className="group relative inline-block text-left">
            <button className="bg-[#a3b18a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-6 py-2 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#a3b18a] focus:ring-offset-2">
              Log In / Sign Up
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-[#e7d7c1]">
              <a href="/login" className="block px-4 py-2 text-[#8d6748] hover:bg-[#f8f5f2] hover:underline">Login</a>
              <a href="/register" className="block px-4 py-2 text-[#8d6748] hover:bg-[#f8f5f2] hover:underline">Sign Up</a>
              <a href="/forgot-password" className="block px-4 py-2 text-[#8d6748] hover:bg-[#f8f5f2] hover:underline">Forgot Password?</a>
            </div>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-serif text-[#8d6748] font-bold mb-4 drop-shadow-sm">
          Handcrafted Haven
        </h1>
        <h2 className="text-2xl md:text-3xl font-serif text-[#8d6748] font-bold mb-4">
          Welcome to the world of artisanal craftsmanship!
        </h2>
        <p className="max-w-2xl text-lg md:text-2xl text-[#4d5c3a] mb-6 font-light">
          A virtual marketplace connecting artisans and conscious consumers. Discover, support, and celebrate unique handcrafted creations.
        </p>
        <a
          href="#explore"
          className="inline-block bg-[#bfa76a] hover:bg-[#a88b4a] text-white font-semibold rounded-full px-8 py-3 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#bfa76a] focus:ring-offset-2"
        >
          Explore the Marketplace
        </a>
      </header>

      {/* Features Section */}
      <main className="flex-1 w-full flex flex-col items-center px-4 py-12 gap-16" id="explore">
        <section className="max-w-5xl w-full grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-[#bfa76a]">
            <Image src="/file.svg" alt="Seller Profiles" width={48} height={48} className="mb-4" />
            <h2 className="font-serif text-xl text-[#8d6748] font-bold mb-2">Seller Profiles</h2>
            <p className="text-[#4d5c3a] text-center text-base">
              Artisans share their stories, showcase their craft, and manage their collections in beautiful, personalized profiles.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-[#a3b18a]">
            <Image src="/window.svg" alt="Product Listings" width={48} height={48} className="mb-4" />
            <h2 className="font-serif text-xl text-[#4d5c3a] font-bold mb-2">Product Listings</h2>
            <p className="text-[#4d5c3a] text-center text-base">
              Browse, filter, and discover unique handcrafted items with detailed descriptions, high-quality images, and easy navigation.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-[#e07a5f]">
            <Image src="/globe.svg" alt="Community & Reviews" width={48} height={48} className="mb-4" />
            <h2 className="font-serif text-xl text-[#e07a5f] font-bold mb-2">Community & Reviews</h2>
            <p className="text-[#4d5c3a] text-center text-base">
              Foster trust and connection with ratings, reviews, and a vibrant community of creators and supporters.
            </p>
          </div>
        </section>

        {/* Community Section */}
        <section className="max-w-4xl w-full flex flex-col items-center text-center gap-6">
          <h2 className="font-serif text-2xl md:text-3xl text-[#8d6748] font-bold">Join a Community of Makers & Supporters</h2>
          <p className="text-[#4d5c3a] text-lg max-w-2xl">
            Handcrafted Haven is more than a marketplace&mdash;it&apos;s a movement for sustainable consumption, local artistry, and meaningful connections. Whether you&apos;re a creator or a conscious shopper, you&apos;ll find your place here.
          </p>
        </section>

        {/* Call to Action */}
        <section className="w-full flex flex-col items-center gap-4 mt-8">
          <a
            href="#"
            className="bg-[#a3b18a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-8 py-3 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#a3b18a] focus:ring-offset-2"
            aria-label="Sign up as an artisan or shopper"
          >
            Get Started
          </a>
          <span className="text-[#bfa76a] font-serif text-lg">Support local. Shop unique. Make a difference.</span>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#e7d7c1] py-6 flex flex-col items-center text-[#8d6748] text-sm mt-auto">
        <span>&copy; {new Date().getFullYear()} Handcrafted Haven. All rights reserved.</span>
        <nav className="flex gap-4 mt-2">
          <a href="#explore" className="hover:underline focus:underline">Marketplace</a>
          <a href="#" className="hover:underline focus:underline">About</a>
          <a href="#" className="hover:underline focus:underline">Contact</a>
        </nav>
      </footer>
    </div>
  );
}
