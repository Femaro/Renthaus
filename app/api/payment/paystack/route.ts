import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'
import admin from '@/lib/firebase/admin'

const db = getFirestore()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, email } = body

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        reference: orderId,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        metadata: {
          orderId,
        },
      }),
    })

    const data = await paystackResponse.json()

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
    })
  } catch (error: any) {
    console.error('Error initializing payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await paystackResponse.json()

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Update order status
    const orderRef = db.collection('orders').doc(reference)
    await orderRef.update({
      paymentStatus: 'paid',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ success: true, data: data.data })
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

