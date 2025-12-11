import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import admin from '@/lib/firebase/admin'

const db = getFirestore()

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decodedToken = await getAuth().verifyIdToken(token)
    const userId = decodedToken.uid

    const body = await request.json()
    const { productId, startDate, endDate, addOnServices = [] } = body

    // Check availability atomically
    const productRef = db.collection('products').doc(productId)
    const productDoc = await productRef.get()

    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check inventory availability for the date range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates: string[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }

    // Check each date in inventory
    const inventoryRef = db.collection('inventory')
    for (const date of dates) {
      const inventoryQuery = await inventoryRef
        .where('productId', '==', productId)
        .where('date', '==', date)
        .where('available', '==', true)
        .limit(1)
        .get()

      if (inventoryQuery.empty) {
        return NextResponse.json(
          { error: `Item not available on ${date}` },
          { status: 400 }
        )
      }
    }

    // Reserve inventory (atomic update)
    const batch = db.batch()
    for (const date of dates) {
      const inventoryQuery = await inventoryRef
        .where('productId', '==', productId)
        .where('date', '==', date)
        .where('available', '==', true)
        .limit(1)
        .get()

      if (!inventoryQuery.empty) {
        const inventoryDoc = inventoryQuery.docs[0]
        batch.update(inventoryDoc.ref, { available: false })
      }
    }

    await batch.commit()

    // Create order
    const orderData = {
      customerId: userId,
      vendorId: productDoc.data()?.vendorId,
      productId,
      productTitle: productDoc.data()?.title,
      startDate: admin.firestore.Timestamp.fromDate(start),
      endDate: admin.firestore.Timestamp.fromDate(end),
      rentalFee: body.rentalFee,
      securityDeposit: body.securityDeposit,
      addOnServices,
      totalAmount: body.totalAmount,
      commission: body.commission,
      status: 'pending',
      paymentStatus: 'pending',
      deliveryAddress: body.deliveryAddress,
      deliveryInstructions: body.deliveryInstructions,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    const orderRef = await db.collection('orders').add(orderData)

    return NextResponse.json({ orderId: orderRef.id }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

