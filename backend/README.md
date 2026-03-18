# Multi-Tenant Vendor Marketplace Backend API

## Overview
This is the backend API for a production-ready, multi-tenant vendor marketplace. It provides comprehensive endpoints for user authentication, product management, orders, and payments.

## Architecture
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary for image uploads
- **Payments:** Stripe integration
- **Real-time:** Socket.io (upcoming)
- **Logging:** Winston logger

## Project Structure
```
backend/
├── config/              # Configuration files
│   ├── database.js     # MongoDB connection and indexes
│   ├── env.js          # Environment variable validation
│   ├── stripe.js       # Stripe configuration
│   └── cloudinary.js   # Cloudinary configuration
├── models/             # MongoDB schemas
│   ├── User.js
│   ├── Tenant.js
│   ├── Product.js
│   ├── Order.js
│   ├── Cart.js
│   └── Payment.js
├── controllers/        # Business logic
│   └── authController.js
├── services/          # Service layer (to be created)
├── routes/            # API routes
│   └── auth.js
├── middleware/        # Custom middleware
│   ├── auth.js        # JWT authentication
│   ├── tenant.js      # Multi-tenant enforcement
│   ├── validation.js  # Request validation
│   └── rateLimit.js   # Rate limiting
├── utils/             # Utility functions
│   ├── logger.js      # Winston logger setup
│   └── jwt.js         # JWT utilities
├── schemas/           # Zod validation schemas
│   └── authSchemas.js
├── server.js          # Main Express app
├── package.json
└── .env.example       # Environment variables template
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string (MongoDB Atlas recommended)
- `JWT_SECRET` - Secret key for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### 3. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}

Response:
{
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": { ... }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": { ... }
}
```

#### Get Profile
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "user": { ... }
}
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "profileImage": "https://..."
}

Response:
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### Create Vendor Store
```
POST /api/auth/vendor-store
Authorization: Bearer <token>
Content-Type: application/json

{
  "storeName": "My Store",
  "storeSlug": "my-store",
  "description": "My awesome store",
  "category": "electronics",
  "email": "store@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State"
}

Response:
{
  "message": "Vendor store created successfully",
  "token": "new_jwt_token",
  "tenant": { ... },
  "user": { ... }
}
```

## Security Features

### 1. Multi-Tenant Enforcement
- `tenantMiddleware` automatically isolates data by tenant
- Vendors can only access their own store data
- Admins can access all data
- Prevents accidental data leaks

### 2. Authentication
- JWT tokens with expiration
- Password hashing with bcrypt
- Token-based authorization

### 3. Rate Limiting
- Auth endpoints: 5 requests per 15 minutes per IP
- Payment endpoints: 10 requests per 1 hour per IP
- Search endpoints: 30 requests per 1 minute per IP
- General API: 100 requests per 15 minutes per IP

### 4. Request Validation
- Zod schema validation for all inputs
- Automatic validation error responses
- Type-safe data handling

### 5. Security Headers
- Helmet.js for HTTP security headers
- CORS configuration
- HTTPS recommended in production

## Database Indexes
- Products: Full-text search index on name, description, tags
- Orders: Indexed by userId, tenantId, and status
- Cart: Indexed by userId
- All models: Created and updated timestamps

## Next Steps
1. Implement service layer for data operations
2. Create product management endpoints
3. Implement order and cart management
4. Integrate Stripe payment processing
5. Setup Socket.io for real-time notifications
6. Build vendor and admin dashboards
7. Deploy to production server

## Deployment
The backend can be deployed to:
- Render.com
- Railway
- Heroku
- AWS EC2
- DigitalOcean
- Any Node.js compatible hosting

Environment variables must be configured in the deployment platform.

## Contributing
Follow the established patterns:
- Use services layer for database operations
- Validate all inputs with Zod
- Log important events
- Handle errors gracefully
- Always enforce multi-tenant isolation

## License
MIT
