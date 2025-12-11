'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Product } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Star, Shield, Calendar, MessageSquare, Package } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

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
      <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black flex items-center justify-center">
        <div className="text-white">Product not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-800 rounded-3xl mb-4 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="text-gray-600" size={64} />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-gray-800 rounded-xl overflow-hidden">
                    <img src={img} alt={`${product.title} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">{product.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="text-yellow-400" size={20} fill="currentColor" />
                <span className="text-white">4.5</span>
                <span className="text-gray-400">(24 reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-300">{product.city}, {product.state}</span>
              </div>
            </div>

            <Card variant="glass" className="mb-6 p-6">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-4xl font-bold text-primary">{formatCurrency(product.dailyPrice)}</span>
                <span className="text-gray-400">per day</span>
              </div>
              {product.weeklyPrice && (
                <p className="text-gray-300">
                  Weekly: <span className="text-white font-semibold">{formatCurrency(product.weeklyPrice)}</span>
                </p>
              )}
            </Card>

            <Card variant="glass-red" className="mb-6 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={20} className="text-primary" />
                <h3 className="text-lg font-bold text-white">Item Coverage</h3>
              </div>
              <p className="text-gray-300 mb-4">
                This item is covered up to {formatCurrency(product.itemCoverage || 2000000)} at no additional cost.
              </p>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-green-400" />
                <span className="text-sm text-gray-300">Security Deposit: {formatCurrency(product.securityDeposit)}</span>
              </div>
            </Card>

            <Card variant="glass" className="mb-6 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Select Dates</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={selectedDates.start}
                    onChange={(e) => setSelectedDates({ ...selectedDates, start: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl glass border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary text-white"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={selectedDates.end}
                    onChange={(e) => setSelectedDates({ ...selectedDates, end: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl glass border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary text-white"
                    min={selectedDates.start || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleBook} className="flex-1" size="lg">
                Book Now
              </Button>
              <Link href={`/dashboard/messages?vendorId=${product.vendorId}`}>
                <Button variant="outline" size="lg">
                  <MessageSquare className="mr-2" size={20} />
                  Message Vendor
                </Button>
              </Link>
            </div>

            <Card variant="glass" className="mt-6 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Description</h3>
              <p className="text-gray-300 whitespace-pre-line">{product.description}</p>
            </Card>

            {product.customFilters && Object.keys(product.customFilters).length > 0 && (
              <Card variant="glass" className="mt-6 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.customFilters).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-gray-400 text-sm">{key}</p>
                      <p className="text-white font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {product.addOnServices && product.addOnServices.length > 0 && (
              <Card variant="glass" className="mt-6 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Add-on Services</h3>
                <div className="space-y-2">
                  {product.addOnServices.map((service) => (
                    <div key={service.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-gray-400 text-sm">{service.description}</p>
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

