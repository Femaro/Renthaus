'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, Package, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

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
        return 'bg-green-50 text-green-700 border-green-200'
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-green-600" />
      case 'in-progress':
        return <Clock size={16} className="text-blue-600" />
      case 'completed':
        return <CheckCircle size={16} className="text-gray-600" />
      case 'cancelled':
        return <XCircle size={16} className="text-red-600" />
      default:
        return <AlertCircle size={16} className="text-yellow-600" />
    }
  }

  if (loading) {
    return <div className="text-gray-700">Loading bookings...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold text-gray-900 mb-8">My Rentals</h1>
      {orders.length === 0 ? (
        <Card variant="default" className="text-center py-12">
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 text-xl">No bookings yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} variant="default" hover className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">{order.productTitle}</h3>
                  <div className="flex items-center gap-4 text-gray-600">
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
                  <div className="flex items-center gap-2 justify-end mb-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm capitalize">{order.paymentStatus}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div>
                  <p className="text-gray-500 text-sm">Total Amount</p>
                  <p className="text-2xl font-semibold text-primary">{formatCurrency(order.totalAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Security Deposit</p>
                  <p className="text-gray-900 font-semibold">{formatCurrency(order.securityDeposit)}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                {order.paymentStatus === 'pending' && (
                  <Link href={`/payment?orderId=${order.id}`} className="flex-1">
                    <Button className="w-full" size="sm">
                      Complete Payment
                    </Button>
                  </Link>
                )}
                <Link href={`/dashboard/messages?conversationId=${order.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    Message Owner
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

