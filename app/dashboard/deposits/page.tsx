'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Shield, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DepositsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [claimAmount, setClaimAmount] = useState('')

  useEffect(() => {
    loadOrdersWithClaims()
  }, [])

  const loadOrdersWithClaims = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('damageClaim.status', '==', 'pending')
      )
      const snapshot = await getDocs(q)
      const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))
      setOrders(loaded)
    } catch (error) {
      // If no orders with claims, get all completed orders
      const allOrders = await getDocs(collection(db, 'orders'))
      setOrders(allOrders.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order)))
    } finally {
      setLoading(false)
    }
  }

  const handleClaimReview = async (orderId: string, approved: boolean) => {
    if (!selectedOrder) return

    try {
      const claim = selectedOrder.damageClaim
      if (!claim) return

      const updates: any = {
        'damageClaim.status': approved ? 'approved' : 'rejected',
        updatedAt: new Date(),
      }

      if (approved) {
        // Deduct from security deposit
        const refundAmount = selectedOrder.securityDeposit - claim.amount
        updates.paymentStatus = 'refunded'
        // In production, process refund via Paystack API
      } else {
        // Release full deposit
        updates.paymentStatus = 'refunded'
        // In production, process full refund via Paystack API
      }

      await updateDoc(doc(db, 'orders', orderId), updates)
      toast.success(`Claim ${approved ? 'approved' : 'rejected'}`)
      setSelectedOrder(null)
      loadOrdersWithClaims()
    } catch (error) {
      toast.error('Failed to process claim')
    }
  }

  if (loading) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Security Deposit Management</h1>

      {orders.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <Shield className="mx-auto mb-4 text-gray-600" size={48} />
          <p className="text-gray-300 text-xl">No deposit claims to review</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} variant="glass" className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{order.productTitle}</h3>
                  <div className="flex items-center gap-4 text-gray-300 text-sm">
                    <span>Order ID: {order.id.slice(0, 8)}...</span>
                    <span>Date: {formatDate(order.createdAt.toDate())}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Security Deposit</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(order.securityDeposit)}</p>
                </div>
              </div>

              {order.damageClaim && (
                <div className="mt-4 p-4 rounded-xl glass border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">Damage Claim</h4>
                      <p className="text-gray-300">{order.damageClaim.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.damageClaim.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      order.damageClaim.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.damageClaim.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Claim Amount</span>
                    <span className="text-xl font-bold text-red-400">
                      {formatCurrency(order.damageClaim.amount)}
                    </span>
                  </div>
                  {order.damageClaim.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order)
                          setClaimAmount(order.damageClaim!.amount.toString())
                        }}
                      >
                        Review Claim
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {!order.damageClaim && order.status === 'completed' && (
                <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-green-400 text-sm">No damage claims. Deposit can be released.</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card variant="glass" className="max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Review Damage Claim</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Description</p>
                <p className="text-white">{selectedOrder.damageClaim?.description}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Claim Amount</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(selectedOrder.damageClaim?.amount || 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Security Deposit</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(selectedOrder.securityDeposit)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Refund Amount (if approved)</p>
                <p className="text-xl font-bold text-green-400">
                  {formatCurrency(selectedOrder.securityDeposit - (selectedOrder.damageClaim?.amount || 0))}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => handleClaimReview(selectedOrder.id, true)}
              >
                <Check className="mr-2" size={16} />
                Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleClaimReview(selectedOrder.id, false)}
              >
                <X className="mr-2" size={16} />
                Reject
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={() => setSelectedOrder(null)}
            >
              Cancel
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}

