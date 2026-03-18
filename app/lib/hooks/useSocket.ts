'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token || !user) return;

    // Initialize socket connection
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, user]);

  return { socket, isConnected };
}

export function useOrderNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderCreated = (data: any) => {
      setNotifications((prev) => [
        ...prev,
        { type: 'order_created', data, timestamp: Date.now() },
      ]);
    };

    const handlePaymentSuccess = (data: any) => {
      setNotifications((prev) => [
        ...prev,
        { type: 'payment_success', data, timestamp: Date.now() },
      ]);
    };

    const handleNewOrder = (data: any) => {
      setNotifications((prev) => [
        ...prev,
        { type: 'new_order', data, timestamp: Date.now() },
      ]);
    };

    const handleOrderStatusUpdated = (data: any) => {
      setNotifications((prev) => [
        ...prev,
        { type: 'order_status_updated', data, timestamp: Date.now() },
      ]);
    };

    socket.on('order_created', handleOrderCreated);
    socket.on('payment_success', handlePaymentSuccess);
    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleOrderStatusUpdated);

    return () => {
      socket.off('order_created', handleOrderCreated);
      socket.off('payment_success', handlePaymentSuccess);
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleOrderStatusUpdated);
    };
  }, [socket]);

  return { notifications, setNotifications };
}

export function useVendorNotifications() {
  const { socket } = useSocket();
  const [vendorNotifications, setVendorNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data: any) => {
      setVendorNotifications((prev) => [
        ...prev,
        { type: 'new_order', data, timestamp: Date.now() },
      ]);
    };

    const handleOrderStatusUpdated = (data: any) => {
      setVendorNotifications((prev) => [
        ...prev,
        { type: 'order_status_updated', data, timestamp: Date.now() },
      ]);
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleOrderStatusUpdated);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleOrderStatusUpdated);
    };
  }, [socket]);

  return { vendorNotifications, setVendorNotifications };
}
