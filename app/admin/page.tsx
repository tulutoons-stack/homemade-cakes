"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Trash2, Image as ImageIcon, Package, Loader2, Edit2, 
  ToggleLeft, ToggleRight, BarChart3, Users, 
  CheckCircle2, XCircle, Truck, PackageCheck, RefreshCw, 
  Phone, Copy, Check, MessageCircle, Clock, Search, Cake, 
  AlertCircle, Printer, Volume2, VolumeX, Crown, TrendingUp, 
  ShoppingBag, Sparkles, X, Award, MapPin
} from "lucide-react";
import { supabase } from "../supabase";

export default function SuperAdminPanel() {
  const [activeTab, setActiveTab] = useState<"orders" | "analytics" | "products" | "customers">("orders");

  // ==========================================
  // 1. ORDERS, REALTIME SOUND & KITCHEN SLIP STATES
  // ==========================================
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Record<number, any>>({});
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Sound Alert & Kitchen Slip Modal
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedSlipOrder, setSelectedSlipOrder] = useState<any | null>(null);
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(45); // Default 45% bakery net margin

  // Play pleasant notification chime using Web Audio API (No external MP3 needed!)
  const playOrderSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playTone(587.33, 0, 0.2);    // D5
      playTone(880, 0.2, 0.45);    // A5 (Zomato-style chime)
    } catch (e) {
      console.log("Audio play blocked until user interaction");
    }
  };

  useEffect(() => {
    fetchOrdersAndData();
    fetchProducts();

    // Supabase Realtime Listener for Instant New Orders
    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          playOrderSound();
          fetchOrdersAndData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

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

  // ==========================================
  // 2. LIVE BUSINESS ANALYTICS COMPUTATIONS
  // ==========================================
  const validOrders = useMemo(
    () => orders.filter((o) => o.order_status !== "UTR Rejected"),
    [orders]
  );

  const pendingCount = useMemo(
    () => orders.filter((o) => o.order_status === "Payment Verification Pending").length,
    [orders]
  );

  const bakingCount = useMemo(
    () => orders.filter((o) => o.order_status === "Confirmed & Baking").length,
    [orders]
  );

  const totalRevenue = useMemo(
    () => validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
    [validOrders]
  );

  const todayRevenue = useMemo(() => {
    const todayStr = new Date().toDateString();
    return validOrders
      .filter((o) => new Date(o.created_at).toDateString() === todayStr)
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  }, [validOrders]);

  const estimatedNetProfit = Math.round((totalRevenue * profitMarginPercent) / 100);
  const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  // Top Selling Cakes & Popular Weights Calculation
  const { topCakes, weightBreakdown } = useMemo(() => {
    const cakeMap: Record<string, { name: string; count: number; revenue: number; image: string }> = {};
    const weights: Record<string, number> = {};

    validOrders.forEach((order) => {
      (order.cart_items || []).forEach((item: any) => {
        const qty = Number(item.quantity || 1);
        const nameKey = item.name || "Custom Cake";
        if (!cakeMap[nameKey]) {
          cakeMap[nameKey] = { name: nameKey, count: 0, revenue: 0, image: item.image || "" };
        }
        cakeMap[nameKey].count += qty;
        cakeMap[nameKey].revenue += Number(item.price || 0) * qty;

        const wKey = item.weight || "500 gm";
        weights[wKey] = (weights[wKey] || 0) + qty;
      });
    });

    const sortedCakes = Object.values(cakeMap).sort((a, b) => b.count - a.count).slice(0, 5);
    return { topCakes: sortedCakes, weightBreakdown: weights };
  }, [validOrders]);

  // Customer Spend & VIP Calculation
  const enrichedCustomers = useMemo(() => {
    const custMap: Record<string, any> = {};

    Object.values(addresses).forEach((addr: any) => {
      const phoneKey = addr.phone_number || String(addr.id);
      if (!custMap[phoneKey]) {
        custMap[phoneKey] = {
          ...addr,
          orderCount: 0,
          totalSpent: 0,
        };
      }
    });

    validOrders.forEach((o) => {
      const addr = addresses[o.address_id];
      if (addr) {
        const phoneKey = addr.phone_number || String(addr.id);
        if (custMap[phoneKey]) {
          custMap[phoneKey].orderCount += 1;
          custMap[phoneKey].totalSpent += Number(o.total_amount || 0);
        }
      }
    });

    return Object.values(custMap).sort((a: any, b: any) => b.totalSpent - a.totalSpent);
  }, [addresses, validOrders]);

  // Filtered Orders for Tab 1
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

  // ==========================================
  // 3. PRODUCTS TAB STATES & FUNCTIONS (Aapka Original Code)
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
    <div className="min-h-screen bg-[#f4f6f9] pb-24 font-sans text-gray-800">
      
      {/* =========================================================
          1. ULTRA-PREMIUM DARK SLATE GLASS HEADER
          ========================================================= */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white sticky top-0 z-30 shadow-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#e8416d] to-pink-600 p-2.5 rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  ROYAL COMMAND CENTER
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Executive Bakery Operations & Realtime UTR Control</p>
            </div>
          </div>

          {/* Live KPI Pills + Sound Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-slate-800/90 border border-amber-500/40 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <div>
                <span className="text-[9px] font-bold text-amber-300 block uppercase">Pending UTR</span>
                <span className="text-sm font-black text-white">{pendingCount}</span>
              </div>
            </div>

            <div className="bg-slate-800/90 border border-blue-500/40 px-3 py-1.5 rounded-xl hidden sm:block">
              <span className="text-[9px] font-bold text-blue-300 block uppercase">In Kitchen</span>
              <span className="text-sm font-black text-white">{bakingCount} Baking</span>
            </div>

            <div className="bg-slate-800/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
              <span className="text-[9px] font-bold text-emerald-300 block uppercase">Today / Total</span>
              <span className="text-sm font-black text-emerald-400">₹{todayRevenue} <span className="text-slate-400 text-xs">/ ₹{totalRevenue}</span></span>
            </div>

            {/* Sound Alert Button */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playOrderSound();
              }}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                soundEnabled 
                  ? "bg-pink-500/20 border-pink-500/40 text-pink-300 hover:bg-pink-500/30" 
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
              title={soundEnabled ? "Order Sound Alert ON" : "Sound Muted"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <a 
              href="/" 
              target="_blank" 
              className="bg-white text-slate-900 px-3.5 py-2 rounded-xl text-xs font-black hover:bg-pink-50 transition shadow-sm"
            >
              Storefront ↗
            </a>
          </div>
        </div>

        {/* DESKTOP NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 hidden md:flex gap-2 pt-1 pb-3 border-t border-slate-800/80">
          {[
            { id: "orders", label: `📦 Live Orders & UTR (${orders.length})`, badge: pendingCount > 0 ? pendingCount : null },
            { id: "analytics", label: "📊 Profit & Best-Sellers", badge: null },
            { id: "products", label: `🎂 Menu & Rate Control (${products.length})`, badge: null },
            { id: "customers", label: `👑 VIP Customers (${enrichedCustomers.length})`, badge: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#e8416d] to-pink-500 text-white shadow-lg shadow-pink-500/25"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================
          2. MAIN TAB CONTENT AREA
          ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* ---------------- TAB 1: LIVE ORDERS & UTR ---------------- */}
        {activeTab === "orders" && (
          <div className="space-y-5">
            
            {/* Search & Status Pills */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/70 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Order #ID, 12-Digit UTR, Customer Name or Mobile..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#e8416d]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
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
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === t.val
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}

                <button
                  onClick={fetchOrdersAndData}
                  className="p-2.5 bg-pink-50 text-[#e8416d] border border-pink-200 rounded-xl hover:bg-pink-100 active:scale-95 transition cursor-pointer"
                  title="Refresh Live Orders"
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Orders Feed */}
            {ordersLoading ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                <RefreshCw className="w-8 h-8 text-[#e8416d] animate-spin mx-auto mb-3" />
                <p className="font-bold text-gray-600">Syncing live cake orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                <Cake className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-700">No Matching Orders</h3>
                <p className="text-xs text-gray-400 mt-1">Jaise hi naya order aayega, ghanti bajegi aur yahan dikhega.</p>
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

                  const stepIndex = isPending ? 1 : isBaking ? 2 : isOut ? 3 : isDelivered ? 4 : 0;

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${
                        isPending
                          ? "border-amber-300"
                          : isBaking
                          ? "border-blue-300"
                          : isDelivered
                          ? "border-emerald-300"
                          : isRejected
                          ? "border-red-200 opacity-75"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Top Bar + Visual Stepper */}
                      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#e8416d] text-white text-xs font-black px-3 py-1 rounded-lg">
                            ORDER #{order.id}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-pink-400" />
                            {new Date(order.created_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* 4-Step Visual Progress Pill */}
                        {!isRejected ? (
                          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold">
                            {[
                              { s: 1, label: "1. UTR Verify" },
                              { s: 2, label: "2. Baking" },
                              { s: 3, label: "3. Out for Delivery" },
                              { s: 4, label: "4. Delivered" },
                            ].map((st) => (
                              <span
                                key={st.s}
                                className={`px-2.5 py-0.5 rounded-full ${
                                  stepIndex === st.s
                                    ? "bg-amber-400 text-slate-950 font-black"
                                    : stepIndex > st.s
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-slate-800 text-slate-500"
                                }`}
                              >
                                {st.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black px-3 py-1 rounded-full">
                            ❌ UTR Rejected
                          </span>
                        )}

                        {/* Kitchen Slip Button */}
                        <button
                          onClick={() => setSelectedSlipOrder({ order, customer })}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-pink-400" /> Kitchen Slip
                        </button>
                      </div>

                      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                        
                        {/* 1. Cake Items */}
                        <div className="lg:col-span-5 space-y-3">
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                            🎂 Ordered Items ({order.cart_items?.length || 0})
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
                                        ❤️ Heart
                                      </span>
                                    )}
                                    <span className="text-[11px] bg-gray-200 text-gray-800 px-2 py-0.5 rounded font-bold">
                                      Qty: {item.quantity || 1}
                                    </span>
                                  </div>

                                  {item.message && (
                                    <p className="mt-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-950 px-2.5 py-1 rounded-lg font-bold">
                                      ✍️ Msg on Cake: <span className="underline">"{item.message}"</span>
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

                        {/* 2. Customer Address */}
                        <div className="lg:col-span-4 space-y-2.5 border-t lg:border-t-0 lg:border-l lg:border-r border-gray-100 pt-4 lg:pt-0 lg:px-4">
                          <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                            📍 Delivery Address
                          </h4>

                          {customer ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-gray-900 text-base">{customer.full_name}</span>
                                <span className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                  {customer.address_type || "Home"}
                                </span>
                              </div>

                              <a
                                href={`tel:${customer.phone_number}`}
                                className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-emerald-100"
                              >
                                <Phone className="w-3.5 h-3.5" /> {customer.phone_number}
                              </a>

                              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 space-y-1 leading-relaxed">
                                <p className="font-semibold text-gray-900">{customer.detailed_address}</p>
                                {customer.landmark && (
                                  <p className="text-[#e8416d] font-bold">🚩 Landmark: {customer.landmark}</p>
                                )}
                                <p className="text-gray-500 font-bold">
                                  {customer.city} — <span className="text-gray-900">{customer.pincode}</span>
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              Address ID: {order.address_id || "Not Linked"}
                            </div>
                          )}
                        </div>

                        {/* 3. UTR Verification & 1-Click Actions */}
                        <div className="lg:col-span-3 flex flex-col justify-between space-y-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                          <div>
                            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">
                              💳 UPI & UTR Check
                            </h4>

                            <div className="bg-amber-50/90 border-2 border-amber-200 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-900">Total Bill:</span>
                                <span className="text-lg font-black text-emerald-700">₹{order.total_amount}</span>
                              </div>

                              <div className="pt-2 border-t border-amber-200/70">
                                <span className="text-[10px] font-black uppercase text-amber-800 block">
                                  12-Digit UTR Number:
                                </span>
                                <div className="flex items-center justify-between gap-2 mt-1 bg-white px-2.5 py-1.5 rounded-lg border border-amber-300">
                                  <span className="font-mono font-black text-sm text-gray-900 tracking-wider select-all">
                                    {order.utr_number || "N/A"}
                                  </span>
                                  {order.utr_number && (
                                    <button
                                      onClick={() => handleCopyUtr(order.utr_number)}
                                      className="text-gray-500 hover:text-gray-900 p-1 cursor-pointer"
                                      title="Copy UTR"
                                    >
                                      {copiedUtr === order.utr_number ? (
                                        <Check className="w-4 h-4 text-emerald-600" />
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
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
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
                                  ❌ Reject Invalid UTR
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
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
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

        {/* ---------------- TAB 2: REAL ANALYTICS, PROFIT & TOP SELLERS ---------------- */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            
            {/* Executive KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Gross Revenue</span>
                <p className="text-3xl font-black text-gray-900 mt-1">₹{totalRevenue}</p>
                <p className="text-xs text-emerald-600 font-bold mt-1">Today: ₹{todayRevenue}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-md text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase opacity-90">Est. Net Profit ({profitMarginPercent}%)</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-3xl font-black mt-1">₹{estimatedNetProfit}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <span>Margin:</span>
                  <input
                    type="range"
                    min={20}
                    max={75}
                    value={profitMarginPercent}
                    onChange={(e) => setProfitMarginPercent(Number(e.target.value))}
                    className="w-24 accent-white cursor-pointer"
                  />
                  <span className="font-bold">{profitMarginPercent}%</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Average Order Value</span>
                <p className="text-3xl font-black text-gray-900 mt-1">₹{avgOrderValue}</p>
                <p className="text-xs text-blue-600 font-bold mt-1">Across {validOrders.length} active orders</p>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Repeat / VIP Buyers</span>
                <p className="text-3xl font-black text-[#e8416d] mt-1">
                  {enrichedCustomers.filter((c: any) => c.orderCount > 1).length}
                </p>
                <p className="text-xs text-gray-500 font-semibold mt-1">Out of {enrichedCustomers.length} total customers</p>
              </div>
            </div>

            {/* Best Selling Cakes & Popular Weights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Top 5 Best-Selling Cakes */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#e8416d]" /> Top Best-Selling Cakes
                </h3>

                {topCakes.length === 0 ? (
                  <p className="text-xs text-gray-400 py-8 text-center">Orders aane par top cakes ki ranking yahan dikhegi.</p>
                ) : (
                  <div className="space-y-3">
                    {topCakes.map((cake, index) => (
                      <div key={cake.name} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#e8416d] text-white text-xs font-black flex items-center justify-center">
                            #{index + 1}
                          </span>
                          {cake.image && (
                            <img src={cake.image} alt={cake.name} className="w-11 h-11 rounded-lg object-cover border bg-white" />
                          )}
                          <div>
                            <p className="font-bold text-sm text-gray-900">{cake.name}</p>
                            <p className="text-xs text-gray-500">{cake.count} Cakes Sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600">₹{cake.revenue}</span>
                          <span className="block text-[10px] text-gray-400">Revenue</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Weights Demand */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#e8416d]" /> Weight Demand
                </h3>

                {Object.keys(weightBreakdown).length === 0 ? (
                  <p className="text-xs text-gray-400 py-8 text-center">No weight data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(weightBreakdown).map(([w, count]) => (
                      <div key={w} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-black text-gray-700">{w}</span>
                        <span className="text-xs font-black bg-pink-100 text-[#e8416d] px-2.5 py-1 rounded-lg">
                          {count} Sold
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ---------------- TAB 3: PRODUCTS, RATES & UPLOAD (Original Code) ---------------- */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        className={`absolute top-2 left-2 z-10 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded shadow-sm backdrop-blur-md transition cursor-pointer ${p.in_stock === false ? 'bg-red-500/90 text-white' : 'bg-white/90 text-green-600'}`}
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
                        <button onClick={() => handleEdit(p)} className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow text-blue-500 hover:bg-blue-50 cursor-pointer">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow text-red-500 hover:bg-red-50 cursor-pointer">
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

        {/* ---------------- TAB 4: VIP CUSTOMER DIRECTORY & OFFER BROADCAST ---------------- */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#e8416d]" /> Customer CRM & VIP Directory ({enrichedCustomers.length})
            </h2>

            {enrichedCustomers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Abhi tak kisi customer ne address save nahi kiya hai.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrichedCustomers.map((cust: any) => {
                  const isVip = cust.orderCount >= 2 || cust.totalSpent >= 1000;
                  const cleanPhone = (cust.phone_number || "").replace(/\D/g, "");
                  const promoMsg = `🎁 *Special VIP Treat from Royal Digital Cakes!*\n\nHi *${cust.full_name}*,\nThank you for loving our cakes! Use code *ROYAL50* on your next order for flat ₹50 OFF! 🎂✨`;

                  return (
                    <div
                      key={cust.id}
                      className={`rounded-2xl p-4 space-y-2.5 border transition ${
                        isVip ? "bg-amber-50/40 border-amber-300 shadow-sm" : "bg-gray-50 border-gray-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                          {cust.full_name}
                          {isVip && (
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              👑 VIP
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-white border px-2 py-0.5 rounded text-gray-600">
                          {cust.orderCount} {cust.orderCount === 1 ? "Order" : "Orders"} • ₹{cust.totalSpent}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 font-semibold">📞 {cust.phone_number}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        📍 {cust.detailed_address}, {cust.city} - {cust.pincode}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`tel:${cust.phone_number}`}
                          className="text-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 py-2 rounded-xl text-xs font-bold transition"
                        >
                          📞 Call
                        </a>
                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(promoMsg)}`}
                          target="_blank"
                          className="text-center bg-emerald-600 text-white hover:bg-emerald-700 py-2 rounded-xl text-xs font-bold transition"
                        >
                          🎁 Send VIP Offer
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* =========================================================
          3. KITCHEN SLIP / THERMAL RECEIPT MODAL
          ========================================================= */}
      {selectedSlipOrder && (
        <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-dashed border-gray-300 font-mono text-gray-900 relative">
            <button
              onClick={() => setSelectedSlipOrder(null)}
              className="absolute top-3 right-3 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-3">
              <h3 className="text-base font-black uppercase">🍰 ROYAL DIGITAL CAKES</h3>
              <p className="text-[11px] text-gray-500">KITCHEN & DELIVERY KOT SLIP</p>
              <p className="text-xs font-bold mt-1">ORDER #{selectedSlipOrder.order.id}</p>
            </div>

            <div className="space-y-2 text-xs border-b-2 border-dashed border-gray-300 pb-3 mb-3">
              <p><strong>SLOT:</strong> {selectedSlipOrder.order.delivery_date || "Today"} ({selectedSlipOrder.order.delivery_time || "Standard"})</p>
              <p><strong>CUSTOMER:</strong> {selectedSlipOrder.customer?.full_name || "N/A"}</p>
              <p><strong>PHONE:</strong> {selectedSlipOrder.customer?.phone_number || "N/A"}</p>
              <p><strong>ADDRESS:</strong> {selectedSlipOrder.customer?.detailed_address}, {selectedSlipOrder.customer?.landmark}</p>
            </div>

            <div className="space-y-2.5 text-xs border-b-2 border-dashed border-gray-300 pb-3 mb-3">
              <p className="font-black uppercase">ITEMS TO PREPARE:</p>
              {(selectedSlipOrder.order.cart_items || []).map((it: any, i: number) => (
                <div key={i} className="bg-gray-50 p-2 rounded border">
                  <p className="font-bold">{i + 1}. {it.name} (x{it.quantity || 1})</p>
                  <p className="text-[11px]">Weight: <strong>{it.weight}</strong> | {it.isEggless ? "EGGLESS" : "REGULAR"} {it.isHeartShape ? "| HEART SHAPE" : ""}</p>
                  {it.message && (
                    <p className="mt-1 bg-yellow-100 p-1 font-black text-xs">
                      MSG ON CAKE: "{it.message}"
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm font-black mb-4">
              <span>TOTAL PAID (UPI):</span>
              <span>₹{selectedSlipOrder.order.total_amount}</span>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-slate-900 text-white font-sans font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-slate-800 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> PRINT KITCHEN SLIP
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          4. MOBILE FLOATING BOTTOM NAVIGATION BAR (THUMB FRIENDLY)
          ========================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white border-t border-slate-800 z-40 px-2 py-2 flex justify-around items-center shadow-2xl">
        {[
          { id: "orders", label: "Orders", icon: ShoppingBag, badge: pendingCount },
          { id: "analytics", label: "Profit", icon: TrendingUp, badge: 0 },
          { id: "products", label: "Cakes", icon: Cake, badge: 0 },
          { id: "customers", label: "VIPs", icon: Users, badge: 0 },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition ${
                isActive ? "text-[#e8416d] font-black" : "text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute -top-1 right-1 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
