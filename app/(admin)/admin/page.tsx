'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ✅ Proper Type بدل any
type Stats = {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  totalVendors: number;
  activeVendors: number;
  totalUsers: number;
};

type ChartData = {
  date: string;
  revenue: number;
  orders: number;
  users: number;
};

export default function AdminDashboard() {
  // ✅ static হলে state লাগবে না
  const stats: Stats = {
    totalRevenue: 45680,
    totalOrders: 234,
    completedOrders: 198,
    totalVendors: 12,
    activeVendors: 10,
    totalUsers: 456,
  };

  // ✅ only needed state রাখা হয়েছে
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const last7Days: ChartData[] = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(Math.random() * 5000) + 2000,
      orders: Math.floor(Math.random() * 50) + 20,
      users: Math.floor(Math.random() * 30) + 10,
    }));

    setChartData(last7Days);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and analytics</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalVendors}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeVendors} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#10b981" />
                <Bar dataKey="users" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm">Database</span>
            <span className="text-green-600 text-sm font-semibold">
              Connected
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm">API Server</span>
            <span className="text-green-600 text-sm font-semibold">
              Online
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm">Socket.IO</span>
            <span className="text-green-600 text-sm font-semibold">
              Connected
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm">Last Updated</span>
            <span className="text-muted-foreground text-sm">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}