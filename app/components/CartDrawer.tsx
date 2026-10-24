"use client";

import React from "react";
import { X, Calendar, Clock, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "../store/cartStore";

export default function CartDrawer() {
  const {
    isCartOpen, closeCart, cartItems, removeFromCart, 
    deliveryDate, setDeliveryDate, deliveryTime, setDeliveryTime
  } = useCartStore();

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={closeCart}
      />

      <div className={`fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-gray-50 z-[100] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="bg-white p-4 flex items-center justify-between border-b shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#e8416d]" /> Your Cart ({cartItems.length})
          </h2>
          <button onClick={closeCart} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
              <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
              <p className="font-semibold text-lg">Your cart is empty.</p>
              <p className="text-sm">Add some delicious cakes!</p>
            </div>
          ) : (
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-5 flex items-start gap-3">
                <span className="text-2xl">🧑‍🍳</span>
                <div>
                  <p className="text-sm font-bold text-orange-800">Freshly Baked for You!</p>
                  <p className="text-xs text-orange-600 mt-0.5">We prepare your cake from scratch. Need estimated 2-3 hours for baking & icing.</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 relative">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover border" />
                    <div className="flex-1 pr-6">
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.weight} {item.isEggless ? '• Eggless' : ''} {item.isHeartShape ? '• Heart' : ''}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-lg font-black text-gray-900">₹{item.price}</p>
                        <span className="text-xs font-bold text-gray-500">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

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

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">Bill Details</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Item Total</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-lg border-t pt-2 mt-2">
                  <span>To Pay</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
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
        )}
      </div>
    </>
  );
}
