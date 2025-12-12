'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SkeletonList } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Package, Calendar, MapPin, Check, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { exportToCSV, formatOrdersForExport } from '@/lib/export-utils'

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
      
      // Trigger email notification
      const orderDoc = await getDoc(doc(db, 'orders', orderId))
      const orderData = orderDoc.data()
      
      if (orderData) {
        fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'order_status_update',
            orderId,
            customerEmail: orderData.customerEmail || '',
          }),
        }).catch(console.error)
      }
      
      toast.success('Order status updated')
      loadOrders()
    } catch (error) {
      toast.error('Failed to update order status')
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

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 md:mb-8">Rental Orders</h1>
        <SkeletonList count={5} />
      </div>
    )
  }

  const handleExport = () => {
    try {
      if (orders.length === 0) {
        toast.error('No orders to export')
        return
      }
      
      const exportData = formatOrdersForExport(orders)
      exportToCSV(exportData, `orders-export-${new Date().toISOString().split('T')[0]}`)
      toast.success('Orders exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export orders')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Rental Orders</h1>
        {orders.length > 0 && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2" size={18} />
            Export Orders
          </Button>
        )}
      </div>
      {orders.length === 0 ? (
        <Card variant="default" className="text-center py-12">
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 text-xl">No orders yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} variant="default" className="p-6">
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
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-gray-500 text-sm">Rental Fee</p>
                  <p className="text-gray-900 font-semibold">{formatCurrency(order.rentalFee)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Security Deposit</p>
                  <p className="text-gray-900 font-semibold">{formatCurrency(order.securityDeposit)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Amount</p>
                  <p className="text-2xl font-semibold text-primary">{formatCurrency(order.totalAmount)}</p>
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

