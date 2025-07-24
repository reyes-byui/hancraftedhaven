
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f2] px-4">
      <Link href="/" className="absolute left-4 top-4" aria-label="Home">
        <Image src="/file.svg" alt="Home" width={32} height={32} className="hover:scale-110 transition-transform" />
      </Link>
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md mt-8">
        <h1 className="text-2xl font-serif text-[#8d6748] font-bold mb-6 text-center">Reset Your Password</h1>
        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[#4d5c3a] font-medium">Email</span>
            <input type="email" className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#bfa76a]" required />
          </label>
          <button type="submit" className="bg-[#a3b18a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-6 py-2 mt-2 transition-colors">Send Reset Link</button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <Link href="/login" className="text-[#8d6748] hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
