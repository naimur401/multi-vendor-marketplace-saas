const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export interface ApiError {
  message: string;
  statusCode: number;
  details?: Array<{ path: string; message: string }>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = { ...options.headers };

    if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    let body;
    try { body = await response.json(); } catch { body = null; }

    if (!response.ok) {
      return { error: body?.error || { message: 'Request failed', statusCode: response.status } };
    }
    return { data: body };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : 'Network error', statusCode: 0 } };
  }
}

// ================= AUTH =================
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => apiCall('/auth/me', { method: 'GET' }),
  updateProfile: (data: any) => apiCall('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  createVendorStore: (data: any) => apiCall('/auth/vendor-store', { method: 'POST', body: JSON.stringify(data) }),
};

// ================= PRODUCT =================
export const productApi = {
  getMarketplace: (params?: Record<string, any>) =>
    apiCall(`/products/marketplace?${new URLSearchParams(params || {})}`, { method: 'GET' }),
  search: (query: string, params?: Record<string, any>) =>
    apiCall(`/products/search?q=${query}&${new URLSearchParams(params || {})}`, { method: 'GET' }),
  getById: (id: string) => apiCall(`/products/${id}`, { method: 'GET' }),
  getVendorProducts: (params?: Record<string, any>) =>
    apiCall(`/products/vendor/products?${new URLSearchParams(params || {})}`, { method: 'GET' }),
  create: (data: any) => apiCall('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/products/${id}`, { method: 'DELETE' }),
};

// ================= CART =================
export const cartApi = {
  get: () => apiCall('/cart', { method: 'GET' }),
  addItem: (productId: string, tenantId: string, quantity: number = 1) =>
    apiCall('/cart/add', { method: 'POST', body: JSON.stringify({ productId, tenantId, quantity }) }),
  removeItem: (productId: string) => apiCall(`/cart/${productId}`, { method: 'DELETE' }),
  updateQuantity: (productId: string, quantity: number) =>
    apiCall(`/cart/${productId}/quantity`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  clear: () => apiCall('/cart/clear', { method: 'POST' }),
};

// ================= ORDER =================
export const orderApi = {
  create: (data: any) => apiCall('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getUserOrders: (params?: Record<string, any>) =>
    apiCall(`/orders?${new URLSearchParams(params || {})}`, { method: 'GET' }),
  getById: (id: string) => apiCall(`/orders/${id}`, { method: 'GET' }),
  getVendorOrders: (params?: Record<string, any>) =>
    apiCall(`/orders/vendor/orders?${new URLSearchParams(params || {})}`, { method: 'GET' }),
  updateStatus: (id: string, status: string) =>
    apiCall(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};