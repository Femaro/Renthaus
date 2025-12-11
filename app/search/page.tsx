'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { collection, query, where, getDocs, GeoPoint } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Product } from '@/lib/firebase/types'
import { formatCurrency } from '@/lib/utils'
import { Search, Calendar, MapPin, Star, Shield, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: searchParams?.get('location') || '',
    date: searchParams?.get('date') || '',
    category: '',
  })

  useEffect(() => {
    searchProducts()
  }, [])

  const searchProducts = async () => {
    setLoading(true)
    try {
      let q = query(collection(db, 'products'), where('available', '==', true))

      if (filters.location) {
        // For MVP, we'll do a simple text search on city/state
        // In production, use GeoPoint and geohash
        const locationLower = filters.location.toLowerCase()
        const allProducts = await getDocs(collection(db, 'products'))
        const filtered = allProducts.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
          .filter(
            (p) =>
              p.city.toLowerCase().includes(locationLower) ||
              p.state.toLowerCase().includes(locationLower)
          )
        setProducts(filtered)
      } else {
        const snapshot = await getDocs(q)
        setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product)))
      }
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchProducts()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Search Equipment</h1>

        <Card variant="glass" className="mb-8 p-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Location (City, State)"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="pl-12"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="pl-12"
                  required
                />
              </div>
            </div>
            <Button type="submit">
              <Search className="mr-2" size={20} />
              Search
            </Button>
          </form>
        </Card>

        {loading ? (
          <div className="text-center text-white py-12">Loading...</div>
        ) : products.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <p className="text-gray-300 text-xl">No products found. Try adjusting your search.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <Card variant="glass" hover className="h-full">
                  <div className="aspect-video bg-gray-800 rounded-xl mb-4 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Package className="text-gray-600" size={48} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">{product.city}, {product.state}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(product.dailyPrice)}</p>
                      <p className="text-gray-400 text-sm">per day</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400" size={16} fill="currentColor" />
                      <span className="text-white text-sm">4.5</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

