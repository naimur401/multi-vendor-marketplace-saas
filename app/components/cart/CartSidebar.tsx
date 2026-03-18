'use client';

import { useCartStore } from '@/app/lib/stores/cartStore';
import { useUIStore } from '@/app/lib/stores/uiStore';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';

export function CartSidebar() {
  const { items, getTotal, getItemCount } = useCartStore();
  const { isCartOpen, closeCart } = useUIStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeCart}
      />

      <div className="relative ml-auto w-full max-w-sm bg-background flex flex-col max-h-screen">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart ({getItemCount()})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeCart}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 pb-3 border-b last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>

              <Link href="/cart" onClick={closeCart}>
                <Button className="w-full">View Cart</Button>
              </Link>

              <Link href="/checkout" onClick={closeCart}>
                <Button className="w-full" variant="default">
                  Checkout
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
