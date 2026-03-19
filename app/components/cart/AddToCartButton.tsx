'use client';

import { useState } from 'react';
import { useAddToCart } from '@/app/lib/hooks/useCart';
import { useAuthStore } from '@/app/lib/stores/authStore';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  productId: string;
  price: number;
  name: string;
  tenantId: string;
  image?: string;
}

export function AddToCartButton({
  productId,
  price,
  name,
  tenantId,
  image,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { mutate: addToCart, isPending } = useAddToCart();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleClick = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    addToCart({
      productId,
      quantity,
      price,
      name,
      tenantId,
      image,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border rounded">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-2 hover:bg-gray-100"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-12 text-center border-l border-r outline-none"
        />
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="px-3 py-2 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      <Button
        onClick={handleClick}
        disabled={isPending}
        className="flex-1"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {isPending ? 'Adding...' : 'Add to Cart'}
      </Button>
    </div>
  );
}

