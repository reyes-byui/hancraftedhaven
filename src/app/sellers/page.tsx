import MainHeader from "../../components/MainHeader";
import Image from "next/image";

export default function SellersPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Sellers</h1>
        {/* Seller sign up, list, and chat features will go here */}
        <p className="mb-2">Sign up as a seller or basic user. View seller profiles, chat, and see product listings.</p>
        {/* TODO: Implement seller list and chat UI */}
      </main>
    </div>
  );
}
