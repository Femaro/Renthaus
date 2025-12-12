'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Product, Order } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { userData } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    startDate: searchParams?.get('startDate') || '',
    endDate: searchParams?.get('endDate') || '',
    deliveryAddress: '',
    deliveryInstructions: '',
    selectedAddOns: [] as string[],
  })

  useEffect(() => {
    const productId = searchParams?.get('productId')
    if (productId) {
      loadProduct(productId)
    }
  }, [searchParams])

  const loadProduct = async (productId: string) => {
    try {
      const docRef = doc(db, 'products', productId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product)
      }
    } catch (error) {
      console.error('Error loading product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!product || !formData.startDate || !formData.endDate) return 0

    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    let total = product.dailyPrice * days
    const addOnTotal = product.addOnServices
      ?.filter((s) => formData.selectedAddOns.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0) || 0

    return total + addOnTotal
  }

  const handleCheckout = async () => {
    if (!product || !userData || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setProcessing(true)

    try {
      // Check availability (this should be done via API route for atomic updates)
      // For MVP, we'll create the order and handle availability in the API route

      const orderData: Omit<Order, 'id'> = {
        customerId: userData.uid,
        vendorId: product.vendorId,
        productId: product.id,
        productTitle: product.title,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        rentalFee: calculateTotal() - product.securityDeposit,
        securityDeposit: product.securityDeposit,
        addOnServices: product.addOnServices
          ?.filter((s) => formData.selectedAddOns.includes(s.id))
          .map((s) => ({
            serviceId: s.id,
            name: s.name,
            price: s.price,
          })),
        totalAmount: calculateTotal() + product.securityDeposit,
        commission: (calculateTotal() + product.securityDeposit) * 0.1, // 10% commission
        status: 'pending',
        paymentStatus: 'pending',
        deliveryAddress: formData.deliveryAddress,
        deliveryInstructions: formData.deliveryInstructions,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      // Create order document
      const orderRef = await addDoc(collection(db, 'orders'), orderData)

      // Redirect to payment
      router.push(`/payment?orderId=${orderRef.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <div className="text-gray-600">Loading checkout...</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card variant="default" className="p-8 text-center">
          <Package className="mx-auto mb-4 text-gray-400" size={48} />
          <div className="text-gray-600 text-xl">Product not found</div>
        </Card>
      </div>
    )
  }

  const rentalFee = calculateTotal()
  const securityDeposit = product.securityDeposit
  const total = rentalFee + securityDeposit

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 md:mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card variant="default" className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rental Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                  <Input
                    placeholder="Enter delivery address"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Instructions</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 text-gray-900 bg-white"
                    placeholder="Any special instructions for delivery..."
                    value={formData.deliveryInstructions}
                    onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            {product.addOnServices && product.addOnServices.length > 0 && (
              <Card variant="default" className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Add-on Services</h2>
                <div className="space-y-3">
                  {product.addOnServices.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-primary/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.selectedAddOns.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                selectedAddOns: [...formData.selectedAddOns, service.id],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                selectedAddOns: formData.selectedAddOns.filter((id) => id !== service.id),
                              })
                            }
                          }}
                          className="w-5 h-5 rounded text-primary focus:ring-primary"
                        />
                        <div>
                          <p className="text-gray-900 font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-gray-500 text-sm">{service.description}</p>
                          )}
                          {service.mandatory && (
                            <span className="text-xs text-primary">Required</span>
                          )}
                        </div>
                      </div>
                      <span className="text-primary font-semibold">{formatCurrency(service.price)}</span>
                    </label>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div>
            <Card variant="default" className="p-6 sticky top-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental Fee</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(rentalFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(securityDeposit)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-xl font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-semibold text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
              <Button onClick={handleCheckout} className="w-full" size="lg" disabled={processing}>
                {processing ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

