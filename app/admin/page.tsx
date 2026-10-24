"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Package, Star, Loader2 } from "lucide-react";
import { supabase } from "../supabase";

export default function AdminPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [discount, setDiscount] = useState("");
  const [rating, setRating] = useState("4.7");
  const [reviews, setReviews] = useState("120");
  const [delivery, setDelivery] = useState("Today");
  
  // 4 Images ke liye state
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image3, setImage3] = useState<File | null>(null);
  const [image4, setImage4] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    if (error) console.error("Error fetching products:", error);
  };

  useEffect(() => {
    if (mrp && price) {
      const m = parseFloat(mrp);
      const p = parseFloat(price);
      if (m > p) {
         setDiscount(`${Math.round(((m - p) / m) * 100)}% Off`);
      }
    }
  }, [price, mrp]);

  // Ek common function jo koi bhi image upload karke uska URL de dega
  const uploadSingleImage = async (file: File | null) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('cake_images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('cake_images')
      .getPublicUrl(fileName);
      
    return publicUrl;
  };

  const handleAddProduct = async (e: any) => {
    e.preventDefault();
    if (!name || !price || !image1) return alert("Bhai, Name, Price aur Main Image (Photo 1) zaroori hai!");

    setIsUploading(true);
    try {
      // Charo images upload karo
      const url1 = await uploadSingleImage(image1);
      const url2 = await uploadSingleImage(image2);
      const url3 = await uploadSingleImage(image3);
      const url4 = await uploadSingleImage(image4);

      // Database me insert karo (Saari purani details ke sath 4 nayi images)
      const { error: dbError } = await supabase
        .from('products')
        .insert([{
          name, 
          price: parseInt(price), 
          mrp: mrp ? parseInt(mrp) : null,
          discount: discount || null, 
          rating: rating || "4.5",
          reviews: reviews || "10", 
          delivery: delivery || "Today", 
          img_url: url1,      // Purana column
          img_url_2: url2,    // Naya column
          img_url_3: url3,    // Naya column
          img_url_4: url4     // Naya column
        }]);

      if (dbError) throw dbError;

      fetchProducts();
      setName(""); setPrice(""); setMrp(""); setDiscount("");
      setImage1(null); setImage2(null); setImage3(null); setImage4(null);
      alert("Product with 4 images successfully uploaded to cloud! 🚀");
    } catch (error: any) {
      console.error("Upload error:", error.message);
      alert("Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure you want to delete this item?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(products.filter(p => p.id !== id));
    else alert("Delete failed: " + error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div><h1 className="text-3xl font-black text-[#4B164C]">H.M.C.G Cloud Admin</h1></div>
          <a href="/" className="bg-white border px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50">Live Website Dekho →</a>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#e8416d]"><Plus className="w-5 h-5" /> Cloud Par Upload Karein</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Cake/Product Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Yummylicious Chocolate" className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-[#e8416d]" required />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Selling Price (₹) *</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="529" className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-[#e8416d]" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Original MRP (₹)</label>
                  <input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="779" className="w-full p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-[#e8416d]" />
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
              <label className="text-sm font-bold text-gray-700 block mb-2">Upload 4 Images *</label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="w-full relative border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:bg-gray-50 cursor-pointer">
                  <input type="file" required accept="image/*" onChange={(e) => setImage1(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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

              <button disabled={isUploading} type="submit" className="w-full bg-[#e8416d] text-white font-bold py-3.5 mt-4 rounded-xl hover:bg-[#d11243] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isUploading ? "Uploading 4 Images..." : "Live Website Par Daalein 🚀"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#4B164C]"><Package className="w-5 h-5" /> Live Cloud Database ({products.length})</h2>
            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-2xl">Supabase empty hai. Upload your first product!</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="border border-gray-100 rounded-xl p-3 relative group hover:shadow-md transition">
                    <img src={p.img_url} alt={p.name} className="w-full h-36 object-cover rounded-lg mb-2.5" />
                    <h3 className="font-bold text-sm text-gray-800 truncate mb-1">{p.name}</h3>
                    <div className="flex gap-2 items-center mb-1 text-xs">
                      <span className="text-black font-black">₹{p.price}</span>
                      {p.mrp && <span className="text-gray-400 line-through">₹{p.mrp}</span>}
                      {p.discount && <span className="text-green-600 font-bold bg-green-50 px-1 rounded">{p.discount}</span>}
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow text-red-500 opacity-0 group-hover:opacity-100 transition duration-200"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}