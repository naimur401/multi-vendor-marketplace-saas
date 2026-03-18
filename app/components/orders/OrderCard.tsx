import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/app/lib/utils/format';

interface OrderCardProps {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  total: number;
  itemCount: number;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const },
  paid: { label: 'Paid', variant: 'secondary' as const },
  processing: { label: 'Processing', variant: 'default' as const },
  completed: { label: 'Completed', variant: 'default' as const },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const },
};

export function OrderCard({ id, orderNumber, date, status, total, itemCount }: OrderCardProps) {
  const config = statusConfig[status];

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold">Order #{orderNumber}</h3>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{itemCount} items</p>
          <p className="text-sm text-muted-foreground">{formatDate(date)}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold">${total.toFixed(2)}</p>
          <Button variant="outline" className="mt-2" asChild>
            <Link href={`/orders/${id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
