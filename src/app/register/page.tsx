
import Link from "next/link";
import MainHeader from "@/components/MainHeader";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      <MainHeader />
      
      <div className="flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-serif text-[#8d6748] font-bold mb-6 text-center">Join Handcrafted Haven</h1>
          
          <div className="flex flex-col gap-4">
            <div className="text-center mb-6">
              <p className="text-[#4d5c3a] text-lg">Choose your account type:</p>
            </div>

            <Link 
              href="/register/customer"
              className="bg-[#a3b18a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-6 py-4 text-center transition-colors shadow-lg"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-lg">Register as Customer</span>
                <span className="text-sm opacity-90">Shop for handcrafted items</span>
              </div>
            </Link>

            <Link 
              href="/register/seller"
              className="bg-[#bfa76a] hover:bg-[#8d6748] text-white font-semibold rounded-full px-6 py-4 text-center transition-colors shadow-lg"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-lg">Register as Seller</span>
                <span className="text-sm opacity-90">Sell your handcrafted creations</span>
              </div>
            </Link>
          </div>

          <div className="flex justify-center mt-6 text-sm">
            <Link href="/login" className="text-[#8d6748] hover:underline">Already have an account? Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
