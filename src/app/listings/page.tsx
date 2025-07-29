import MainHeader from "../../components/MainHeader";
import Image from "next/image";

export default function ListingsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Listings</h1>
        {/* Gallery of crafts by category */}
        <p className="mb-2">Browse crafts by category, seller, price, and more.</p>
        {/* TODO: Implement listings gallery UI */}
      </main>
    </div>
  );
}
