"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Image as ImageIcon, Package, Star, Loader2, Edit2, 
  ToggleLeft, ToggleRight, ShoppingBag, BarChart3, Users, 
  CheckCircle2, XCircle, Truck, PackageCheck, RefreshCw, 
  Phone, MapPin, Copy, Check, MessageCircle, Clock, Search, Cake, IndianRupee, AlertCircle
} from "lucide-react";
import { supabase } from "../supabase";

export default function SuperAdminPanel() {
  // Main Tab State ("orders" | "analytics" | "products" | "customers")
  const [activeTab, setActiveTab] = useState<"orders" | "analytics" | "products" | "customers">("orders");

  // ==========================================
  // 1. ORDERS TAB STATES & FUNCTIONS
  // ==========================================
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Record<number, any>>({});
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchOrdersAndData();
    fetchProducts();
  }, []);

  const fetchOrdersAndData = async () => {
    setOrdersLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

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
    } finally {
      setOrdersLoading(false);
    }
  };

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

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

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

  // Filtered Orders
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

  const pendingCount = orders.filter((o) => o.order_status === "Payment Verification Pending").length;
  const bakingCount = orders.filter((o) => o.order_status === "Confirmed & Baking").length;
  const totalRevenue = orders
    .filter((o) => o.order_status !== "UTR Rejected")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);


  // ==========================================
  // 3. PRODUCTS TAB STATES & FUNCTIONS (Aapka Purana Code)
  // ==========================================
  const [products, setProducts] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [discount, setDiscount] = useState("");
  const [rating, setRating] = useState("4.7");
  const [reviews, setReviews] = useState("120");
  const [delivery, setDelivery] = useState("Today");

  const [price250g, setPrice250g] = useState(""); const [mrp250g, setMrp250g] = useState("");
  const [price500g, setPrice500g] = useState(""); const [mrp500g, setMrp500g] = useState("");
  const [price750g, setPrice750g] = useState(""); const [mrp750g, setMrp750g] = useState("");
  const [price1kg, setPrice1kg] = useState("");   const [mrp1kg, setMrp1kg] = useState("");
  const [price2kg, setPrice2kg] = useState("");   const [mrp2kg, setMrp2kg] = useState("");
  
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image3, setImage3] = useState<File | null>(null);
  const [image4, setImage4] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    if (error) console.error("Error fetching products:", error);
  };

  useEffect(() => {
    if (mrp && price) {
      const m = parseFloat(mrp);
      const p = parseFloat(price);
      if (m > p) setDiscount(`${Math.round(((m - p) / m) * 100)}% Off`);
    }
  }, [price, mrp]);

  const uploadSingleImage = async (file: File | null) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('cake_images').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('cake_images').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSaveProduct = async (e: any) => {
    e.preventDefault();
    if (!name || !price) return alert("Bhai, Name aur Price zaroori hai!");
    if (!editId && !image1) return alert("Naye product ke liye Main Image (Photo 1) zaroori hai!");

    setIsUploading(true);
    try {
      const url1 = await uploadSingleImage(image1);
      const url2 = await uploadSingleImage(image2);
      const url3 = await uploadSingleImage(image3);
      const url4 = await uploadSingleImage(image4);

      const calcMrp = (mult: number) => mrp ? Math.round(parseInt(mrp) * mult) : null;
      const calcPrice = (mult: number) => Math.round(parseInt(price) * mult);

      const weight_prices = {
        "250 gm": { price: price250g ? parseInt(price250g) : calcPrice(0.6), mrp: mrp250g ? parseInt(mrp250g) : calcMrp(0.6) },
        "500 gm": { price: price500g ? parseInt(price500g) : parseInt(price), mrp: mrp500g ? parseInt(mrp500g) : (mrp ? parseInt(mrp) : null) },
        "750 gm": { price: price750g ? parseInt(price750g) : calcPrice(1.4), mrp: mrp750g ? parseInt(mrp750g) : calcMrp(1.4) },
        "1 kg": { price: price1kg ? parseInt(price1kg) : calcPrice(1.8), mrp: mrp1kg ? parseInt(mrp1kg) : calcMrp(1.8) },
        "2 kg": { price: price2kg ? parseInt(price2kg) : calcPrice(3.5), mrp: mrp2kg ? parseInt(mrp2kg) : calcMrp(3.5) }
      };

      const payload: any = {
        name, price: parseInt(price), mrp: mrp ? parseInt(mrp) : null,
        discount: discount || null, rating: rating || "4.5", reviews: reviews || "10", 
        delivery: delivery || "Today", weight_prices: weight_prices
      };

      if (url1) payload.img_url = url1;
      if (url2) payload.img_url_2 = url2;
      if (url3) payload.img_url_3 = url3;
      if (url4) payload.img_url_4 = url4;

      if (editId) {
        const { error: dbError } = await supabase.from('products').update(payload).eq('id', editId);
        if (dbError) throw dbError;
        alert("Product updated successfully! 🚀");
      } else {
        const { error: dbError } = await supabase.from('products').insert([payload]);
        if (dbError) throw dbError;
        alert("Product uploaded successfully! 🚀");
      }

      fetchProducts();
      resetForm();
    } catch (error: any) {
      console.error("Upload error:", error.message);
      alert("Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName(""); setPrice(""); setMrp(""); setDiscount("");
    setPrice250g(""); setMrp250g(""); setPrice500g(""); setMrp500g("");
    setPrice750g(""); setMrp750g(""); setPrice1kg(""); setMrp1kg("");
    setPrice2kg(""); setMrp2kg("");
    setImage1(null); setImage2(null); setImage3(null); setImage4(null);
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setName(p.name); setPrice(p.price?.toString() || ""); setMrp(p.mrp?.toString() || "");
    setDiscount(p.discount || ""); setDelivery(p.delivery || "Today");
    
    if (p.weight_prices) {
      const getVal = (w: string, key: 'price'|'mrp') => {
        if(!p.weight_prices[w]) return "";
        if(typeof p.weight_prices[w] === 'object') return p.weight_prices[w][key]?.toString() || "";
        return key === 'price' ? p.weight_prices[w].toString() : "";
      };
      setPrice250g(getVal("250 gm", "price")); setMrp250g(getVal("250 gm", "mrp"));
      setPrice500g(getVal("500 gm", "price")); setMrp500g(getVal("500 gm", "mrp"));
      setPrice750g(getVal("750 gm", "price")); setMrp750g(getVal("750 gm", "mrp"));
      setPrice1kg(getVal("1 kg", "price")); setMrp1kg(getVal("1 kg", "mrp"));
      setPrice2kg(getVal("2 kg", "price")); setMrp2kg(getVal("2 kg", "mrp"));
    }
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure you want to delete this item?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(products.filter(p => p.id !== id));
    else alert("Delete failed: " + error.message);
  };

  const toggleStockStatus = async (id: number, currentStock: boolean) => {
    const newStatus = currentStock === false ? true : false;
    const { error } = await supabase.from('products').update({ in_stock: newStatus }).eq('id', id);
    if (!error) fetchProducts();
    else alert("Stock update failed: " + error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 font-sans text-gray-800">
      
      {/* =========================================================
          TOP COMMAND CENTER HEADER & STATS STRIP
          ========================================================= */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-[#e8416d] text-white p-2.5 rounded-xl font-black">
              🍰
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Royal Admin Command Center</h1>
              <p className="text-xs text-gray-500">Live Business Dashboard & UTR Verification</p>
            </div>
          </div>

          {/* Top Quick Live Stats */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] font-bold text-amber-800 block uppercase">Pending UTR</span>
              <span className="text-base font-black text-amber-900">{pendingCount}</span>
            </div>
            <div className="bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] font-bold text-green-800 block uppercase">Total Revenue</span>
              <span className="text-base font-black text-green-900">₹{totalRevenue}</span>
            </div>
            <a 
              href="/" 
              target="_blank" 
              className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition shadow-sm"
            >
              Live Website →
            </a>
          </div>

        </div>

        {/* NAVIGATION TABS BAR */}
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar border-t border-gray-100 pt-2">
          {[
            { id: "orders", label: `📦 Live Orders & UTR (${orders.length})`, badge: pendingCount > 0 ? pendingCount : null },
            { id: "analytics", label: "📊 Sales & Analytics", badge: null },
            { id: "products", label: `🎂 Products & Rates (${products.length})`, badge: null },
            { id: "customers", label: `👥 Customer Directory (${Object.keys(addresses).length})`, badge: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#e8416d] text-white shadow-md shadow-pink-500/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================
          TAB CONTENT AREA
          ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* ---------------- TAB 1: LIVE ORDERS & UTR ---------------- */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Search & Filter Bar */}
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
                ].map((t) => (
                  <button
                    key={t.val}
                    onClick={() => setStatusFilter(t.val)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      statusFilter === t.val
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}

                <button
                  onClick={fetchOrdersAndData}
                  className="p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-95 transition"
                  title="Refresh Orders"
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                <RefreshCw className="w-8 h-8 text-[#e8416d] animate-spin mx-auto mb-3" />
                <p className="font-bold text-gray-600">Loading live cake orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
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
                          ? "border-amber-300 shadow-amber-100"
                          : isBaking
                          ? "border-blue-300"
                          : isDelivered
                          ? "border-green-300"
                          : isRejected
                          ? "border-red-200 opacity-75"
                          : "border-gray-100"
                      }`}
                    >
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

                      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                        
                        {/* Cake Details */}
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

                                  {item.message && (
                                    <p className="mt-1.5 text-xs bg-yellow-50 border border-yellow-200 text-yellow-900 px-2 py-1 rounded font-semibold">
                                      ✍️ Msg on Cake: <strong>"{item.message}"</strong>
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {(order.delivery_date || order.delivery_time) && (
                            <div className="bg-pink-50 border border-pink-100 px-3 py-2 rounded-xl flex items-center justify-between text-xs">
                              <span className="font-bold text-gray-700">⏰ Delivery Slot:</span>
                              <span className="font-black text-[#e8416d]">
                                {order.delivery_date || "Today"} {order.delivery_time ? `• ${order.delivery_time}` : ""}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Customer & Address */}
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
                              Address linked nahi hai (Address ID: {order.address_id || "None"})
                            </div>
                          )}
                        </div>

                        {/* UTR Check & Action Buttons */}
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
        )}

        {/* ---------------- TAB 2: SALES & ANALYTICS ---------------- */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Total Gross Revenue</span>
                <p className="text-3xl font-black text-gray-900 mt-2">₹{totalRevenue}</p>
                <p className="text-xs text-green-600 font-semibold mt-1">Calculated from verified orders</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Total Orders Placed</span>
                <p className="text-3xl font-black text-gray-900 mt-2">{orders.length}</p>
                <p className="text-xs text-blue-600 font-semibold mt-1">{pendingCount} waiting verification</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Menu Items Live</span>
                <p className="text-3xl font-black text-gray-900 mt-2">{products.length}</p>
                <p className="text-xs text-purple-600 font-semibold mt-1">Cloud synced with Supabase</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center py-12">
              <BarChart3 className="w-12 h-12 text-[#e8416d] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800">Business Growth & Performance</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                Aapke store par aane wale orders aur revenue ka live graph yahan update ho raha hai. Jaise-jaise orders badhenge, detailed trends yahan dikhenge.
              </p>
            </div>
          </div>
        )}

        {/* ---------------- TAB 3: PRODUCTS, RATES & UPLOAD (Aapka Purana Code) ---------------- */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            
            {/* Upload / Edit Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold flex items-center gap-2 text-[#e8416d]">
                  {editId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />} 
                  {editId ? "Update Product" : "Cloud Par Upload Karein"}
                </h2>
                {editId && <button type="button" onClick={resetForm} className="text-xs text-blue-600 font-bold hover:underline">Cancel Edit</button>}
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Cake/Product Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Yummylicious Chocolate" className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-[#e8416d]" required />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Base Price (500g) *</label>
                    <input type="number" value={price} onChange={(e) => {setPrice(e.target.value); setPrice500g(e.target.value);}} placeholder="529" className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-[#e8416d]" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Original MRP (₹)</label>
                    <input type="number" value={mrp} onChange={(e) => {setMrp(e.target.value); setMrp500g(e.target.value);}} placeholder="779" className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-[#e8416d]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Discount Text</label>
                    <input type="text" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="32% Off" className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-[#e8416d]" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Delivery Speed</label>
                    <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-[#e8416d]">
                      <option value="Today">Today</option><option value="Tomorrow">Tomorrow</option><option value="2 Hours">Within 2 Hours</option>
                    </select>
                  </div>
                </div>

                <hr className="border-gray-100 my-4" />
                <label className="text-sm font-bold text-gray-700 block mb-2">Advance Setup: Rates By Weight</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {w: "250 gm", p: price250g, sp: setPrice250g, m: mrp250g, sm: setMrp250g},
                    {w: "750 gm", p: price750g, sp: setPrice750g, m: mrp750g, sm: setMrp750g},
                    {w: "1 kg", p: price1kg, sp: setPrice1kg, m: mrp1kg, sm: setMrp1kg},
                    {w: "2 kg", p: price2kg, sp: setPrice2kg, m: mrp2kg, sm: setMrp2kg}
                  ].map((item) => (
                    <div key={item.w} className="p-2 bg-gray-50 border rounded-lg">
                      <span className="text-[10px] font-bold text-[#e8416d] mb-1 block">{item.w}</span>
                      <div className="flex gap-2">
                        <input type="number" value={item.p} onChange={(e)=>item.sp(e.target.value)} placeholder="Price" className="w-full p-1.5 border rounded text-xs outline-none focus:border-[#e8416d]" />
                        <input type="number" value={item.m} onChange={(e)=>item.sm(e.target.value)} placeholder="MRP" className="w-full p-1.5 border rounded text-xs outline-none focus:border-[#e8416d]" />
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-100 my-4" />
                <label className="text-sm font-bold text-gray-700 block mb-2">Upload 4 Images {editId ? "(Leave empty to keep old)" : "*"}</label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:bg-gray-50 cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => setImage1(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="text-gray-400 flex flex-col items-center"><ImageIcon className="w-5 h-5 mb-1" /><span className="text-[10px] font-semibold">{image1 ? image1.name : "1. Main Photo"}</span></div>
                  </div>
                  <div className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:bg-gray-50 cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => setImage2(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="text-gray-400 flex flex-col items-center"><ImageIcon className="w-5 h-5 mb-1" /><span className="text-[10px] font-semibold">{image2 ? image2.name : "2. Side View"}</span></div>
                  </div>
                  <div className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:bg-gray-50 cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => setImage3(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="text-gray-400 flex flex-col items-center"><ImageIcon className="w-5 h-5 mb-1" /><span className="text-[10px] font-semibold">{image3 ? image3.name : "3. Top View"}</span></div>
                  </div>
                  <div className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:bg-gray-50 cursor-pointer">
                    <input type="file" accept="image/*" onChange={(e) => setImage4(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="text-gray-400 flex flex-col items-center"><ImageIcon className="w-5 h-5 mb-1" /><span className="text-[10px] font-semibold">{image4 ? image4.name : "4. Close Up"}</span></div>
                  </div>
                </div>

                <button disabled={isUploading} type="submit" className="w-full bg-[#e8416d] text-white font-bold py-3.5 mt-4 rounded-xl hover:bg-[#d11243] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isUploading ? (editId ? "Updating..." : "Uploading...") : (editId ? "Save Changes 💾" : "Live Website Par Daalein 🚀")}
                </button>
              </form>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-900"><Package className="w-5 h-5" /> Live Cloud Database ({products.length})</h2>
              {products.length === 0 ? (
                <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-2xl">Supabase empty hai. Upload your first product!</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className={`border ${p.in_stock === false ? 'border-red-200 bg-red-50' : 'border-gray-100'} rounded-xl p-3 relative group hover:shadow-md transition bg-white`}>
                      
                      <button 
                        onClick={() => toggleStockStatus(p.id, p.in_stock)} 
                        className={`absolute top-2 left-2 z-10 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-md transition ${p.in_stock === false ? 'bg-red-500/90 text-white' : 'bg-white/90 text-green-600'}`}
                      >
                        {p.in_stock === false ? <ToggleLeft className="w-3 h-3" /> : <ToggleRight className="w-3 h-3" />}
                        {p.in_stock === false ? 'Out of Stock' : 'In Stock'}
                      </button>

                      <img src={p.img_url} alt={p.name} className={`w-full h-36 object-cover rounded-lg mb-2.5 ${p.in_stock === false ? 'opacity-50' : ''}`} />
                      <h3 className="font-bold text-sm text-gray-800 truncate mb-1">{p.name}</h3>
                      <div className="flex gap-2 items-center mb-1 text-xs">
                        <span className="text-black font-black">₹{p.price}</span>
                        {p.mrp && <span className="text-gray-400 line-through">₹{p.mrp}</span>}
                        {p.discount && <span className="text-green-600 font-bold bg-green-50 px-1 rounded">{p.discount}</span>}
                      </div>
                      
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition duration-200">
                        <button onClick={() => handleEdit(p)} className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow text-blue-500 hover:bg-blue-50">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ---------------- TAB 4: CUSTOMER DIRECTORY ---------------- */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in duration-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#e8416d]" /> Saved Customer Directory ({Object.keys(addresses).length})
            </h2>

            {Object.keys(addresses).length === 0 ? (
              <div className="text-center py-12 text-gray-400">Abhi tak kisi customer ne address save nahi kiya hai.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(addresses).map((cust: any) => (
                  <div key={cust.id} className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">{cust.full_name}</span>
                      <span className="text-[10px] font-bold uppercase bg-pink-100 text-[#e8416d] px-2 py-0.5 rounded">
                        {cust.address_type || "Home"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">📞 {cust.phone_number}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">📍 {cust.detailed_address}, {cust.city} - {cust.pincode}</p>
                    <a 
                      href={`https://wa.me/91${cust.phone_number?.replace(/\D/g, "")}`} 
                      target="_blank"
                      className="mt-2 block w-full text-center bg-green-50 text-green-700 hover:bg-green-100 py-2 rounded-xl text-xs font-bold transition"
                    >
                      💬 WhatsApp Customer
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
