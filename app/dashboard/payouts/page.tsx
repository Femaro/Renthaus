'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { TrendingUp, DollarSign, Calendar } from 'lucide-react'

export default function PayoutsPage() {
  const { userData } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
  })

  useEffect(() => {
    loadOrders()
  }, [userData])

  const loadOrders = async () => {
    if (!userData) return
    try {
      const q = query(
        collection(db, 'orders'),
        where('vendorId', '==', userData.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))
      setOrders(loaded)

      // Calculate stats
      const completed = loaded.filter((o) => o.status === 'completed' && o.paymentStatus === 'paid')
      const pending = loaded.filter((o) => o.status === 'completed' && o.paymentStatus === 'pending')
      
      setStats({
        totalEarnings: completed.reduce((sum, o) => sum + (o.totalAmount - o.commission), 0),
        pendingPayouts: pending.reduce((sum, o) => sum + (o.totalAmount - o.commission), 0),
        completedPayouts: completed.reduce((sum, o) => sum + (o.totalAmount - o.commission), 0),
      })
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-gray-700">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold text-gray-900 mb-8">Payouts & Earnings</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Total Earnings</h3>
            <TrendingUp className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
        </Card>
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Pending Payouts</h3>
            <DollarSign className="text-yellow-600" size={24} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{formatCurrency(stats.pendingPayouts)}</p>
        </Card>
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Completed Payouts</h3>
            <DollarSign className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{formatCurrency(stats.completedPayouts)}</p>
        </Card>
      </div>

      <Card variant="default" className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Transaction History</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const vendorEarnings = order.totalAmount - order.commission
              return (
                <div
                  key={order.id}
                  className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <div>
                    <p className="text-gray-900 font-semibold">{order.productTitle}</p>
                    <div className="flex items-center gap-4 text-gray-500 text-sm mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(order.createdAt.toDate())}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs border ${
                        order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary">{formatCurrency(vendorEarnings)}</p>
                    <p className="text-gray-500 text-xs">
                      Commission: {formatCurrency(order.commission)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

