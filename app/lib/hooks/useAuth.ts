import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api';

export function useAuth() {
  return useAuthStore();
}

export function useLogin() {
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await authApi.login(credentials);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data: any) => {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
    },
  });
}

export function useRegister() {
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const response = await authApi.register(userData);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data: any) => {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      logout();
      localStorage.removeItem('token');
    },
    onSuccess: () => {
      logout();
    },
  });
}

export function useProfile() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await authApi.getProfile();
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    enabled: !!token,
  });
}

export function useCreateStore() {
  return useMutation({
    mutationFn: async (storeData: {
      name: string;
      description: string;
      category: string;
    }) => {
      const response = await authApi.createVendorStore(storeData);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
  });
}
