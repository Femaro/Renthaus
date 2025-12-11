'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TrendingUp, DollarSign } from 'lucide-react'

export default function TransactionsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    totalTransactions: 0,
  })

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))
      setOrders(loaded)

      setStats({
        totalRevenue: loaded.reduce((sum, o) => sum + o.totalAmount, 0),
        totalCommission: loaded.reduce((sum, o) => sum + o.commission, 0),
        totalTransactions: loaded.length,
      })
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-white">Loading transactions...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Financial Control</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card variant="glass-red" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 font-medium">Total Revenue</h3>
            <TrendingUp className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
        </Card>
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 font-medium">Total Commission</h3>
            <DollarSign className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalCommission)}</p>
        </Card>
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-300 font-medium">Total Transactions</h3>
            <DollarSign className="text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalTransactions}</p>
        </Card>
      </div>

      <Card variant="glass" className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">All Transactions</h2>
        {orders.length === 0 ? (
          <p className="text-gray-300 text-center py-8">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-300 font-semibold">Order ID</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Product</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Date</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Amount</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Commission</th>
                  <th className="text-left p-4 text-gray-300 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5">
                    <td className="p-4 text-white text-sm">{order.id.slice(0, 8)}...</td>
                    <td className="p-4 text-white">{order.productTitle}</td>
                    <td className="p-4 text-gray-400 text-sm">{formatDate(order.createdAt.toDate())}</td>
                    <td className="p-4 text-white font-semibold">{formatCurrency(order.totalAmount)}</td>
                    <td className="p-4 text-primary font-semibold">{formatCurrency(order.commission)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

