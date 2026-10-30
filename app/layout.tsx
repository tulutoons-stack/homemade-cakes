import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// CartDrawer ko import kar rahe hain (Dhyan rakhein ki path aapke folder structure se match kare)
import CartDrawer from "./components/CartDrawer"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hommade Cakes $ Gifts", // Aap chahein toh apna title yahan set kar sakte hain
  description: "Freshly Baked Homemade Cakes",
};

// Aapke template ka original LayoutProps use kar rahe hain
export default function RootLayout({ children }: any) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Global Cart Drawer yahan add kar diya gaya hai */}
        <CartDrawer />
      </body>
    </html>
  );
}
