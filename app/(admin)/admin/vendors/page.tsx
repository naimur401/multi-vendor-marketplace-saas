'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchVendors = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/admin/vendors', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleApprove = async (id: string) => {
    await fetch(`http://127.0.0.1:5000/api/admin/vendors/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchVendors();
  };

  const handleSuspend = async (id: string) => {
    await fetch(`http://127.0.0.1:5000/api/admin/vendors/${id}/suspend`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchVendors();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;

  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const approvedVendors = vendors.filter(v => v.status === 'approved');
  const suspendedVendors = vendors.filter(v => v.status === 'suspended');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <p className="text-muted-foreground">Manage platform vendors</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{vendors.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-yellow-600">{pendingVendors.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Suspended</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-600">{suspendedVendors.length}</p></CardContent></Card>
      </div>

      {pendingVendors.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader><CardTitle>Pending Approval ({pendingVendors.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Store</TableHead><TableHead>Email</TableHead><TableHead>Date</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {pendingVendors.map(v => (
                  <TableRow key={v._id}>
                    <TableCell className="font-semibold">{v.name}</TableCell>
                    <TableCell>{v.ownerEmail}</TableCell>
                    <TableCell>{format(new Date(v.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(v._id)}>Approve</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Approved Vendors ({approvedVendors.length})</CardTitle></CardHeader>
        <CardContent>
          {approvedVendors.length === 0 ? <p className="text-muted-foreground">No approved vendors</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Store</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {approvedVendors.map(v => (
                  <TableRow key={v._id}>
                    <TableCell className="font-semibold">{v.name}</TableCell>
                    <TableCell>{v.ownerEmail}</TableCell>
                    <TableCell><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span></TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => handleSuspend(v._id)}>Suspend</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}