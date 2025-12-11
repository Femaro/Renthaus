'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Package, Calendar, MapPin, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrdersPage() {
  const { userData } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order)))
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date(),
      })
      toast.success('Order status updated')
      loadOrders()
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-500/20'
      case 'in-progress':
        return 'text-blue-400 bg-blue-500/20'
      case 'completed':
        return 'text-gray-400 bg-gray-500/20'
      case 'cancelled':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-yellow-400 bg-yellow-500/20'
    }
  }

  if (loading) {
    return <div className="text-white">Loading orders...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Orders</h1>
      {orders.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <Package className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-300 text-xl">No orders yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} variant="glass" className="p-6">
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
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-gray-400 text-sm">Rental Fee</p>
                  <p className="text-white font-semibold">{formatCurrency(order.rentalFee)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Security Deposit</p>
                  <p className="text-white font-semibold">{formatCurrency(order.securityDeposit)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
              {order.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                  >
                    <Check className="mr-2" size={16} />
                    Confirm Order
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {order.status === 'confirmed' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'in-progress')}
                >
                  Mark as In Progress
                </Button>
              )}
              {order.status === 'in-progress' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                >
                  Mark as Completed
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

