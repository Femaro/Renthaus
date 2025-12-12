'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Product } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Star, Shield, Calendar, MessageSquare, Package, StarHalf } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'

export default function ProductDetailPage() {
  const params = useParams()
  const { userData } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDates, setSelectedDates] = useState({
    start: '',
    end: '',
  })

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      const docRef = doc(db, 'products', params.id as string)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product)
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = () => {
    if (!userData) {
      window.location.href = '/login'
      return
    }
    // Navigate to checkout
    const params = new URLSearchParams()
    params.set('productId', product!.id)
    if (selectedDates.start) params.set('startDate', selectedDates.start)
    if (selectedDates.end) params.set('endDate', selectedDates.end)
    window.location.href = `/checkout?${params.toString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <div className="text-gray-600">Loading product...</div>
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-2xl mb-4 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="text-gray-300" size={64} />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                    <Image src={img} alt={`${product.title} ${idx + 2}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-4">{product.title}</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-400" size={20} fill="currentColor" />
                <span className="text-gray-900 font-medium">4.5</span>
                <span className="text-gray-500">(24 reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-600">{product.city}, {product.state}</span>
              </div>
              <Link href={`/products/${product.id}/reviews`} className="text-primary hover:underline text-sm">
                View all reviews →
              </Link>
            </div>

            <Card variant="default" className="mb-6 p-6">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-4xl font-semibold text-primary">{formatCurrency(product.dailyPrice)}</span>
                <span className="text-gray-500">per day</span>
              </div>
              {product.weeklyPrice && (
                <p className="text-gray-600">
                  Weekly: <span className="text-gray-900 font-semibold">{formatCurrency(product.weeklyPrice)}</span>
                </p>
              )}
            </Card>

            <Card variant="default" className="mb-6 p-6 bg-red-50 border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">Item Coverage</h3>
              </div>
              <p className="text-gray-600 mb-4">
                This item is covered up to {formatCurrency(product.itemCoverage || 2000000)} at no additional cost.
              </p>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-green-600" />
                <span className="text-sm text-gray-600">Security Deposit: {formatCurrency(product.securityDeposit)}</span>
              </div>
            </Card>

            <Card variant="default" className="mb-6 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Dates</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={selectedDates.start}
                    onChange={(e) => setSelectedDates({ ...selectedDates, start: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <Input
                    type="date"
                    value={selectedDates.end}
                    onChange={(e) => setSelectedDates({ ...selectedDates, end: e.target.value })}
                    min={selectedDates.start || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleBook} className="flex-1" size="lg">
                Book Now
              </Button>
              <Link href={`/dashboard/messages?vendorId=${product.vendorId}`} className="flex-1 sm:flex-initial">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <MessageSquare className="mr-2" size={20} />
                  Message Owner
                </Button>
              </Link>
            </div>

            <Card variant="default" className="mt-6 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{product.description}</p>
            </Card>

            {product.customFilters && Object.keys(product.customFilters).length > 0 && (
              <Card variant="default" className="mt-6 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.customFilters).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-gray-500 text-sm">{key}</p>
                      <p className="text-gray-900 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {product.addOnServices && product.addOnServices.length > 0 && (
              <Card variant="default" className="mt-6 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Add-on Services</h3>
                <div className="space-y-2">
                  {product.addOnServices.map((service) => (
                    <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-900 font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-gray-500 text-sm">{service.description}</p>
                        )}
                      </div>
                      <span className="text-primary font-semibold">{formatCurrency(service.price)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

