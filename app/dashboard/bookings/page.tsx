'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, Package, MapPin } from 'lucide-react'

export default function BookingsPage() {
  const { userData } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userData) {
      loadBookings()
    }
  }, [userData])

  const loadBookings = async () => {
    if (!userData) return
    try {
      const userId = userData.uid
      const q = query(
        collection(db, 'orders'),
        where('customerId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order)))
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400'
      case 'in-progress':
        return 'text-blue-400'
      case 'completed':
        return 'text-gray-400'
      case 'cancelled':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  if (loading) {
    return <div className="text-white">Loading bookings...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">My Bookings</h1>
      {orders.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <Package className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-300 text-xl">No bookings yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} variant="glass" hover className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{order.productTitle}</h3>
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{formatDate(order.startDate.toDate())} - {formatDate(order.endDate.toDate())}</span>
                    </div>
                    {order.deliveryAddress && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </p>
                  <p className="text-gray-400 text-sm">{order.paymentStatus}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div>
                  <p className="text-gray-400 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Security Deposit</p>
                  <p className="text-white font-semibold">{formatCurrency(order.securityDeposit)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

