'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Store, TrendingUp, Shield, Zap, Users, Star, ArrowRight, Package, CreditCard } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              The #1 Multi-Vendor Marketplace Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Buy & Sell
              <span className="text-primary"> Everything</span>
              <br />in One Place
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Connect with thousands of trusted vendors. Discover unique products or launch your own store and reach millions of customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="gap-2 text-base px-8 py-6">
                  <ShoppingBag className="w-5 h-5" />
                  Start Shopping
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 py-6">
                  <Store className="w-5 h-5" />
                  Open Your Store
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '10,000+', label: 'Products Listed' },
                { value: '500+', label: 'Active Vendors' },
                { value: '50,000+', label: 'Happy Customers' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose MarketHub?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to buy, sell, and grow — all in one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: 'Browse & Shop',
                description: 'Explore thousands of products from trusted vendors. Filter by category, price, and ratings to find exactly what you need.',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Store,
                title: 'Create Your Store',
                description: 'Set up your vendor store in minutes. Add products, manage inventory, and start selling to a global audience.',
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                icon: TrendingUp,
                title: 'Grow Your Business',
                description: 'Access powerful analytics and tools to track your sales, understand your customers, and scale your revenue.',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Every transaction is protected with enterprise-grade security. Shop and sell with complete peace of mind.',
                color: 'text-red-600',
                bg: 'bg-red-50',
              },
              {
                icon: Package,
                title: 'Order Tracking',
                description: 'Real-time order tracking from purchase to delivery. Stay informed every step of the way.',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: Users,
                title: 'Multi-Tenant System',
                description: 'Each vendor gets their own dedicated store space with custom branding and independent inventory management.',
                color: 'text-teal-600',
                bg: 'bg-teal-50',
              },
            ].map((feature) => (
              <div key={feature.title} className="p-6 border border-border rounded-xl bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 ${feature.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Get started in just a few simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* For Buyers */}
            <div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary" />
                For Buyers
              </h3>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Create Account', desc: 'Sign up for free in under a minute.' },
                  { step: '02', title: 'Browse Products', desc: 'Explore thousands of products from verified vendors.' },
                  { step: '03', title: 'Add to Cart', desc: 'Select your items and add them to your cart.' },
                  { step: '04', title: 'Checkout & Track', desc: 'Complete your purchase and track your order.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Vendors */}
            <div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <Store className="w-6 h-6 text-primary" />
                For Vendors
              </h3>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Register & Apply', desc: 'Create your account and apply to become a vendor.' },
                  { step: '02', title: 'Get Approved', desc: 'Our team reviews and approves your store quickly.' },
                  { step: '03', title: 'Add Products', desc: 'List your products with photos, prices, and descriptions.' },
                  { step: '04', title: 'Start Selling', desc: 'Receive orders and manage everything from your dashboard.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">What People Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Regular Buyer', text: 'MarketHub has the best selection of products. I find everything I need in one place!', rating: 5 },
              { name: 'Ahmed Hassan', role: 'Vendor Owner', text: 'Setting up my store was incredibly easy. Sales have grown 300% since joining!', rating: 5 },
              { name: 'Emily Chen', role: 'Small Business Owner', text: 'The vendor dashboard is powerful yet simple. Managing my inventory has never been easier.', rating: 5 },
            ].map((testimonial) => (
              <div key={testimonial.name} className="p-6 border border-border rounded-xl bg-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of buyers and sellers already using MarketHub to connect and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2 text-base px-8 py-6">
                <Users className="w-5 h-5" />
                Create Free Account
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="gap-2 text-base px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <ShoppingBag className="w-5 h-5" />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground text-lg mb-3">MarketHub</h3>
              <p className="text-muted-foreground text-sm">The modern multi-vendor marketplace platform for buyers and sellers.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">For Buyers</h4>
              <div className="space-y-2">
                <Link href="/marketplace" className="block text-sm text-muted-foreground hover:text-foreground">Browse Products</Link>
                <Link href="/orders" className="block text-sm text-muted-foreground hover:text-foreground">My Orders</Link>
                <Link href="/cart" className="block text-sm text-muted-foreground hover:text-foreground">Shopping Cart</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">For Vendors</h4>
              <div className="space-y-2">
                <Link href="/become-vendor" className="block text-sm text-muted-foreground hover:text-foreground">Become a Vendor</Link>
                <Link href="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground">Vendor Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Account</h4>
              <div className="space-y-2">
                <Link href="/login" className="block text-sm text-muted-foreground hover:text-foreground">Sign In</Link>
                <Link href="/register" className="block text-sm text-muted-foreground hover:text-foreground">Create Account</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>© 2026 MarketHub. All rights reserved. Built with Next.js, Node.js & MongoDB.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}