import MainHeader from "../../components/MainHeader";
import Image from "next/image";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MainHeader />
      <main className="flex-1 py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">Community</h1>
        {/* Community chatbox for logged in users */}
        <p className="mb-2">Join the community chat and connect with other artisans and buyers.</p>
        {/* TODO: Implement chatbox UI */}
      </main>
    </div>
  );
}
