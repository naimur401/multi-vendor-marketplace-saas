# Quick Start Guide

Get the marketplace running in 5 minutes!

## Prerequisites
- Node.js 18+
- MongoDB account (Atlas free tier)
- Stripe account (test mode)

## Step 1: Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

## Step 2: Configure Environment

### Backend (.env)
Create `backend/.env` file:
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/marketplace

JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d

STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env.local)
Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Step 3: Start Development Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend runs at: http://localhost:5000

### Terminal 2 - Frontend
```bash
npm run dev
```
Frontend runs at: http://localhost:3000

## Step 4: Test the App

### Create Test Account
1. Go to http://localhost:3000
2. Click "Register"
3. Create account as **Customer**

### Test Checkout Flow
1. Go to Marketplace
2. Search for products (it searches the demo data)
3. Add item to cart
4. Click "Proceed to Checkout"
5. Use Stripe test card: **4242 4242 4242 4242**

### Create Vendor Account
1. Register new account as **Vendor**
2. Create a store
3. Add some products
4. View your vendor dashboard

### Test Admin
1. Register with email containing "admin"
2. Access http://localhost:3000/admin
3. View platform analytics

## Step 5: Check Key Files

- **Frontend API client:** `/app/lib/api.ts`
- **Backend routes:** `/backend/routes/`
- **Database models:** `/backend/models/`
- **State management:** `/app/lib/stores/`
- **React Query hooks:** `/app/lib/hooks/`

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error
- Verify MONGODB_URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database exists

### Stripe Error
- Use test keys (pk_test_, sk_test_)
- Use test card: 4242 4242 4242 4242
- Any future date for expiry

### Socket.IO Not Connecting
- Ensure backend is running on 5000
- Check browser console for errors
- Clear browser cache

## Next Steps

1. **Setup Monitoring:** See `PROJECT_GUIDE.md`
2. **Deploy:** Use Vercel (frontend) and Render (backend)
3. **Production Keys:** Get from Stripe, Cloudinary, MongoDB Atlas
4. **Email Setup:** Configure SendGrid or Mailgun
5. **Analytics:** Add PostHog or similar

## Helpful Commands

```bash
# Reset database
# (Delete all collections in MongoDB Atlas)

# View backend logs
# Check terminal running npm run dev

# View frontend logs
# Check browser console (F12)

# Test API endpoints
curl -X GET http://localhost:5000/api/health

# View running processes
lsof -i :3000
lsof -i :5000
```

## File Locations

| Feature | Location |
|---------|----------|
| Landing Page | `/app/page.tsx` |
| Marketplace | `/app/(customer)/marketplace/page.tsx` |
| Cart | `/app/(customer)/cart/page.tsx` |
| Checkout | `/app/(customer)/checkout/page.tsx` |
| Vendor Dashboard | `/app/(dashboard)/dashboard/page.tsx` |
| Admin Dashboard | `/app/(admin)/admin/page.tsx` |
| API Client | `/app/lib/api.ts` |
| Auth Hooks | `/app/lib/hooks/useAuth.ts` |
| Zustand Stores | `/app/lib/stores/` |
| Backend Server | `/backend/server.js` |
| Auth Routes | `/backend/routes/auth.js` |
| Product Routes | `/backend/routes/products.js` |

## Testing Checklist

- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can browse marketplace
- [ ] Can search products
- [ ] Can add items to cart
- [ ] Cart persists after refresh
- [ ] Stripe checkout works
- [ ] Order created after payment
- [ ] Can view orders
- [ ] Vendor dashboard loads
- [ ] Can add new products
- [ ] Real-time notifications work
- [ ] Admin dashboard accessible
- [ ] Vendor approval works

## Database Setup

The app will automatically create tables on first run. If needed:

```javascript
// In MongoDB Atlas, create these indexes:
db.products.createIndex({ name: 'text', description: 'text' })
db.products.createIndex({ tenantId: 1, status: 1 })
db.orders.createIndex({ userId: 1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

## Performance Tips

1. **API Caching:** React Query caches results automatically
2. **Cart Persistence:** Uses localStorage + backend sync
3. **Image Optimization:** Use Next.js Image component
4. **Search Index:** Full-text search on Product name/description
5. **Socket.IO:** Lazy loads, only connects when needed

## Common Curl Commands

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}'

# Get products
curl "http://localhost:5000/api/products/marketplace?limit=10"

# Search products
curl "http://localhost:5000/api/search?q=laptop&category=electronics"
```

## Need Help?

1. Check `PROJECT_GUIDE.md` for detailed documentation
2. Look at component comments for implementation details
3. Review controller comments for business logic
4. Check middleware for authentication/validation
5. Use browser DevTools to debug frontend
6. Use terminal logs to debug backend

---

**You're all set! Happy building! 🚀**
