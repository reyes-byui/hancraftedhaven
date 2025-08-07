import Link from "next/link";
import MainHeader from "../../components/MainHeader";
import Footer from "../../components/Footer";

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
      <Footer />
    </div>
  );
}
