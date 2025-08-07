import Link from "next/link";
import MainHeader from "../../components/MainHeader";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">About Handcrafted Haven</h1>
        {/* Image carousel, mission, vision, why choose us */}
        <p className="mb-2">Learn about our mission, vision, and what makes Handcrafted Haven unique.</p>
        {/* TODO: Implement about section UI */}
      </main>
      <Footer />
    </div>
  );
}
