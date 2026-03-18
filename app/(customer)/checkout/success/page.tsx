'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/app/lib/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {sessionId && (
            <div className="bg-muted p-3 rounded text-sm">
              <p className="text-muted-foreground">Session ID:</p>
              <p className="font-mono break-all">{sessionId}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            You will receive an email confirmation shortly with your order details
            and tracking information.
          </p>

          <div className="space-y-2 pt-4">
            <Link href="/orders" className="block">
              <Button className="w-full">View My Orders</Button>
            </Link>

            <Link href="/marketplace" className="block">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
