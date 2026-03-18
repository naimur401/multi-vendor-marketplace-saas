'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Store, CheckCircle } from 'lucide-react';
import { authApi } from '@/app/lib/api';
import { useAuthStore } from '@/app/lib/stores/authStore';

export default function BecomeVendorPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    storeName: '',
    storeSlug: '',
    description: '',
    category: 'other',
    email: '',
    phone: '',
    address: '',
  });

  const handleStoreNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm({ ...form, storeName: name, storeSlug: slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authApi.createVendorStore({
        storeName: form.storeName,
        storeSlug: form.storeSlug,
        description: form.description,
        category: form.category,
        email: form.email,
        phone: form.phone,
        address: form.address,
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.data?.token) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        setToken(result.data.token);
        setUser(result.data.user);
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <Store className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Become a Vendor</h1>
          <p className="text-muted-foreground mt-2">Create your store and start selling today</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {['Easy Setup', 'Reach Customers', 'Grow Revenue'].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 p-3 bg-card border rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Fill in your store details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
              )}

              <div>
                <label className="text-sm font-medium mb-1 block">Store Name *</label>
                <Input
                  value={form.storeName}
                  onChange={(e) => handleStoreNameChange(e.target.value)}
                  placeholder="e.g. My Awesome Store"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Store URL</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">markethub.com/</span>
                  <Input
                    value={form.storeSlug}
                    onChange={(e) => setForm({ ...form, storeSlug: e.target.value })}
                    placeholder="my-store"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell customers about your store..."
                  className="w-full px-3 py-2 border rounded-md text-sm min-h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  required
                >
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="food">Food</option>
                  <option value="home">Home</option>
                  <option value="beauty">Beauty</option>
                  <option value="books">Books</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Contact Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="store@email.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01700000000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Address</label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Dhaka, Bangladesh"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? 'Creating Store...' : 'Create My Store'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}