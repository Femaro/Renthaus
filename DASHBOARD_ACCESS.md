# Dashboard Access Guide

## Quick Links

### Public Pages
- **Homepage**: http://localhost:3000/
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Search**: http://localhost:3000/search

### Dashboard Links
- **Customer Dashboard**: http://localhost:3000/dashboard
- **Vendor Dashboard**: http://localhost:3000/dashboard
- **Admin Dashboard**: http://localhost:3000/dashboard

*Note: The dashboard URL is the same for all roles. The content changes based on the logged-in user's role.*

## Creating Test Accounts

### 1. Customer Account
1. Go to: http://localhost:3000/register
2. Select "Rent Items" (Customer role)
3. Fill in:
   - Full Name: Test Customer
   - Email: customer@test.com
   - Password: test123456
4. Click "Create Account"
5. You'll be redirected to the Customer Dashboard

**Customer Dashboard Features:**
- Browse Items
- My Bookings
- Request Quote (RFQ)
- Messages
- Profile

### 2. Vendor Account
1. Go to: http://localhost:3000/register?role=vendor
2. Select "List Items" (Vendor role)
3. Fill in:
   - Full Name: Test Vendor
   - Email: vendor@test.com
   - Password: test123456
4. Click "Create Account"
5. You'll be redirected to the Vendor Dashboard

**Vendor Dashboard Features:**
- My Listings (create products)
- Inventory Management
- Orders
- Messages
- Payouts
- Profile

**To complete vendor setup:**
- Go to Profile page and add:
  - Business Name
  - Business Address
  - Registration Number (optional)
  - Payout Account details

### 3. Admin Account

**Option A: Create via Registration then Update in Firestore**
1. Register as a customer or vendor first
2. Go to Firebase Console → Firestore Database
3. Find the user document in the `users` collection
4. Update the `role` field to `"admin"`

**Option B: Direct Firestore Creation**
1. Go to Firebase Console → Firestore Database
2. Create a new document in the `users` collection
3. Set the following fields:
   ```json
   {
     "email": "admin@test.com",
     "displayName": "Admin User",
     "role": "admin",
     "createdAt": [Firestore Timestamp],
     "updatedAt": [Firestore Timestamp]
   }
   ```
4. Create the user in Firebase Authentication with the same email
5. Login with: admin@test.com / your-password

**Admin Dashboard Features:**
- Vendor Management
- Transactions
- Security Deposits
- Profile

## Test Account Credentials

### Customer
- **Email**: customer@test.com
- **Password**: test123456
- **Dashboard**: http://localhost:3000/dashboard

### Vendor
- **Email**: vendor@test.com
- **Password**: test123456
- **Dashboard**: http://localhost:3000/dashboard

### Admin
- **Email**: admin@test.com
- **Password**: (set in Firebase Auth)
- **Dashboard**: http://localhost:3000/dashboard

## Dashboard Navigation

### Customer Dashboard Pages
- `/dashboard` - Main dashboard with stats
- `/dashboard/bookings` - View all bookings
- `/dashboard/rfq` - Request for Quote
- `/dashboard/messages` - Customer-vendor messaging
- `/dashboard/profile` - Profile settings

### Vendor Dashboard Pages
- `/dashboard` - Main dashboard with revenue stats
- `/dashboard/listings` - Manage product listings
- `/dashboard/inventory` - Availability calendar
- `/dashboard/orders` - View and manage orders
- `/dashboard/messages` - Customer-vendor messaging
- `/dashboard/payouts` - Earnings and payouts
- `/dashboard/profile` - Profile and business settings

### Admin Dashboard Pages
- `/dashboard` - Main dashboard with platform stats
- `/dashboard/vendors` - Approve/manage vendors
- `/dashboard/transactions` - All financial transactions
- `/dashboard/deposits` - Security deposit management
- `/dashboard/profile` - Profile settings

## Quick Testing Workflow

1. **Create a Vendor Account**
   - Register at `/register?role=vendor`
   - Complete business info in Profile
   - Create a product listing in `/dashboard/listings`
   - Upload product images

2. **Create a Customer Account**
   - Register at `/register?role=customer`
   - Browse products at `/search`
   - View product details
   - Book a rental

3. **Test Admin Functions**
   - Approve the vendor in `/dashboard/vendors`
   - View transactions in `/dashboard/transactions`
   - Monitor deposits in `/dashboard/deposits`

## Notes

- All dashboards use role-based access control
- Users are automatically redirected to `/login` if not authenticated
- Admin role must be set manually in Firestore (not available in registration form)
- Vendor accounts need approval from admin before they can fully operate
- Profile pictures and product images are stored in Firebase Storage

