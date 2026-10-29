"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { 
  CheckCircle2, XCircle, Truck, PackageCheck, RefreshCw, 
  Phone, MapPin, Copy, Check, MessageCircle, Clock, Search, Cake, IndianRupee, AlertCircle
} from "lucide-react";

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchOrdersAndAddresses();
  }, []);

  const fetchOrdersAndAddresses = async () => {
    setLoading(true);
    try {
      // 1. Fetch all orders (Newest first)
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // 2. Fetch all user addresses to map customer details
      const { data: addrData, error: addrError } = await supabase
        .from("user_addresses")
        .select("*");

      if (!addrError && addrData) {
        const addrMap: Record<number, any> = {};
        addrData.forEach((a: any) => {
          addrMap[a.id] = a;
        });
        setAddresses(addrMap);
      }

      setOrders(ordersData || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err.message);
      alert("Orders load karne me dikkat aayi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Status Update Function
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Copy UTR to clipboard
  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  // 1-Click WhatsApp Alert Generator
  const openWhatsAppAlert = (order: any, customer: any, type: "verified" | "rejected" | "out_for_delivery") => {
    const rawPhone = customer?.phone_number || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const customerName = customer?.full_name || "Customer";
    const itemsList = (order.cart_items || [])
      .map((i: any) => `${i.name} (${i.weight}${i.isEggless ? ", Eggless" : ""})`)
      .join(", ");

    let message = "";

    if (type === "verified") {
      message = `🎉 *Order Confirmed & Baking Started!*\n\nHi *${customerName}*,\nYour payment of *₹${order.total_amount}* (UTR: ${order.utr_number}) for *Order #${order.id}* has been verified!\n\n🎂 *Items:* ${itemsList}\n⏰ *Delivery Slot:* ${order.delivery_date || "Today"} ${order.delivery_time ? `(${order.delivery_time})` : ""}\n\nHamare chef ne aapka fresh cake bake karna shuru kar diya hai. Thank you for choosing Royal Digital Cakes! ❤️`;
    } else if (type === "out_for_delivery") {
      message = `🚚 *Your Cake is Out for Delivery!*\n\nHi *${customerName}*,\nYour freshly baked cake for *Order #${order.id}* is ready and on the way to your address (${customer?.detailed_address || ""})!\n\nPlease keep your phone reachable. Enjoy your celebration! 🎂✨`;
    } else if (type === "rejected") {
      message = `⚠️ *Payment Verification Issue - Order #${order.id}*\n\nHi *${customerName}*,\nHumne aapka UTR Number (*${order.utr_number}*) check kiya lekin *₹${order.total_amount}* ka payment hamare bank/UPI me abhi tak reflect nahi hua hai.\n\nKripya payment ka screenshot is WhatsApp par bhejein taaki hum aapka order confirm kar sakein.`;
    }

    const url = `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    const cust = addresses[order.address_id] || {};
    const matchesStatus = statusFilter === "ALL" || order.order_status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      String(order.id).includes(searchQuery) ||
      (order.utr_number && order.utr_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cust.full_name && cust.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cust.phone_number && cust.phone_number.includes(searchQuery));

    return matchesStatus && matchesSearch;
  });

  // Top Summary Counts
  const pendingCount = orders.filter((o) => o.order_status === "Payment Verification Pending").length;
  const bakingCount = orders.filter((o) => o.order_status === "Confirmed & Baking").length;
  const totalRevenue = orders
    .filter((o) => o.order_status !== "UTR Rejected")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      
      {/* TOP STATS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
          <span className="text-xs font-bold text-amber-800 uppercase">🟡 Pending UTR Verify</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
          <span className="text-xs font-bold text-blue-800 uppercase">👨‍🍳 Baking Now</span>
          <p className="text-2xl sm:text-3xl font-black text-blue-900 mt-1">{bakingCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 p-4 rounded-2xl">
          <span className="text-xs font-bold text-green-800 uppercase">📦 Total Orders</span>
          <p className="text-2xl sm:text-3xl font-black text-green-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-pink-50 border border-pink-200 p-4 rounded-2xl">
          <span className="text-xs font-bold text-[#e8416d] uppercase">💰 Active Revenue</span>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">₹{totalRevenue}</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, 12-Digit UTR, Customer Name or Phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e8416d]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: "All", val: "ALL" },
            { label: `Pending (${pendingCount})`, val: "Payment Verification Pending" },
            { label: "Baking", val: "Confirmed & Baking" },
            { label: "Out for Delivery", val: "Out for Delivery" },
            { label: "Delivered", val: "Delivered" },
            { label: "Rejected", val: "UTR Rejected" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.val
                  ? "bg-[#e8416d] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={fetchOrdersAndAddresses}
            className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 active:scale-95 transition"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <RefreshCw className="w-8 h-8 text-[#e8416d] animate-spin mx-auto mb-3" />
          <p className="font-bold text-gray-600">Loading live cake orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Cake className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No Orders Found</h3>
          <p className="text-xs text-gray-400 mt-1">Jab koi customer checkout karega, toh order yahan turant dikhega.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customer = addresses[order.address_id] || null;
            const isPending = order.order_status === "Payment Verification Pending";
            const isBaking = order.order_status === "Confirmed & Baking";
            const isOut = order.order_status === "Out for Delivery";
            const isDelivered = order.order_status === "Delivered";
            const isRejected = order.order_status === "UTR Rejected";

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${
                  isPending
                    ? "border-amber-300"
                    : isBaking
                    ? "border-blue-300"
                    : isDelivered
                    ? "border-green-300"
                    : isRejected
                    ? "border-red-200 opacity-75"
                    : "border-gray-100"
                }`}
              >
                {/* ORDER HEADER BAR */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-900 text-white text-xs font-black px-3 py-1 rounded-lg">
                      ORDER #{order.id}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${
                        isPending
                          ? "bg-amber-100 text-amber-900 animate-pulse"
                          : isBaking
                          ? "bg-blue-100 text-blue-800"
                          : isOut
                          ? "bg-purple-100 text-purple-800"
                          : isDelivered
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isPending && "🟡 Payment Verification Pending"}
                      {isBaking && "👨‍🍳 Confirmed & Baking"}
                      {isOut && "🚚 Out for Delivery"}
                      {isDelivered && "✅ Delivered"}
                      {isRejected && "❌ UTR Rejected"}
                    </span>
                  </div>
                </div>

                {/* ORDER BODY: 3 COLUMNS (CAKES | CUSTOMER ADDRESS | UTR & ACTIONS) */}
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* 1. CAKE DETAILS (5 Cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                      🎂 Ordered Cakes ({order.cart_items?.length || 0})
                    </h4>

                    <div className="space-y-2.5">
                      {(order.cart_items || []).map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <img
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover border bg-white flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="text-[11px] bg-white border px-2 py-0.5 rounded font-bold text-gray-700">
                                {item.weight}
                              </span>
                              {item.isEggless && (
                                <span className="text-[11px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">
                                  🌱 Eggless
                                </span>
                              )}
                              {item.isHeartShape && (
                                <span className="text-[11px] bg-pink-100 text-[#e8416d] px-2 py-0.5 rounded font-bold">
                                  ❤️ Heart Shape
                                </span>
                              )}
                              <span className="text-[11px] bg-gray-200 text-gray-800 px-2 py-0.5 rounded font-bold">
                                Qty: {item.quantity || 1}
                              </span>
                            </div>

                            {/* Cake Message Highlight */}
                            {item.message && (
                              <p className="mt-1.5 text-xs bg-yellow-50 border border-yellow-200 text-yellow-900 px-2 py-1 rounded font-semibold">
                                ✍️ Msg on Cake: <strong>"{item.message}"</strong>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Date & Slot */}
                    {(order.delivery_date || order.delivery_time) && (
                      <div className="bg-pink-50 border border-pink-100 px-3 py-2 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700">⏰ Delivery Slot:</span>
                        <span className="font-black text-[#e8416d]">
                          {order.delivery_date || "Today"} {order.delivery_time ? `• ${order.delivery_time}` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2. CUSTOMER & DELIVERY ADDRESS (4 Cols) */}
                  <div className="lg:col-span-4 space-y-2.5 border-t lg:border-t-0 lg:border-l lg:border-r border-gray-100 pt-4 lg:pt-0 lg:px-4">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                      📍 Customer & Address
                    </h4>

                    {customer ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-gray-900 text-base">{customer.full_name}</span>
                          <span className="text-[11px] font-bold uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {customer.address_type || "Home"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${customer.phone_number}`}
                            className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-green-100"
                          >
                            <Phone className="w-3.5 h-3.5" /> {customer.phone_number}
                          </a>

                          {customer.alternate_phone && (
                            <span className="text-xs text-gray-500 font-semibold">
                              Alt: {customer.alternate_phone}
                            </span>
                          )}
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 space-y-1 leading-relaxed">
                          <p className="font-semibold text-gray-900">{customer.detailed_address}</p>
                          {customer.landmark && (
                            <p className="text-[#e8416d] font-bold">🚩 Landmark: {customer.landmark}</p>
                          )}
                          <p className="text-gray-500 font-bold">
                            {customer.city} — Pincode: <span className="text-gray-900">{customer.pincode}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Address details linked nahi hain (Address ID: {order.address_id || "None"})
                      </div>
                    )}
                  </div>

                  {/* 3. UTR VERIFICATION & 1-CLICK ACTIONS (3 Cols) */}
                  <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div>
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                        💳 Payment & UTR Check
                      </h4>

                      <div className="bg-amber-50/90 border-2 border-amber-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900">Amount Paid:</span>
                          <span className="text-lg font-black text-green-700">₹{order.total_amount}</span>
                        </div>

                        <div className="pt-2 border-t border-amber-200/70">
                          <span className="text-[10px] font-black uppercase text-amber-800 block">
                            12-Digit UTR / Ref No:
                          </span>
                          <div className="flex items-center justify-between gap-2 mt-1 bg-white px-2.5 py-1.5 rounded-lg border border-amber-300">
                            <span className="font-mono font-black text-sm text-gray-900 tracking-wider select-all">
                              {order.utr_number || "N/A"}
                            </span>
                            {order.utr_number && (
                              <button
                                onClick={() => handleCopyUtr(order.utr_number)}
                                className="text-gray-500 hover:text-gray-900 p-1"
                                title="Copy UTR"
                              >
                                {copiedUtr === order.utr_number ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="space-y-2">
                      {isPending && (
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            disabled={updatingId === order.id}
                            onClick={async () => {
                              await updateOrderStatus(order.id, "Confirmed & Baking");
                              if (customer) openWhatsAppAlert(order, customer, "verified");
                            }}
                            className="w-full bg-[#10B981] hover:bg-green-600 text-white font-black py-2.5 px-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            ✅ VERIFY & START BAKING
                          </button>

                          <button
                            disabled={updatingId === order.id}
                            onClick={async () => {
                              await updateOrderStatus(order.id, "UTR Rejected");
                              if (customer) openWhatsAppAlert(order, customer, "rejected");
                            }}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                          >
                            <XCircle className="w-4 h-4" />
                            ❌ Reject Fake UTR
                          </button>
                        </div>
                      )}

                      {isBaking && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={async () => {
                            await updateOrderStatus(order.id, "Out for Delivery");
                            if (customer) openWhatsAppAlert(order, customer, "out_for_delivery");
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-2.5 px-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          🚚 MARK OUT FOR DELIVERY
                        </button>
                      )}

                      {isOut && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => updateOrderStatus(order.id, "Delivered")}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-2.5 px-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <PackageCheck className="w-4 h-4" />
                          🎉 MARK DELIVERED
                        </button>
                      )}

                      {/* Direct WhatsApp Button (Anytime) */}
                      {customer && (
                        <button
                          onClick={() =>
                            openWhatsAppAlert(
                              order,
                              customer,
                              isRejected ? "rejected" : isOut ? "out_for_delivery" : "verified"
                            )
                          }
                          className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp Customer
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
