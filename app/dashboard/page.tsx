'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Package, Calendar, TrendingUp, MessageSquare, DollarSign, Users, ShoppingCart, Eye } from 'lucide-react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order, Product } from '@/lib/firebase/types'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPage() {
  const { userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    activeBookings: 0,
    totalListings: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalVendors: 0,
    totalTransactions: 0,
    totalCommission: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!userData) {
        router.push('/login')
        return
      }
      loadStats()
    }
  }, [userData, authLoading, router])

  const loadStats = async () => {
    if (!userData || !db) {
      setLoading(false)
      return
    }

    try {
      if (userData.role === 'customer') {
        const ordersQuery = query(collection(db, 'orders'), where('customerId', '==', userData.uid))
        const ordersSnapshot = await getDocs(ordersQuery)
        const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))
        
        setStats({
          totalBookings: orders.length,
          totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
          activeBookings: orders.filter((o) => ['pending', 'confirmed', 'in-progress'].includes(o.status)).length,
          totalListings: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          totalVendors: 0,
          totalTransactions: 0,
          totalCommission: 0,
        })
      } else if (userData.role === 'vendor') {
        const [ordersSnapshot, productsSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'orders'), where('vendorId', '==', userData.uid))),
          getDocs(query(collection(db, 'products'), where('vendorId', '==', userData.uid))),
        ])
        
        const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))
        const products = productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product & { id: string }))
        
        setStats({
          totalBookings: 0,
          totalSpent: 0,
          activeBookings: 0,
          totalListings: products.length,
          totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount - o.commission), 0),
          pendingOrders: orders.filter((o) => o.status === 'pending').length,
          totalVendors: 0,
          totalTransactions: 0,
          totalCommission: 0,
        })
      } else if (userData.role === 'admin') {
        const [ordersSnapshot, vendorsSnapshot] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(query(collection(db, 'users'), where('role', '==', 'vendor'))),
        ])
        
        const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))
        const vendors = vendorsSnapshot.docs.length
        
        setStats({
          totalBookings: 0,
          totalSpent: 0,
          activeBookings: 0,
          totalListings: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          totalVendors: vendors,
          totalTransactions: orders.length,
          totalCommission: orders.reduce((sum, o) => sum + o.commission, 0),
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userData) return null

  if (userData.role === 'customer') {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">Welcome back, {userData.displayName}!</h1>
        <p className="text-gray-600 mb-6 md:mb-8">Here's an overview of your activity</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Bookings</h3>
              <Calendar className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{stats.totalBookings}</p>
          </Card>
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Spent</h3>
              <DollarSign className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
          </Card>
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Active Bookings</h3>
              <Package className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{stats.activeBookings}</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" hover className="p-6">
            <Link href="/search" className="block">
              <Package className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse Equipment</h3>
              <p className="text-gray-600">Find event equipment for your next event</p>
            </Link>
          </Card>
          <Card variant="default" hover className="p-6">
            <Link href="/dashboard/bookings" className="block">
              <Calendar className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">My Bookings</h3>
              <p className="text-gray-600">View and manage your rentals</p>
            </Link>
          </Card>
          <Card variant="default" hover className="p-6">
            <Link href="/dashboard/rfq" className="block">
              <MessageSquare className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Quote</h3>
              <p className="text-gray-600">Get quotes for bulk rentals</p>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  if (userData.role === 'vendor') {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">Equipment Owner Dashboard</h1>
        <p className="text-gray-600 mb-6 md:mb-8">Manage your equipment listings and orders</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Listings</h3>
              <Package className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{stats.totalListings}</p>
          </Card>
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Revenue</h3>
              <TrendingUp className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          </Card>
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Pending Orders</h3>
              <ShoppingCart className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{stats.pendingOrders}</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" hover className="p-6">
            <Link href="/dashboard/listings" className="block">
              <Package className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">My Equipment</h3>
              <p className="text-gray-600">Manage your event equipment listings</p>
            </Link>
          </Card>
          <Card variant="default" hover className="p-6">
            <Link href="/dashboard/inventory" className="block">
              <Calendar className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inventory</h3>
              <p className="text-gray-600">Manage availability calendar</p>
            </Link>
          </Card>
          <Card variant="default" hover className="p-6">
            <Link href="/dashboard/orders" className="block">
              <ShoppingCart className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Orders</h3>
              <p className="text-gray-600">View and manage orders</p>
            </Link>
          </Card>
          <Card variant="default" hover className="p-6">
            <Link href="/dashboard/payouts" className="block">
              <DollarSign className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payouts</h3>
              <p className="text-gray-600">View earnings and payouts</p>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  if (userData.role === 'admin') {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-6 md:mb-8">Manage the marketplace</p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Equipment Owners</h3>
              <Users className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{stats.totalVendors}</p>
          </Card>
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Transactions</h3>
              <TrendingUp className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{stats.totalTransactions}</p>
          </Card>
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">Total Commission</h3>
              <DollarSign className="text-primary" size={24} />
            </div>
            <p className="text-3xl font-semibold text-gray-900">{formatCurrency(stats.totalCommission)}</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" hover className="p-6">
            <Link href="/dashboard/vendors" className="block">
              <Users className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Equipment Owners</h3>
              <p className="text-gray-600">Approve and manage equipment owners</p>
            </Link>
          </Card>
          <Card variant="default" hover className="p-6">
            <Link href="/dashboard/transactions" className="block">
              <TrendingUp className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Transactions</h3>
              <p className="text-gray-600">View all financial transactions</p>
            </Link>
          </Card>
          <Card variant="default" hover className="p-6">
            <Link href="/dashboard/deposits" className="block">
              <Package className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Deposits</h3>
              <p className="text-gray-600">Manage deposit claims</p>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-600 text-lg">Unable to load dashboard. Please try logging in again.</p>
      <Button onClick={() => router.push('/login')} className="mt-4">
        Go to Login
      </Button>
    </div>
  )
}
