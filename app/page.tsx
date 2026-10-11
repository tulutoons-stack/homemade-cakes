"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, MapPin, User, Heart, ShoppingCart, 
  Calendar, ChevronDown, ArrowUpDown, Menu, 
  Home as HomeIcon, Grid, Lock, Key, X, Star
} from "lucide-react";
import { supabase } from "./supabase";

export default function ResponsiveWinniClone() {
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // SUPABASE CLOUD CONNECTION
  useEffect(() => {
    fetchCloudProducts();
  }, []);

  const fetchCloudProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setLiveProducts(data);
    if (error) console.error("Error fetching live products:", error);
  };

  // DUMMY PRODUCTS (Agar Supabase khali ho tab dikhega)
  const defaultProducts = [
    { 
      name: "Yummylicious Chocolate Cake", 
      price: 529, 
      mrp: 779, 
      discount: "32% Off", 
      rating: "4.7", 
      reviews: "690", 
      delivery: "Today", 
      img_url: "https://images.unsplash.com/photo-1578985545062-69928b1ea383?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      name: "Butterscotch Flavorsome Cake", 
      price: 499, 
      mrp: 699, 
      discount: "28% Off", 
      rating: "4.5", 
      reviews: "320", 
      delivery: "Today", 
      img_url: "https://images.unsplash.com/photo-1557925923-33b251a3ea38?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      name: "Belgium Chocolate Truffle", 
      price: 699, 
      mrp: 999, 
      discount: "30% Off", 
      rating: "4.8", 
      reviews: "812", 
      delivery: "Tomorrow", 
      img_url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80" 
    },
    { 
      name: "Delicious Pineapple Cake", 
      price: 449, 
      mrp: 599, 
      discount: "25% Off", 
      rating: "4.4", 
      reviews: "450", 
      delivery: "Today", 
      img_url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80" 
    }
  ];

  const displayProducts = liveProducts.length > 0 ? liveProducts : defaultProducts;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      setIsPinModalOpen(false);
      setPin("");
      setPinError("");
      window.location.href = "/admin";
    } else {
      setPinError("❌ Galat PIN! Kripya sahi code (1234) dale.");
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#333333]">
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ================= 1. TOP UTILITY BAR (Restored) ================= */}
      <div className="hidden md:flex justify-end items-center px-4 py-1 text-[12px] text-[#666666] bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-[#e8416d]">Help</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-[#e8416d]">Currency - <b className="text-black">INR</b></a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-[#e8416d]">Corporate Gifts</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-[#e8416d]">Partner With Us</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-[#e8416d]">Track Order</a>
        </div>
      </div>

      {/* ================= 2. RESPONSIVE HEADER ================= */}
      <header className="px-3 md:px-8 py-2 md:py-3 border-b border-gray-200 sticky top-0 bg-white z-40">
        <div className="flex items-center justify-between">
          
          <div className="md:hidden flex items-center">
            <Menu className="w-6 h-6 text-gray-700" />
          </div>

          <div className="flex-shrink-0 cursor-pointer flex items-center gap-1 md:gap-2" onClick={() => window.location.reload()}>
            <div className="flex">
              <svg className="w-8 h-6 md:w-11 md:h-8" viewBox="0 0 45 30" fill="none">
                <path d="M0 10 L10 25 L20 10 L30 25 L45 0 L30 30 L20 15 L10 30 Z" fill="#4B164C" />
                <path d="M20 10 L30 25 L45 0 L30 30 L20 15 Z" fill="#DD2A7B" opacity="0.8"/>
              </svg>
            </div>
            <div className="flex flex-col justify-center mt-1">
              <h1 className="text-[18px] md:text-[26px] font-black text-[#4B164C] tracking-tighter leading-none font-arial">HOMEMADE</h1>
              <span className="text-[7px] md:text-[9.5px] uppercase font-bold tracking-[0.15em] text-[#DD2A7B] mt-0.5">CAKE & GIFTS</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-[800px] ml-12 mr-6 gap-4">
            <div className="flex-1 flex items-center bg-[#f1f1f1] rounded-[4px] px-3 py-[9px]">
              <input type="text" placeholder="Search 5000+ flowers, cakes, gifts etc" className="bg-transparent border-none outline-none w-full text-[14px] text-gray-700" />
              <Search className="w-5 h-5 text-gray-400 ml-2" />
            </div>
            <div className="flex items-center bg-[#fdf1f5] rounded-[4px] px-3 py-[9px] cursor-pointer">
              <div className="flex items-center gap-2">
                <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-[18px] h-[12px] object-cover" />
                <span className="text-[13px] font-bold text-black">IND</span>
              </div>
              <div className="w-px h-5 bg-gray-300 mx-3"></div>
              <div className="flex items-center gap-1.5 text-black">
                <MapPin className="w-4 h-4" />
                <span className="text-[13px] font-bold whitespace-nowrap">Choose Delivery Location</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 text-[#555]">
            <User className="hidden md:block w-6 h-6 cursor-pointer hover:text-[#e8416d] fill-current" />
            <Heart className="hidden md:block w-6 h-6 cursor-pointer hover:text-[#e8416d] fill-current" />
            <div className="relative cursor-pointer">
              <ShoppingCart className="w-6 h-6 hover:text-[#e8416d] fill-current" />
              <span className="absolute -top-1.5 -right-2 bg-[#e8416d] text-white text-[9px] md:text-[10px] font-bold rounded-full w-[16px] md:w-[18px] h-[16px] md:h-[18px] flex items-center justify-center">0</span>
            </div>
          </div>
        </div>

        <div className="md:hidden mt-3 flex items-center bg-[#f1f1f1] rounded-md px-3 py-2">
          <input type="text" placeholder="Search cakes, gifts..." className="bg-transparent border-none outline-none w-full text-[13px] text-gray-700" />
          <Search className="w-4 h-4 text-gray-400 ml-2" />
        </div>
      </header>

      {/* ================= 3. CATEGORY NAVIGATION (Restored Full) ================= */}
      <nav className="px-3 md:px-8 py-2 md:py-3 flex items-center overflow-x-auto no-scrollbar shadow-[0_2px_4px_rgba(0,0,0,0.04)] text-[11px] md:text-[12.5px] text-[#333333] mb-4 whitespace-nowrap">
        <div className="flex gap-5 md:gap-7 items-center w-full">
          <a href="#" className="font-bold text-[#d11243]">EXPRESS</a>
          <a href="#" className="hover:text-[#e8416d] font-semibold md:font-normal">CAKES</a>
          <a href="#" className="hover:text-[#e8416d] font-semibold md:font-normal">FLOWERS</a>
          <a href="#" className="hover:text-[#e8416d] font-semibold md:font-normal">PLANTS</a>
          <a href="#" className="hover:text-[#e8416d] font-semibold md:font-normal">GIFTS</a>
          <a href="#" className="hover:text-[#e8416d] hidden md:block">PERSONALIZED GIFTS</a>
          <a href="#" className="hover:text-[#e8416d] font-semibold md:font-normal">CHOCOLATES</a>
          <div className="ml-auto text-[#e8416d] flex items-center gap-1 font-bold text-[11px] md:text-[13px] sticky right-0 bg-white px-2">
            2 Hour Delivery <span className="text-sm md:text-base ml-1">🛵</span>
          </div>
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-[1300px] mx-auto px-3 md:px-8 pb-10">
        
        {/* Curved Hero Overlap banner */}
        <div className="rounded-[16px] border border-gray-200 flex flex-row items-stretch mb-6 bg-[#ebe4f4] relative overflow-hidden h-[120px] md:h-[150px]">
          <div className="w-[180px] md:w-[250px] flex-shrink-0 flex items-center pl-5 md:pl-8 z-0">
            <h2 className="text-[17px] md:text-[24px] font-black text-[#4B164C] leading-snug">
              Celebrate with<br/>the Perfect<br/>Cake 🎉
            </h2>
          </div>
          <div className="flex-1 bg-white flex gap-4 md:gap-6 items-center pl-8 md:pl-12 pr-4 py-3 md:py-4 rounded-l-[40px] md:rounded-l-[80px] overflow-x-auto no-scrollbar shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.06)] relative z-10 -ml-6 md:-ml-12">
            {[
              { name: "Anniversary", img: "https://images.unsplash.com/photo-1557925923-33b251a3ea38?w=150&h=150&fit=crop" },
              { name: "Birthday", img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=150&h=150&fit=crop" },
              { name: "Photo", img: "https://images.unsplash.com/photo-1562777717-b6aff343b236?w=150&h=150&fit=crop" },
              { name: "Chocolate", img: "https://images.unsplash.com/photo-1578985545062-69928b1ea383?w=150&h=150&fit=crop" },
              { name: "Black Forest", img: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=150&h=150&fit=crop" },
              { name: "Pineapple", img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=150&h=150&fit=crop" },
              { name: "Red Velvet", img: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=150&h=150&fit=crop" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 md:gap-2 cursor-pointer flex-shrink-0">
                <div className="w-[65px] h-[65px] md:w-[90px] md:h-[90px] rounded-[16px] flex items-center justify-center p-0.5">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-[14px] shadow-sm border border-gray-100/50" />
                </div>
                <span className="text-[10px] md:text-[13px] text-[#333] font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters bar (Restored) */}
        <div className="bg-[#f5f5f5] rounded-[4px] px-3 py-2 md:px-4 md:py-2.5 flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3">
          <div className="flex items-center gap-1 md:gap-2">
            <h2 className="text-[14px] md:text-[16px] font-bold text-[#333333]">Online Cake Delivery</h2>
            <span className="text-[11px] md:text-[13px] text-gray-600">({displayProducts.length} items)</span>
          </div>
          <div className="flex overflow-x-auto no-scrollbar w-full md:w-auto gap-4 md:gap-0 pb-1 md:pb-0">
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer md:px-4 flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#333]" />
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[11px] font-bold text-[#333] leading-none mb-1">Delivery Date</span>
                <span className="text-[11px] md:text-[12.5px] text-[#666] flex items-center gap-1 leading-none">Select Date <ChevronDown className="w-3.5 h-3.5"/></span>
              </div>
            </div>
            <div className="w-px h-[30px] bg-gray-300 hidden md:block"></div>
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer md:px-4 flex-shrink-0">
              <span className="font-serif text-[#333] text-[13px] md:text-[15px] font-semibold">₹</span>
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[11px] font-bold text-[#333] leading-none mb-1">Filter By Price</span>
                <span className="text-[11px] md:text-[12.5px] text-[#1b7e3e] flex items-center gap-1 leading-none">All Products <ChevronDown className="w-3 h-3 text-[#333]"/></span>
              </div>
            </div>
            <div className="w-px h-[30px] bg-gray-300 hidden md:block"></div>
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer md:pl-4 flex-shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#333]" />
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[11px] font-bold text-[#333] leading-none mb-1">Sort By</span>
                <span className="text-[11px] md:text-[12.5px] text-[#1b7e3e] flex items-center gap-1 leading-none">Popularity <ChevronDown className="w-3 h-3 text-[#333]"/></span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DYNAMIC PRODUCT GRID ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product, idx) => (
            <div key={idx} className="cursor-pointer flex flex-col gap-2 group">
              <div className="relative rounded-[12px] md:rounded-[16px] overflow-hidden bg-[#f9f9f9] border border-gray-100 shadow-sm transition hover:shadow-md h-[180px] md:h-[290px]">
                <img src={product.img_url} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm w-7 h-7 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform border border-gray-100">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </div>
              </div>
              <div className="flex flex-col px-1.5 pt-1">
                <h3 className="text-[14px] md:text-[15px] font-bold text-gray-800 tracking-tight leading-snug line-clamp-2 md:h-11 h-9">{product.name}</h3>
                <div className="flex items-center flex-wrap gap-2 mt-2.5">
                  <span className="text-lg md:text-xl font-black text-gray-900 leading-none">₹{product.price}</span>
                  {product.mrp && <span className="text-xs md:text-sm text-gray-400 line-through leading-none mt-0.5">₹{product.mrp}</span>}
                  {product.discount && <span className="bg-[#e8fbf2] text-[#0f5132] font-extrabold text-[10px] md:text-[11px] px-1.5 py-0.5 rounded leading-none border border-[#d1e7dd]">{product.discount}</span>}
                </div>
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-gray-100 flex-wrap">
                  <span className="text-[11px] md:text-[12px] text-gray-500 font-medium">Earliest Delivery: <b className="text-green-600 font-extrabold">{product.delivery}</b></span>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-700 text-white font-black text-[11px] px-1.5 py-0.5 rounded flex items-center gap-0.5">{product.rating} <Star className="w-2.5 h-2.5 fill-white text-white" /></span>
                    <span className="text-[10px] md:text-[11px] text-gray-400 font-semibold hidden md:block">{product.reviews} Reviews</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ================= 8. FOOTER WITH ADMIN PANEL (Restored Full) ================= */}
      <footer className="bg-[#f9f9f9] border-t border-gray-200 pt-10 pb-24 md:pb-10 text-gray-700">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="font-extrabold text-[#333] mb-4 text-[13px] tracking-wider uppercase">Homemade Cake</h4>
              <ul className="space-y-2 text-[12px] text-gray-500">
                <li><a href="#" className="hover:text-[#e8416d]">Our Story</a></li>
                <li><a href="#" className="hover:text-[#e8416d]">Customer Reviews</a></li>
                <li><a href="#" className="hover:text-[#e8416d]">Quality</a></li>
                <li><a href="#" className="hover:text-[#e8416d]">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold text-[#333] mb-4 text-[13px] tracking-wider uppercase">Occasions</h4>
              <ul className="space-y-2 text-[12px] text-gray-500">
                <li><a href="#" className="hover:text-[#e8416d]">Anniversary Cakes</a></li>
                <li><a href="#" className="hover:text-[#e8416d]">Birthday Celebration</a></li>
                <li><a href="#" className="hover:text-[#e8416d]">Custom Design</a></li>
                <li><a href="#" className="hover:text-[#e8416d]">Corporate Bulk Gifting</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold text-[#333] mb-4 text-[13px] tracking-wider uppercase">Privacy & Term</h4>
              <ul className="space-y-2 text-[12px] text-gray-500">
                <li><a href="#" className="hover:text-[#e8416d]">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#e8416d]">Cancellation & Refund</a></li>
                <li><a href="#" className="hover:text-[#e8416d]">Delivery Information</a></li>
                <li><a href="#" className="hover:text-[#e8416d]">Terms of Services</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold text-[#333] mb-4 text-[13px] tracking-wider uppercase">Contact Details</h4>
              <p className="text-[12px] text-gray-500 mb-2 leading-relaxed">📧 support@homemadecakes.com</p>
              <p className="text-[12px] text-gray-500 mb-2 leading-relaxed">📞 +91 98765 43210</p>
              <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">📍 Madanpur, Bihar, India</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-gray-400">© {new Date().getFullYear()} Homemade Cake & Gifts. All Rights Reserved.</p>
            <button onClick={() => setIsPinModalOpen(true)} className="flex items-center gap-1.5 text-[12px] font-bold text-[#4B164C] bg-[#f0eaff] px-4 py-2 rounded-full hover:bg-[#e2d5fc] transition border border-[#e8dff7] cursor-pointer">
              <Lock className="w-3.5 h-3.5" /> Admin Portal
            </button>
          </div>
        </div>
      </footer>

      {/* ================= 9. SURAKSHIT PIN VERIFICATION MODAL ================= */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative border border-gray-100">
            <button onClick={() => { setIsPinModalOpen(false); setPin(""); setPinError(""); }} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-400">
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center mb-5 text-center">
              <div className="bg-[#fdf2f5] p-3 rounded-full text-[#e8416d] mb-3"><Key className="w-8 h-8" /></div>
              <h3 className="text-lg font-bold text-[#4B164C]">Secured Gateway PIN Verify</h3>
              <p className="text-xs text-gray-400 mt-1">Admin dashboard access karne ke liye 4-digit PIN enter karein</p>
            </div>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input type="password" maxLength={4} pattern="[0-9]*" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" className="w-full text-center text-3xl tracking-[1em] p-3 border-2 border-gray-200 bg-gray-50 rounded-xl outline-none focus:border-[#e8416d] font-bold" autoFocus />
              {pinError && <p className="text-xs font-bold text-red-500 text-center">{pinError}</p>}
              <button type="submit" className="w-full bg-[#e8416d] text-white font-bold py-3 rounded-xl hover:bg-[#d11243]">Confirm Verification 🔑</button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 10. MOBILE APP BOTTOM NAVIGATION (Restored) ================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center gap-1 text-[#e8416d]">
          <HomeIcon className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#e8416d]">
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium">Categories</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#e8416d]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Account</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#e8416d] relative">
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px] font-medium">Cart</span>
          <span className="absolute -top-1 -right-1 bg-[#e8416d] text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">0</span>
        </div>
      </div>
      
    </div>
  );
}