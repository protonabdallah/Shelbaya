"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  nameAr?: string | null;
  price: number;
  image?: string | null;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
  total: 0,
  count: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shelbaya_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("shelbaya_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, item.stock);
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: newQty } : i
        );
      }
      const cappedQty = Math.min(quantity, item.stock);
      return [...prev, { ...item, quantity: cappedQty }];
    });
  };

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const capped = Math.min(qty, i.stock);
        return { ...i, quantity: capped };
      })
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
