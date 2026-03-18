'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, ArrowLeft, Star, Truck, Shield } from 'lucide-react';
import { productApi } from '@/app/lib/api';
import { useAddToCart } from '@/app/lib/hooks/useCart';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: Array<{ url: string }>;
  rating: number;
  inventory: number;
  tenantId: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { mutate: addToCart, isPending } = useAddToCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const result = await productApi.getById(productId);
        if (result.data) {
          setProduct(result.data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      productId: product._id,
      tenantId: product.tenantId,
      quantity,
      price: product.discountPrice || product.price,
      name: product.name,
      image: product.images?.[0]?.url,
    });
  };

  const getPlaceholder = (id: string) => `https://picsum.photos/seed/${id}/600/600`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Product not found</p>
            <Link href="/marketplace">
              <Button variant="outline" className="w-full mt-4">
                Back to Marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayPrice = product.discountPrice || product.price;
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/marketplace" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-muted rounded-lg overflow-hidden aspect-square">
              <img
                src={product.images?.[selectedImage]?.url || getPlaceholder(product._id)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getPlaceholder(product._id);
                  e.currentTarget.onerror = null;
                }}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`bg-muted rounded-lg overflow-hidden aspect-square border-2 transition ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholder(product._id + idx);
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.rating} stars)</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
              <p className="text-muted-foreground mt-2">{product.category}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">${displayPrice.toFixed(2)}</span>
              {product.discountPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="px-2 py-1 bg-destructive/20 text-destructive rounded text-sm font-medium">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Stock Status */}
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Stock Available</span>
                <span className={product.inventory > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((product.inventory / 100) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Quantity Selector */}
            {product.inventory > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 border border-border rounded hover:bg-muted"
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    min="1"
                    max={product.inventory}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.min(product.inventory, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                    className="w-16 text-center"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    className="px-3 py-2 border border-border rounded hover:bg-muted"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.inventory === 0 || isPending}
              size="lg"
              className="w-full"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isPending ? 'Adding...' : product.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="pt-4 flex flex-col items-center text-center">
                  <Truck className="w-8 h-8 text-primary mb-2" />
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex flex-col items-center text-center">
                  <Shield className="w-8 h-8 text-primary mb-2" />
                  <p className="text-sm font-medium">Secure</p>
                  <p className="text-xs text-muted-foreground">30-day guarantee</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}