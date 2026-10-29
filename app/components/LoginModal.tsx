"use client";

import React, { useState } from "react";
import { supabase } from "../supabase";
import { X, Loader2, ShieldCheck } from "lucide-react";

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/checkout`, // Login ke baad kahan bhejna hai
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login error:", error.message);
      alert("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8 text-center">
          {/* Logo / Icon */}
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-pink-100">
            <ShieldCheck className="w-10 h-10 text-[#e8416d]" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">Secure Checkout</h2>
          <p className="text-sm text-gray-500 mb-8">
            Please login with your Google account to save your address and track your order easily.
          </p>

          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl text-lg hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
            )}
            {isLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <p className="text-[11px] text-gray-400 mt-6 flex items-center justify-center gap-1">
            We promise not to spam your inbox. 
          </p>
        </div>
      </div>
    </div>
  );
}
