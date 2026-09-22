import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

export interface AddItemResult {
  success: boolean;
  message?: string;
  addedQuantity: number;
}

export interface UpdateQuantityResult {
  success: boolean;
  message?: string;
  clamped?: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => AddItemResult;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => UpdateQuantityResult;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (productId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1): AddItemResult => {
        const maxStock = product.stock ?? product.stock_quantity ?? 0;

        if (maxStock <= 0) {
          return {
            success: false,
            message: 'Sản phẩm hiện đã hết hàng trong kho.',
            addedQuantity: 0,
          };
        }

        const state = get();
        const existingItemIndex = state.items.findIndex(
          (item) => item.product.id === product.id
        );
        const currentQty = existingItemIndex > -1 ? state.items[existingItemIndex].quantity : 0;

        if (currentQty >= maxStock) {
          return {
            success: false,
            message: `Bạn đã có ${currentQty} máy trong giỏ hàng (đã đạt giới hạn tồn kho ${maxStock} máy).`,
            addedQuantity: 0,
          };
        }

        const availableToAdd = maxStock - currentQty;
        const actualAdd = Math.min(quantity, availableToAdd);
        const isClamped = quantity > availableToAdd;

        set((s) => {
          if (existingItemIndex > -1) {
            const updatedItems = [...s.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: currentQty + actualAdd,
            };
            return { items: updatedItems };
          }
          return { items: [...s.items, { product, quantity: actualAdd }] };
        });

        if (isClamped) {
          return {
            success: true,
            message: `Chỉ còn ${maxStock} máy trong kho. Đã thêm tối đa ${actualAdd} máy vào giỏ hàng.`,
            addedQuantity: actualAdd,
          };
        }

        return {
          success: true,
          addedQuantity: actualAdd,
        };
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number): UpdateQuantityResult => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return { success: true };
        }

        const state = get();
        const targetItem = state.items.find((i) => i.product.id === productId);
        if (!targetItem) {
          return { success: false, message: 'Sản phẩm không có trong giỏ hàng.' };
        }

        const maxStock = targetItem.product.stock ?? targetItem.product.stock_quantity ?? 0;

        if (quantity > maxStock) {
          set((s) => ({
            items: s.items.map((item) =>
              item.product.id === productId ? { ...item, quantity: maxStock } : item
            ),
          }));
          return {
            success: false,
            clamped: true,
            message: `Số lượng yêu cầu (${quantity}) vượt quá tồn kho (${maxStock} máy). Hệ thống đã tự động điều chỉnh về ${maxStock}.`,
          };
        }

        set((s) => ({
          items: s.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));

        return { success: true };
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find((i) => i.product.id === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'bkstore-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
