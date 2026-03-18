import { useMutation, useQuery } from '@tanstack/react-query';
import { productApi } from '../api';

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'popular' | 'price' | 'relevance';
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let response;
      if (filters?.search) {
        response = await productApi.search(filters.search, filters);
      } else {
        response = await productApi.getMarketplace(filters);
      }
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });
}

export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await productApi.getById(productId);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!productId,
  });
}

export function useVendorProducts(filters?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['vendor-products', filters],
    queryFn: async () => {
      const response = await productApi.getVendorProducts(filters);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });
}

export function useCreateProduct() {
  return useMutation({
    mutationFn: async (productData: any) => {
      const response = await productApi.create(productData);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });
}

export function useUpdateProduct() {
  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: any;
    }) => {
      const response = await productApi.update(productId, data);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });
}

export function useDeleteProduct() {
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await productApi.delete(productId);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });
}
