import { create } from 'zustand';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  weight: string;
  isEggless: boolean;
  isHeartShape: boolean;
  quantity: number;
}

interface CartStore {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  deliveryDate: string;
  setDeliveryDate: (date: string) => void;
  deliveryTime: string;
  setDeliveryTime: (time: string) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  
  cartItems: [],
  addToCart: (item) => set((state) => {
    // Agar same item pehle se hai toh quantity badha do
    const existingItem = state.cartItems.find((i) => i.id === item.id);
    if (existingItem) {
      return {
        cartItems: state.cartItems.map((i) => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
        isCartOpen: true // Add karte hi drawer khul jaye
      };
    }
    return { cartItems: [...state.cartItems, { ...item, quantity: 1 }], isCartOpen: true };
  }),
  removeFromCart: (id) => set((state) => ({
    cartItems: state.cartItems.filter((item) => item.id !== id)
  })),

  deliveryDate: "",
  setDeliveryDate: (date) => set({ deliveryDate: date }),
  deliveryTime: "",
  setDeliveryTime: (time) => set({ deliveryTime: time }),
}));
