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
    return <div className="text-white">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Payouts & Earnings</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card variant="glass-red" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 font-medium">Total Earnings</h3>
            <TrendingUp className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalEarnings)}</p>
        </Card>
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 font-medium">Pending Payouts</h3>
            <DollarSign className="text-yellow-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(stats.pendingPayouts)}</p>
        </Card>
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 font-medium">Completed Payouts</h3>
            <DollarSign className="text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(stats.completedPayouts)}</p>
        </Card>
      </div>

      <Card variant="glass" className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
        {orders.length === 0 ? (
          <p className="text-gray-300 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const vendorEarnings = order.totalAmount - order.commission
              return (
                <div
                  key={order.id}
                  className="flex justify-between items-center p-4 rounded-xl glass border border-white/10"
                >
                  <div>
                    <p className="text-white font-semibold">{order.productTitle}</p>
                    <div className="flex items-center gap-4 text-gray-400 text-sm mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(order.createdAt.toDate())}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{formatCurrency(vendorEarnings)}</p>
                    <p className="text-gray-400 text-xs">
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

