'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const reference = searchParams?.get('reference')
    if (reference) {
      verifyPayment(reference)
    } else {
      setStatus('error')
    }
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(`/api/payment/paystack?reference=${reference}`)
      const data = await response.json()

      if (data.success) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black flex items-center justify-center p-4">
      <Card variant="glass" className="max-w-md w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h2>
            <p className="text-gray-300">Please wait while we confirm your payment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-300 mb-6">Your order has been confirmed</p>
            <Link href="/dashboard/bookings">
              <Button className="w-full">View My Bookings</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="text-red-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
            <p className="text-gray-300 mb-6">There was an issue processing your payment</p>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Go to Dashboard</Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  )
}

