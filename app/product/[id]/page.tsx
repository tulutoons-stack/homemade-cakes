"use client";

import React, { useState, useEffect } from "react";
import { Star, MapPin, Heart, Leaf, ChevronLeft, Loader2, Tag, X, Calendar, Clock, ShoppingBag, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../supabase";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [productImages, setProductImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState("");
  const [bgPosition, setBgPosition] = useState("0% 0%");
  const [showZoom, setShowZoom] = useState(false);

  const [selectedWeight, setSelectedWeight] = useState("500 gm");
  const [isEggless, setIsEggless] = useState(false);
  const [isHeartShape, setIsHeartShape] = useState(false);
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState("");

  // Cart Drawer States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  // Offers Expand State (Premium UI)
  const [isOffersExpanded, setIsOffersExpanded] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      if (data) {
        setProduct(data);
        const images = [data.img_url, data.img_url_2, data.img_url_3, data.img_url_4].filter(Boolean);
        setProductImages(images);
        if (images.length > 0) setMainImage(images[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBgPosition(`${x}% ${y}%`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-xl font-bold">Product not found!</div>;
  }

  const upgrades = [
    { id: 1, name: "Marble Crunch Cake", price: 629, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80" },
    { id: 2, name: "Toothsome Heart Cake", price: 659, img: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=300&q=80" },
    { id: 3, name: "Red Roses & Cake", price: 1309, img: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=300&q=80" },
    { id: 4, name: "Colorful Roses Combo", price: 1639, img: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=300&q=80" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12 font-sans text-gray-800">
      
      {/* Mobile Header */}
      <div className="bg-white p-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm md:hidden">
        <Link href="/">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <h1 className="font-semibold text-lg">Cake Details</h1>
      </div>

      <div className="max-w-6xl mx-auto bg-white md:mt-8 md:rounded-2xl md:shadow-lg overflow-hidden p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Left: Image Gallery Section */}
          <div className="w-full md:w-5/12 flex flex-col-reverse md:flex-row gap-4 items-start">
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible hide-scrollbar md:w-20 flex-shrink-0">
              {productImages.map((img, index) => (
                <div 
                  key={index} 
                  onClick={() => setMainImage(img)}
                  className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    mainImage === img ? "border-pink-500 shadow-md" : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <img src={img} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div 
              className="w-full max-w-[450px] aspect-square bg-gray-50 rounded-xl overflow-hidden relative cursor-crosshair border border-gray-100"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
            >
              <img 
                src={mainImage || "/placeholder.jpg"} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-opacity duration-200 ${showZoom ? 'opacity-0' : 'opacity-100'}`}
              />
              {showZoom && (
                <div 
                  className="absolute inset-0 pointer-events-none bg-no-repeat hidden md:block"
                  style={{ 
                    backgroundImage: `url(${mainImage})`, 
                    backgroundPosition: bgPosition,
                    backgroundSize: '180%' 
                  }}
                />
              )}
            </div>
          </div>

          {/* Right: Details & Purchase Section */}
          <div className="w-full md:w-7/12 flex flex-col gap-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  {product.rating || "4.7"} <Star className="w-3 h-3 fill-current" />
                </span>
                <span className="text-gray-500 text-sm">Rating & {product.reviews || "693"} Reviews</span>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-gray-900">₹{product.price}</span>
              {product.mrp && (
                <>
                  <span className="text-gray-400 line-through mb-1 font-semibold">₹{product.mrp}</span>
                  <span className="text-[#10B981] font-bold mb-1">{product.discount}</span>
                </>
              )}
            </div>

            {/* PREMIUM COMPACT OFFERS SECTION */}
            <div 
              onClick={() => setIsOffersExpanded(!isOffersExpanded)}
              className="bg-gradient-to-r from-pink-50 to-orange-50 p-3 rounded-xl border border-pink-100 cursor-pointer transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#e8416d] p-2 rounded-lg shadow-sm">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Save ₹50 on this order</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Code: <span className="font-bold text-[#e8416d]">WIN50</span> 
                      <span className="text-gray-400 mx-1">•</span> 
                      <span className="text-[#e8416d]">2 more offers</span>
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-[#e8416d] transition-transform duration-300 ${isOffersExpanded ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Expanded Offers List */}
              <div className={`overflow-hidden transition-all duration-300 ${isOffersExpanded ? 'max-h-40 mt-3 pt-3 border-t border-pink-200/50 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="space-y-2 text-xs text-gray-700 list-disc pl-5">
                  <li>Use Coupon Code: <strong>WIN50</strong> to get ₹50 off</li>
                  <li>Use Coupon Code: <strong>TRYWINNI</strong> to get 20% off</li>
                  <li>Instant cashback of ₹100 in your wallet on delivery</li>
                </ul>
              </div>
            </div>

            <hr className="border-gray-100 my-1" />

            {/* Weight */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Weight</h3>
              <div className="flex flex-wrap gap-2">
                {["500 gm", "1 kg", "1.5 kg", "2 kg", "3 kg"].map((weight) => (
                  <button
                    key={weight}
                    onClick={() => setSelectedWeight(weight)}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                      selectedWeight === weight ? "bg-[#e8416d] border-[#e8416d] text-white" : "bg-white border-gray-300 text-gray-700 hover:border-[#e8416d]"
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isEggless} onChange={(e) => setIsEggless(e.target.checked)} className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500" />
                <span className="text-sm font-bold flex items-center gap-1 text-gray-700"><Leaf className="w-4 h-4 text-green-500" /> Eggless</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isHeartShape} onChange={(e) => setIsHeartShape(e.target.checked)} className="w-4 h-4 text-pink-500 rounded focus:ring-pink-500" />
                <span className="text-sm font-bold flex items-center gap-1 text-gray-700"><Heart className="w-4 h-4 text-pink-500" /> Heart Shape</span>
              </label>
            </div>

            <div className="mt-1">
              <input type="text" value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Message on cake (Optional)" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#e8416d]" />
            </div>

            <div className="flex mt-1">
              <div className="relative flex-1">
                <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Enter pincode to check delivery" value={pincode} onChange={(e)=>setPincode(e.target.value)} className="w-full border border-gray-300 border-r-0 rounded-l-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#e8416d]" />
              </div>
              <button className="bg-[#e8416d] text-white px-6 py-2.5 rounded-r-lg font-semibold hover:bg-pink-600 transition-colors">Check</button>
            </div>

            {/* Add to Cart Buttons */}
            <div className="flex gap-3 mt-4 hidden md:flex">
              <button className="flex items-center justify-center p-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Heart className="w-6 h-6 text-gray-400" />
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="flex-1 bg-[#10B981] text-white font-bold text-lg rounded-xl shadow-lg hover:bg-green-600 transition-colors py-3.5 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" /> ADD TO CART
              </button>
            </div>
            
            <p className="text-[#e8416d] text-sm font-bold text-center md:text-left mt-2 md:mt-0">
              Freshly baked on order! Takes estimated 2-3 hours.
            </p>
          </div>
        </div>
        
        <hr className="my-10 border-gray-100" />

        {/* Upgrades Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Pick an upgrade</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
            {upgrades.map((item) => (
              <div key={item.id} className="w-40 md:w-48 flex-shrink-0 group cursor-pointer">
                <div className="rounded-xl overflow-hidden mb-3 border border-gray-100">
                  <img src={item.img} alt={item.name} className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700 line-clamp-2">{item.name}</h4>
                <p className="text-base font-black text-gray-900 mt-1">₹ {item.price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Product Details:</h2>
          <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5 mb-8">
            <li>Cake Flavour: Truffle</li>
            <li>Shape: Round</li>
            <li>Type of Cake: Cream</li>
            <li>Type of Sponge: Chocolate</li>
            <li>Net Quantity: 1 Cake</li>
          </ul>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center justify-between z-40 md:hidden">
        <div>
          <p className="text-xs text-gray-500 font-bold">Total Price</p>
          <p className="text-xl font-black text-gray-900">₹{product.price}</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-[#10B981] text-white px-8 py-3 rounded-xl font-black text-lg shadow-lg hover:bg-green-600 active:scale-95 transition-all"
        >
          ADD TO CART
        </button>
      </div>

      {/* =========================================
          CART DRAWER (ZOMATO STYLE) 
          ========================================= */}
      
      {/* Overlay Background */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Side Drawer */}
      <div className={`fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-gray-50 z-[70] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="bg-white p-4 flex items-center justify-between border-b shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#e8416d]" /> Your Cart
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Drawer Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          
          {/* Freshness Banner */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-5 flex items-start gap-3">
            <span className="text-2xl">🧑‍🍳</span>
            <div>
              <p className="text-sm font-bold text-orange-800">Freshly Baked for You!</p>
              <p className="text-xs text-orange-600 mt-0.5">We prepare your cake from scratch. Need estimated 2-3 hours for baking & icing.</p>
            </div>
          </div>

          {/* Cart Item Summary */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 mb-6">
            <img src={mainImage} alt="cake" className="w-20 h-20 rounded-lg object-cover border" />
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-sm">{product.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{selectedWeight} {isEggless ? '• Eggless' : ''} {isHeartShape ? '• Heart' : ''}</p>
              <p className="text-lg font-black text-gray-900 mt-2">₹{product.price}</p>
            </div>
          </div>

          {/* Date Selection */}
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-[#e8416d]" /> Select Delivery Date
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {["Today", "Tomorrow"].map((date) => (
              <button 
                key={date}
                onClick={() => { setDeliveryDate(date); setDeliveryTime(""); }}
                className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                  deliveryDate === date ? "bg-pink-50 border-pink-500 text-[#e8416d]" : "bg-white border-gray-200 text-gray-600 hover:border-pink-300"
                }`}
              >
                {date}
              </button>
            ))}
          </div>

          {/* Time Selection */}
          {deliveryDate && (
            <>
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-[#e8416d]" /> Select Delivery Time
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {["12:00 PM - 03:00 PM", "03:00 PM - 06:00 PM", "06:00 PM - 09:00 PM", "09:00 PM - 12:00 AM"].map((time) => (
                  <button 
                    key={time}
                    onClick={() => setDeliveryTime(time)}
                    className={`py-2 px-1 text-center rounded-xl border text-[11px] font-bold transition-all ${
                      deliveryTime === time ? "bg-pink-50 border-pink-500 text-[#e8416d]" : "bg-white border-gray-200 text-gray-600 hover:border-pink-300"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Bill Details */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">Bill Details</h4>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Item Total</span>
              <span>₹{product.price}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Delivery Fee</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between font-black text-gray-900 text-lg border-t pt-2 mt-2">
              <span>To Pay</span>
              <span>₹{product.price}</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer (Checkout Button) */}
        <div className="bg-white p-4 border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          {!deliveryDate || !deliveryTime ? (
            <p className="text-xs text-red-500 text-center mb-2 font-semibold">Please select Date & Time to proceed</p>
          ) : null}
          <button 
            disabled={!deliveryDate || !deliveryTime}
            className="w-full bg-[#10B981] disabled:bg-gray-300 disabled:text-gray-500 text-white font-black py-4 rounded-xl text-lg shadow-lg transition-all"
          >
            {deliveryDate && deliveryTime ? "PROCEED TO CHECKOUT" : "SELECT TIME SLOT"}
          </button>
        </div>

      </div>
    </div>
  );
}
