"use client";

import React, { useState } from "react";
import { MapPin, User, Phone, Home, Briefcase, Building, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "../supabase"; // Apna supabase path check kar lena

export default function AddressForm({ onAddressSaved }: { onAddressSaved?: (address: any) => void }) {
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    pincode: "",
    state: "",
    city: "",
    detailed_address: "",
    address_type: "Home",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .insert([
          {
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            pincode: formData.pincode,
            state: formData.state,
            city: formData.city,
            detailed_address: formData.detailed_address,
            address_type: formData.address_type,
            // user_id: "Yahan aage chalkar Google Auth ka ID aayega"
          }
        ])
        .select();

      if (error) throw error;

      setIsSuccess(true);
      if (onAddressSaved && data) {
        onAddressSaved(data[0]); // Checkout page ko batane ke liye ki address save ho gaya
      }
      
    } catch (error: any) {
      console.error("Address save error:", error.message);
      alert("Address save nahi ho paya, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-green-800">Address Saved Successfully!</h3>
        <p className="text-sm text-green-600 mt-1">We will deliver your cake to this location.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto">
      <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-[#e8416d]" /> Delivery Details
      </h2>

      <form onSubmit={handleSaveAddress} className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="relative">
            <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} placeholder="Full Name" required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e8416d] focus:bg-white transition-all" />
          </div>
          <div className="relative">
            <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="Phone Number (10 digits)" required pattern="[0-9]{10}" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e8416d] focus:bg-white transition-all" />
          </div>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-2 gap-3">
          <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Pincode" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e8416d] focus:bg-white transition-all" />
          <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e8416d] focus:bg-white transition-all" />
        </div>
        
        <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e8416d] focus:bg-white transition-all" />

        {/* Detailed Address */}
        <div className="relative">
          <Building className="w-5 h-5 absolute left-3 top-4 text-gray-400" />
          <textarea name="detailed_address" value={formData.detailed_address} onChange={handleInputChange} placeholder="House No, Building, Street, Area" required rows={3} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e8416d] focus:bg-white transition-all resize-none"></textarea>
        </div>

        {/* Address Type Selection */}
        <div>
          <label className="text-xs font-bold text-gray-500 mb-2 block">Save address as</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setFormData({ ...formData, address_type: "Home" })} className={`flex-1 py-2.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.address_type === "Home" ? "bg-pink-50 border-pink-500 text-[#e8416d]" : "bg-white border-gray-200 text-gray-600"}`}>
              <Home className="w-4 h-4" /> Home
            </button>
            <button type="button" onClick={() => setFormData({ ...formData, address_type: "Work" })} className={`flex-1 py-2.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.address_type === "Work" ? "bg-pink-50 border-pink-500 text-[#e8416d]" : "bg-white border-gray-200 text-gray-600"}`}>
              <Briefcase className="w-4 h-4" /> Work
            </button>
          </div>
        </div>

        <button disabled={isLoading} type="submit" className="w-full bg-[#10B981] disabled:bg-gray-400 text-white font-black py-4 rounded-xl text-lg shadow-lg hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
          {isLoading ? "SAVING ADDRESS..." : "SAVE & PROCEED TO PAYMENT"}
        </button>
      </form>
    </div>
  );
}
