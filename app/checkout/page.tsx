"use client";

import React, { useState } from "react";
import AddressForm from "../components/AddressForm"; 
import { useCartStore } from "../store/cartStore"; 
import { supabase } from "../supabase";
import { 
  ArrowLeft, ShieldCheck, Cake, MapPin, Check, ChevronDown, 
  Smartphone, CheckCircle2, Sparkles, Clock, Truck, Award, Loader2, QrCode
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cartItems, deliveryDate, deliveryTime, clearCart } = useCartStore() as any;
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [savedAddress, setSavedAddress] = useState<any>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  // ==========================================
  // ⚠️ APNA ASLI UPI ID YAHAN DALEIN
  // ==========================================
  const MERCHANT_UPI_ID = "yourname@ybl"; 
  const MERCHANT_NAME = "Royal Digital Cakes";

  const cartTotal = cartItems?.reduce((total: number, item: any) => total + (item.price * (item.quantity || 1)), 0) || 0;
  const mrpTotal = Math.round(cartTotal * 1.22);
  const totalSavings = mrpTotal - cartTotal;

  const upiDeepLink = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${cartTotal}&cu=INR&tn=${encodeURIComponent("Cake Order Payment")}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiDeepLink)}`;

  const handleAddressSaved = (addressData: any) => {
    setSavedAddress(addressData);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (utrNumber.trim().length < 12) {
      alert("Bhai, kripya sahi 12-digit ka UTR / Reference Number dalein!");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            address_id: savedAddress?.id || null,
            cart_items: cartItems,
            total_amount: cartTotal,
            payment_method: "UPI",
            utr_number: utrNumber.trim(),
            order_status: "Payment Verification Pending",
          }
        ])
        .select();

      if (error) throw error;

      setOrderSuccessData(data ? data[0] : { id: Math.floor(100000 + Math.random() * 900000) });
    } catch (error: any) {
      console.error("Order Submit Error:", error.message);
      alert("Order save karne me dikkat aayi: " + error.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if ((!cartItems || cartItems.length === 0) && !orderSuccessData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
        <Cake className="w-20 h-20 text-pink-200 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-gray-800">Your Cart is Empty!</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">Chaliye pehle ek meetha sa cake pasand karte hain.</p>
        <Link href="/" className="bg-[#e8416d] text-white px-8 py-3.5 rounded-xl font-black shadow-lg hover:bg-pink-600 transition-all">
          EXPLORE CAKES
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 font-sans text-gray-800">
      
      {/* 1. TOP HEADER + WINNI STYLE STEPPER BAR */}
      <div className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          <button 
            onClick={() => step === 2 ? setStep(1) : router.back()} 
            className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === 1 
                  ? "bg-[#e8416d] text-white ring-4 ring-pink-100" 
                  : "bg-green-500 text-white"
              }`}>
                {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : "1"}
              </div>
              <span className={`text-xs sm:text-sm font-bold ${step === 1 ? "text-[#e8416d]" : "text-green-600"}`}>
                Address
              </span>
            </div>

            <div className={`w-8 sm:w-14 h-0.5 transition-all ${step === 2 ? "bg-green-500" : "bg-gray-200"}`} />

            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === 2 
                  ? "bg-[#e8416d] text-white ring-4 ring-pink-100" 
                  : "bg-gray-200 text-gray-500"
              }`}>
                2
              </div>
              <span className={`text-xs sm:text-sm font-bold ${step === 2 ? "text-[#e8416d]" : "text-gray-400"}`}>
                Payment
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">100% Secure</span>
          </div>
        </div>
      </div>

      {/* 2. MOBILE COLLAPSIBLE ORDER SUMMARY */}
      <div className="lg:hidden bg-pink-50/70 border-b border-pink-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <button 
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🎂</span>
              <div>
                <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  Order Summary ({cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'})
                  <ChevronDown className={`w-4 h-4 text-[#e8416d] transition-transform duration-300 ${isSummaryOpen ? "rotate-180" : ""}`} />
                </p>
                <p className="text-[11px] text-green-600 font-semibold">
                  You save ₹{totalSavings} • Delivery: {deliveryDate || "Today"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-gray-900">₹{cartTotal}</span>
              <span className="block text-[10px] text-gray-400 line-through">₹{mrpTotal}</span>
            </div>
          </button>

          {isSummaryOpen && (
            <div className="mt-3 pt-3 border-t border-pink-200/60 space-y-3">
              {cartItems.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 bg-white p-2.5 rounded-xl border border-pink-100">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover border" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-xs">{item.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      {item.weight} {item.isEggless ? "• Eggless" : ""} {item.isHeartShape ? "• Heart" : ""}
                    </p>
                    <p className="text-xs font-black text-[#e8416d] mt-1">₹{item.price} x {item.quantity || 1}</p>
                  </div>
                </div>
              ))}
              {deliveryTime && (
                <div className="text-xs bg-white p-2.5 rounded-xl border border-pink-100 flex justify-between font-semibold text-gray-700">
                  <span>⏰ Selected Slot:</span>
                  <span className="text-[#e8416d]">{deliveryDate}, {deliveryTime}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="max-w-6xl mx-auto px-4 mt-4 lg:mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <div className="w-full lg:w-7/12">
            {step === 1 ? (
              <div>
                <div className="mb-3 flex items-center justify-between max-w-lg mx-auto">
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-gray-900">Where to deliver? 📍</h1>
                    <p className="text-xs text-gray-500">Enter accurate details for hassle-free cake delivery</p>
                  </div>
                </div>
                <AddressForm onAddressSaved={handleAddressSaved} />
              </div>
            ) : (
              <div className="max-w-lg mx-auto space-y-4">
                
                {savedAddress && (
                  <div className="bg-white p-4 rounded-2xl border border-green-200 shadow-sm flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="bg-green-100 p-2 rounded-full text-green-600 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                            {savedAddress.address_type || "Home"}
                          </span>
                          <span className="text-sm font-bold text-gray-900">{savedAddress.full_name}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                          {savedAddress.detailed_address}, {savedAddress.city} - {savedAddress.pincode}
                        </p>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">📞 {savedAddress.phone_number}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setStep(1)} 
                      className="text-xs font-bold text-[#e8416d] hover:underline flex-shrink-0"
                    >
                      Change
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#e8416d] to-pink-500 p-4 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-bold opacity-90">Instant Zero-Fee UPI</span>
                      <h2 className="text-lg font-black">Pay ₹{cartTotal} via UPI</h2>
                    </div>
                    <Smartphone className="w-8 h-8 opacity-90" />
                  </div>

                  <div className="p-5 space-y-6">
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Tap below to open your UPI App (Mobile)
                      </p>
                      
                      <a 
                        href={upiDeepLink}
                        className="w-full bg-[#10B981] hover:bg-green-600 active:scale-95 text-white font-black py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 text-base transition-all"
                      >
                        <Sparkles className="w-5 h-5" />
                        PAY ₹{cartTotal} ON PHONEPE / GPAY / PAYTM
                      </a>
                      <p className="text-[11px] text-gray-400 mt-2">
                        Amount ₹{cartTotal} will be auto-filled in your payment app
                      </p>
                    </div>

                    <div className="border-t border-b border-gray-100 py-4 text-center">
                      <p className="text-xs font-bold text-gray-600 mb-3 flex items-center justify-center gap-1.5">
                        <QrCode className="w-4 h-4 text-[#e8416d]" /> Or Scan QR Code with any UPI App
                      </p>
                      <div className="inline-block p-3 bg-white border-2 border-dashed border-pink-200 rounded-2xl">
                        <img src={qrCodeUrl} alt="UPI QR Code" className="w-40 h-40 mx-auto" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-50 inline-block px-3 py-1 rounded-full border">
                        UPI ID: <strong className="text-gray-800">{MERCHANT_UPI_ID}</strong>
                      </p>
                    </div>

                    <form onSubmit={handleConfirmOrder} className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                        <label className="block text-xs font-black text-amber-900 uppercase mb-1">
                          Step 2: Enter 12-Digit UTR / Ref No. *
                        </label>
                        <p className="text-[11px] text-amber-700 mb-2.5">
                          Payment karne ke baad PhonePe/GPay screen par dikhne wala 12-ank ka UTR ya Reference number yahan dalein:
                        </p>
                        <input 
                          type="text" 
                          required
                          maxLength={16}
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ex: 412389456120 (12 Digits)"
                          className="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-xl text-base font-mono font-bold tracking-widest text-gray-900 outline-none focus:border-[#e8416d] transition-all"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={isSubmittingOrder || utrNumber.length < 12}
                        className="w-full bg-[#e8416d] disabled:bg-gray-300 disabled:text-gray-500 text-white font-black py-4 rounded-xl text-lg shadow-lg hover:bg-pink-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmittingOrder ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" /> VERIFYING & PLACING ORDER...
                          </>
                        ) : (
                          <>SUBMIT UTR & CONFIRM ORDER</>
                        )}
                      </button>
                    </form>

                  </div>
                </div>

              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRICE DETAILS & TRUST BADGES */}
          <div className="w-full lg:w-5/12 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
              <h2 className="text-base font-black text-gray-900 mb-4 border-b pb-3">
                Price Details ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})
              </h2>

              <div className="hidden lg:block space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item: any, index: number) => (
                  <div key={index} className="flex gap-3 items-center bg-gray-50 p-2.5 rounded-xl">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover border bg-white" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">
                        {item.weight} {item.isEggless ? "• Eggless" : ""} {item.isHeartShape ? "• Heart" : ""}
                      </p>
                      <p className="text-xs font-black text-[#e8416d] mt-0.5">₹{item.price} × {item.quantity || 1}</p>
                    </div>
                  </div>
                ))}
              </div>

              {(deliveryDate || deliveryTime) && (
                <div className="bg-pink-50/70 border border-pink-100 rounded-xl p-3 mb-4 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#e8416d]" /> Delivery Slot:
                  </span>
                  <span className="font-black text-[#e8416d]">
                    {deliveryDate} {deliveryTime ? `(${deliveryTime})` : ""}
                  </span>
                </div>
              )}

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>MRP Total</span>
                  <span className="line-through">₹{mrpTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>MRP Discount</span>
                  <span className="text-green-600 font-bold">- ₹{totalSavings}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Partner Fee</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                
                <hr className="border-dashed border-gray-200 my-2" />
                
                <div className="flex justify-between text-lg font-black text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl py-2.5 px-3 text-center">
                <p className="text-xs font-black text-green-700">
                  🎉 You will save ₹{totalSavings} on this order!
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-gray-100 text-center">
                <div className="flex flex-col items-center">
                  <Truck className="w-5 h-5 text-[#e8416d] mb-1" />
                  <span className="text-[11px] font-bold text-gray-700">Express 2-3 Hr</span>
                  <span className="text-[10px] text-gray-400">Fresh Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <Award className="w-5 h-5 text-[#e8416d] mb-1" />
                  <span className="text-[11px] font-bold text-gray-700">100% Fresh</span>
                  <span className="text-[10px] text-gray-400">Baked on Order</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-[#e8416d] mb-1" />
                  <span className="text-[11px] font-bold text-gray-700">Zero Fee</span>
                  <span className="text-[10px] text-gray-400">Direct UPI Pay</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. ORDER CONFIRMED DIALOG BOX */}
      {orderSuccessData && (
        <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <span className="bg-pink-50 text-[#e8416d] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Order Received! 🎂
            </span>

            <h2 className="text-2xl font-black text-gray-900 mt-3">
              Thank You, {savedAddress?.full_name || "Valued Customer"}!
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Humne aapka order aur UTR details receive kar liya hai.
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 my-5 border border-gray-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Order Number:</span>
                <span className="font-black text-gray-900 text-sm">#{orderSuccessData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Amount Paid:</span>
                <span className="font-bold text-green-600">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">UTR Reference:</span>
                <span className="font-mono font-bold text-gray-800">{utrNumber}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-500 font-semibold">Current Status:</span>
                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                  🟡 Payment Verification Pending
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 mb-6 leading-relaxed">
              Jaise hi hamari team aapka UTR verify karegi, aapke cake ki fresh baking start ho jayegi! Apna Order Number <strong>#{orderSuccessData.id}</strong> note kar lein.
            </p>

            <button
              onClick={() => {
                if (clearCart) clearCart();
                router.push("/");
              }}
              className="w-full bg-[#10B981] hover:bg-green-600 text-white font-black py-4 rounded-xl text-base shadow-lg transition-all cursor-pointer"
            >
              OK, BACK TO HOME
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
