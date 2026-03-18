import { useQuery, useMutation } from '@tanstack/react-query';
import { orderApi } from '../api';

export interface Order {
  _id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  shippingDetails: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function useUserOrders(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['user-orders', params],
    queryFn: async () => {
      const response = await orderApi.getUserOrders(params);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });
}

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await orderApi.getById(orderId);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!orderId,
  });
}

export function useVendorOrders(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['vendor-orders', params],
    queryFn: async () => {
      const response = await orderApi.getVendorOrders(params);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const response = await orderApi.updateStatus(orderId, status);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });
}
