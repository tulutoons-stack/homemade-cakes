import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  weight: string;
  isEggless?: boolean;
  isHeartShape?: boolean;
  message?: string;
  quantity: number;
}

interface CartStore {
  cartItems: CartItem[];
  isCartOpen: boolean;
  deliveryDate: string;
  deliveryTime: string;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  setDeliveryDate: (date: string) => void;
  setDeliveryTime: (time: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isCartOpen: false,
      deliveryDate: "",
      deliveryTime: "",

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addToCart: (newItem) =>
        set((state) => {
          const existingIndex = state.cartItems.findIndex(
            (item) =>
              item.id === newItem.id &&
              item.weight === newItem.weight &&
              item.isEggless === newItem.isEggless &&
              item.isHeartShape === newItem.isHeartShape
          );

          if (existingIndex > -1) {
            const updated = [...state.cartItems];
            updated[existingIndex].quantity += newItem.quantity || 1;
            return { cartItems: updated };
          }
          return {
            cartItems: [...state.cartItems, { ...newItem, quantity: newItem.quantity || 1 }],
          };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        })),

      setDeliveryDate: (date) => set({ deliveryDate: date }),
      setDeliveryTime: (time) => set({ deliveryTime: time }),

      clearCart: () =>
        set({
          cartItems: [],
          deliveryDate: "",
          deliveryTime: "",
        }),

      getCartTotal: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.price * (item.quantity || 1),
          0
        );
      },
    }),
    {
      name: "royal-bakery-cart", // Browser memory me cart ko hamesha yaad rakhega!
    }
  )
);
