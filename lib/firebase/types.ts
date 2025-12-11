import { Timestamp, GeoPoint } from 'firebase/firestore'

export type UserRole = 'customer' | 'vendor' | 'admin'

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: UserRole
  phoneNumber?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Vendor extends User {
  role: 'vendor'
  businessName: string
  businessAddress: string
  registrationNumber?: string
  registrationStatus: 'pending' | 'approved' | 'rejected'
  verified: boolean
  location: GeoPoint
  rating?: number
  totalReviews?: number
  payoutAccount?: {
    bankName: string
    accountNumber: string
    accountName: string
  }
}

export interface Product {
  id: string
  vendorId: string
  vendorName: string
  title: string
  description: string
  category: string
  subcategory?: string
  images: string[]
  dailyPrice: number
  weeklyPrice?: number
  securityDeposit: number
  location: GeoPoint
  city: string
  state: string
  customFilters: Record<string, string | number>
  addOnServices?: AddOnService[]
  itemCoverage: number // Default 2000
  available: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface AddOnService {
  id: string
  name: string
  description?: string
  price: number
  mandatory: boolean
}

export interface InventoryItem {
  productId: string
  date: string // YYYY-MM-DD
  available: boolean
  quantity?: number
}

export interface Order {
  id: string
  customerId: string
  vendorId: string
  productId: string
  productTitle: string
  startDate: Timestamp
  endDate: Timestamp
  rentalFee: number
  securityDeposit: number
  addOnServices?: {
    serviceId: string
    name: string
    price: number
  }[]
  totalAmount: number
  commission: number // Platform commission
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  deliveryAddress?: string
  deliveryInstructions?: string
  damageClaim?: {
    description: string
    amount: number
    images: string[]
    status: 'pending' | 'approved' | 'rejected'
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface RFQ {
  id: string
  customerId: string
  customerName: string
  eventDate: Timestamp
  eventType: string
  location: GeoPoint
  city: string
  state: string
  items: {
    category: string
    quantity: number
    description?: string
  }[]
  budget?: number
  status: 'open' | 'quoted' | 'accepted' | 'closed'
  quotes?: {
    vendorId: string
    vendorName: string
    items: {
      productId: string
      price: number
    }[]
    totalPrice: number
    message?: string
    createdAt: Timestamp
  }[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  receiverId: string
  content: string
  read: boolean
  createdAt: Timestamp
}

export interface Conversation {
  id: string
  participantIds: string[]
  participantNames: Record<string, string>
  lastMessage?: {
    content: string
    senderId: string
    createdAt: Timestamp
  }
  orderId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

