'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/app/components/cart/AddToCartButton';
import { Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  vendorName: string;
  rating?: number;
  reviews?: number;
  stock: number;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  category,
  vendorName,
  rating = 4.5,
  reviews = 0,
  stock,
}: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition group">
      <Link href={`/product/${id}`}>
        <div className="relative h-48 bg-muted overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-110 transition duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute top-2 right-2" variant={stock > 0 ? 'default' : 'secondary'}>
            {stock > 0 ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product/${id}`} className="hover:text-primary transition">
          <h3 className="font-semibold line-clamp-2">{name}</h3>
        </Link>

        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{description}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">{vendorName}</span>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>

        <div className="flex items-center gap-1 mt-2">
          <div className="flex items-center gap-0.5">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <span className="text-lg font-bold">${price.toFixed(2)}</span>
          <AddToCartButton
            productId={id}
            onAdded={handleAddToCart}
            disabled={stock === 0}
            isAdded={isAdded}
          />
        </div>
      </div>
    </Card>
  );
}
