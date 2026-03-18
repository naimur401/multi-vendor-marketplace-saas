// Auth Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'vendor' | 'admin';
  tenantId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  tenantId: string;
  vendorName: string;
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  tenantId: string;
  items: OrderItem[];
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Tenant Types
export interface Tenant {
  _id: string;
  name: string;
  description: string;
  logo: string;
  owner: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
