import { NextRequest, NextResponse } from 'next/server'
import admin from '@/lib/firebase/admin'

const db = admin.firestore()

// Email notification service
// In production, integrate with SendGrid, AWS SES, or similar
async function sendEmail(to: string, subject: string, html: string) {
  // TODO: Integrate with actual email service
  // For now, we'll log the email and store it in Firestore for tracking
  console.log('Email notification:', { to, subject })
  
  // Store email notification in Firestore
  await db.collection('email_notifications').add({
    to,
    subject,
    html,
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'pending', // In production, update to 'sent' after actual send
  })

  // In production, replace with actual email service:
  // await emailService.send({ to, subject, html })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, orderId, customerEmail, vendorId, message } = body

    if (type === 'payment_success') {
      // Get order details
      const orderDoc = await db.collection('orders').doc(orderId).get()
      if (!orderDoc.exists) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const orderData = orderDoc.data()
      
      // Get vendor details
      const vendorDoc = await db.collection('users').doc(vendorId).get()
      const vendorData = vendorDoc.data()

      // Email to customer
      await sendEmail(
        customerEmail || orderData?.customerEmail || '',
        'Payment Successful - RentHaus',
        `
          <h2>Payment Successful!</h2>
          <p>Your payment for order #${orderId} has been confirmed.</p>
          <p><strong>Equipment:</strong> ${orderData?.productTitle}</p>
          <p><strong>Total Amount:</strong> ₦${orderData?.totalAmount?.toLocaleString()}</p>
          <p>You will receive a confirmation from the equipment owner shortly.</p>
          <p>Thank you for using RentHaus!</p>
        `
      )

      // Email to vendor
      if (vendorData?.email) {
        await sendEmail(
          vendorData.email,
          'New Order Received - RentHaus',
          `
            <h2>New Order Received!</h2>
            <p>You have received a new order for your equipment.</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Equipment:</strong> ${orderData?.productTitle}</p>
            <p><strong>Total Amount:</strong> ₦${orderData?.totalAmount?.toLocaleString()}</p>
            <p>Please log in to your dashboard to view order details.</p>
          `
        )
      }
    } else if (type === 'order_status_update') {
      const orderDoc = await db.collection('orders').doc(orderId).get()
      if (!orderDoc.exists) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const orderData = orderDoc.data()
      const status = orderData?.status || ''

      await sendEmail(
        customerEmail || orderData?.customerEmail || '',
        `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - RentHaus`,
        `
          <h2>Order Status Updated</h2>
          <p>Your order #${orderId} status has been updated to: <strong>${status}</strong></p>
          <p><strong>Equipment:</strong> ${orderData?.productTitle}</p>
          <p>Please check your dashboard for more details.</p>
        `
      )
    } else if (type === 'new_message') {
      await sendEmail(
        customerEmail || '',
        'New Message - RentHaus',
        `
          <h2>You have a new message</h2>
          <p>${message || 'You have received a new message on RentHaus.'}</p>
          <p>Please log in to your dashboard to view and respond.</p>
        `
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error sending email notification:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    )
  }
}

