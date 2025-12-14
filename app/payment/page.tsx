'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, CreditCard, ArrowLeft, Home, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { userData } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const orderId = searchParams?.get('orderId')
    if (orderId) {
      loadOrder(orderId)
    }
  }, [searchParams])

  const loadOrder = async (orderId: string) => {
    try {
      const docRef = doc(db, 'orders', orderId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() } as Order)
      }
    } catch (error) {
      console.error('Error loading order:', error)
      toast.error('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!order || !userData) return

    setProcessing(true)

    try {
      const response = await fetch('/api/payment/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.totalAmount,
          email: userData.email,
        }),
      })

      const data = await response.json()

      if (data.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.authorizationUrl
      } else {
        toast.error('Failed to initialize payment')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Failed to process payment')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <div className="text-gray-600">Loading payment...</div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="default" className="p-8 text-center">
          <Shield className="mx-auto mb-4 text-gray-400" size={48} />
          <div className="text-gray-600 text-xl">Order not found</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Renthaus Logo" 
                width={180} 
                height={60}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1">
                <Home size={18} />
                Home
              </Link>
              <Link href="/search" className="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1">
                <Search size={18} />
                Browse
              </Link>
              {order && (
                <Link href={`/products/${order.productId}`} className="text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1">
                  <ArrowLeft size={18} />
                  Back to Product
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 md:mb-8">Complete Payment</h1>

        <Card variant="default" className="p-8 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-primary" size={32} />
            <h2 className="text-2xl font-semibold text-gray-900">Secure Payment</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Your payment is secured by Paystack. The security deposit will be held in escrow until the rental is completed.
          </p>
        </Card>

        <Card variant="default" className="p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Product</span>
              <span className="text-gray-900 font-semibold">{order.productTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rental Fee</span>
              <span className="text-gray-900">{formatCurrency(order.rentalFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Security Deposit</span>
              <span className="text-gray-900">{formatCurrency(order.securityDeposit)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-xl font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-semibold text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </Card>

        <Button
          onClick={handlePayment}
          className="w-full"
          size="lg"
          disabled={processing}
        >
          <CreditCard className="mr-2" size={20} />
          {processing ? 'Processing...' : 'Pay with Paystack'}
        </Button>
      </div>
        </div>
      </div>
    </div>
  )
}

