# RentHaus - Event Rental Marketplace MVP

A niche-specific, multi-vendor online marketplace for event equipment rentals in Nigeria.

## Tech Stack

- **Frontend & Hosting**: Next.js 14 on Vercel
- **Database**: Google Firestore (NoSQL)
- **Backend/APIs**: Next.js API Routes (Serverless Functions)
- **Authentication**: Firebase Authentication
- **Payment Integration**: Paystack (Split Payments/Escrow)

## Features

### Customer Features
- Advanced Booking Calendar with real-time availability
- Request-for-Quote (RFQ) for bulk requests
- Secure Checkout with Security Deposit
- Product Comparison (up to 4 items)
- In-app messaging with vendors

### Vendor Features
- Listing Management with custom filters
- Inventory Grid for availability management
- Add-on Services configuration
- Payout & Reporting dashboard
- Order management

### Admin Features
- Financial Control & Commission Management
- Security Deposit Protocol
- Vendor Verification Workflow
- Transaction monitoring

## Design

- **Color Scheme**: Red (#DC2626) and Black (#000000)
- **UI Style**: Modern glassmorphic design inspired by iOS 26
- **UX**: Trust-focused, community-oriented interface similar to Yoodlize

## Getting Started

### For New Setup (First Time)

**📖 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed step-by-step instructions** on setting up the app on a new computer, including:
- Installing prerequisites (Git, Node.js, npm)
- Cloning the repository
- Setting up environment variables
- Running the application
- Troubleshooting common issues

### Quick Start (If Already Set Up)

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory with your Firebase and Paystack credentials (see Environment Variables section below).

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Dashboard Access & Login Information

For detailed login information, test accounts, and dashboard links, see **[DASHBOARD_ACCESS.md](./DASHBOARD_ACCESS.md)**

### Quick Dashboard Links
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Customer Dashboard**: http://localhost:3000/dashboard (after login as customer)
- **Vendor Dashboard**: http://localhost:3000/dashboard (after login as vendor)
- **Admin Dashboard**: http://localhost:3000/dashboard (after login as admin)

### Quick Test Accounts Setup
1. **Customer**: Register at `/register` → Select "Rent Items"
2. **Vendor**: Register at `/register?role=vendor` → Select "List Items"
3. **Admin**: Register as customer/vendor, then update `role` to `"admin"` in Firestore

## Environment Variables

Required environment variables (see `.env.example`):

### Firebase
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID` (for admin)
- `FIREBASE_CLIENT_EMAIL` (for admin)
- `FIREBASE_PRIVATE_KEY` (for admin)

### Paystack
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_SECRET_KEY`

### App
- `NEXT_PUBLIC_APP_URL`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/                # API routes (serverless functions)
│   ├── dashboard/          # Dashboard pages (customer/vendor/admin)
│   ├── products/           # Product pages
│   ├── search/             # Search page
│   ├── checkout/           # Checkout flow
│   └── payment/            # Payment pages
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── home/               # Homepage components
│   └── layout/             # Layout components
├── lib/                    # Utilities and configurations
│   ├── firebase/           # Firebase setup and types
│   └── utils/              # Helper functions
└── contexts/               # React contexts (Auth, etc.)
```

## Key Features Implementation

### Real-time Availability
- Inventory collection tracks item availability by date
- Atomic updates via API routes prevent double-booking
- Calendar-based inventory management for vendors

### Security Deposits
- Escrow system via Paystack
- Admin dashboard for damage claim review
- Automatic refund processing

### Messaging System
- Real-time messaging via Firestore
- Conversation-based chat interface
- Integrated with order flow

### Payment Processing
- Paystack integration for Nigerian market
- Split payment support (rental fee + security deposit)
- Escrow for security deposits

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Notes

- For production, implement proper GeoPoint queries for location-based search
- Consider integrating Algolia or ElasticSearch for full-text search
- Add image upload functionality for product listings
- Implement proper error handling and loading states
- Add comprehensive testing

