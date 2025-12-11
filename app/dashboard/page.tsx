'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Package, Calendar, TrendingUp, MessageSquare } from 'lucide-react'

export default function DashboardPage() {
  const { userData } = useAuth()
  const router = useRouter()

  if (!userData) return null

  if (userData.role === 'customer') {
    return (
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Welcome back, {userData.displayName}!</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="glass" hover>
            <Link href="/search">
              <Package className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Browse Items</h3>
              <p className="text-gray-300">Find event equipment for your next event</p>
            </Link>
          </Card>
          <Card variant="glass" hover>
            <Link href="/dashboard/bookings">
              <Calendar className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">My Bookings</h3>
              <p className="text-gray-300">View and manage your rentals</p>
            </Link>
          </Card>
          <Card variant="glass" hover>
            <Link href="/dashboard/rfq">
              <MessageSquare className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Request Quote</h3>
              <p className="text-gray-300">Get quotes for bulk rentals</p>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  if (userData.role === 'vendor') {
    return (
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Vendor Dashboard</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="glass" hover>
            <Link href="/dashboard/listings">
              <Package className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">My Listings</h3>
              <p className="text-gray-300">Manage your product listings</p>
            </Link>
          </Card>
          <Card variant="glass" hover>
            <Link href="/dashboard/inventory">
              <Calendar className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Inventory</h3>
              <p className="text-gray-300">Manage availability calendar</p>
            </Link>
          </Card>
          <Card variant="glass" hover>
            <Link href="/dashboard/orders">
              <TrendingUp className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Orders</h3>
              <p className="text-gray-300">View and manage orders</p>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  if (userData.role === 'admin') {
    return (
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="glass" hover>
            <Link href="/dashboard/vendors">
              <Package className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Vendor Management</h3>
              <p className="text-gray-300">Approve and manage vendors</p>
            </Link>
          </Card>
          <Card variant="glass" hover>
            <Link href="/dashboard/transactions">
              <TrendingUp className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Transactions</h3>
              <p className="text-gray-300">View all financial transactions</p>
            </Link>
          </Card>
          <Card variant="glass" hover>
            <Link href="/dashboard/deposits">
              <MessageSquare className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Security Deposits</h3>
              <p className="text-gray-300">Manage deposit claims</p>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return null
}

