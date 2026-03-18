import { useMutation, useQuery } from '@tanstack/react-query';
import { useCartStore } from '../stores/cartStore';
import { cartApi } from '../api';

export function useCart() {
  return useCartStore();
}

export function useCartItems() {
  const { items } = useCartStore();
  
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await cartApi.get();
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    initialData: items,
  });
}

export function useAddToCart() {
  const { addItem } = useCartStore();

  return useMutation({
    mutationFn: async ({
      productId,
      tenantId,
      quantity,
      price,
      name,
      image,
    }: {
      productId: string;
      tenantId: string;
      quantity: number;
      price: number;
      name: string;
      image?: string;
    }) => {
      const response = await cartApi.addItem(productId, tenantId, quantity);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data, variables) => {
      addItem({
        productId: variables.productId,
        quantity: variables.quantity,
        price: variables.price,
        name: variables.name,
        vendorId: variables.tenantId,
        image: variables.image,
      });
    },
  });
}

export function useRemoveFromCart() {
  const { removeItem } = useCartStore();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await cartApi.removeItem(productId);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data, variables) => {
      removeItem(variables);
    },
  });
}

export function useUpdateCartQuantity() {
  const { updateItemQuantity } = useCartStore();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const response = await cartApi.updateQuantity(productId, quantity);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data, variables) => {
      updateItemQuantity(variables.productId, variables.quantity);
    },
  });
}

export function useClearCart() {
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: async () => {
      const response = await cartApi.clear();
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      clearCart();
    },
  });
}

export function useCartSummary() {
  const { items, getTotal } = useCartStore();

  return {
    items,
    total: getTotal(),
    itemCount: items.length,
  };
}
