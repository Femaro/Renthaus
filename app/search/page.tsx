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
import { Search, Calendar, MapPin, Star, Shield, Package, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: searchParams?.get('location') || '',
    date: searchParams?.get('date') || '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'relevance', // relevance, price-low, price-high, newest
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    searchProducts()
  }, [filters.sortBy])

  const searchProducts = async () => {
    if (!db) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      let q = query(collection(db, 'products'), where('available', '==', true))
      const snapshot = await getDocs(q)
      let allProducts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product))

      // Apply filters
      if (filters.location) {
        const locationLower = filters.location.toLowerCase()
        allProducts = allProducts.filter(
          (p) =>
            p.city.toLowerCase().includes(locationLower) ||
            p.state.toLowerCase().includes(locationLower)
        )
      }

      if (filters.category) {
        allProducts = allProducts.filter(
          (p) => p.category.toLowerCase() === filters.category.toLowerCase()
        )
      }

      // Price range filter
      if (filters.minPrice) {
        allProducts = allProducts.filter((p) => p.dailyPrice >= parseFloat(filters.minPrice))
      }
      if (filters.maxPrice) {
        allProducts = allProducts.filter((p) => p.dailyPrice <= parseFloat(filters.maxPrice))
      }

      // Sorting
      switch (filters.sortBy) {
        case 'price-low':
          allProducts.sort((a, b) => a.dailyPrice - b.dailyPrice)
          break
        case 'price-high':
          allProducts.sort((a, b) => b.dailyPrice - a.dailyPrice)
          break
        case 'newest':
          allProducts.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0
            const bTime = b.createdAt?.toMillis?.() || 0
            return bTime - aTime
          })
          break
        default:
          // Relevance (default) - keep original order
          break
      }

      setProducts(allProducts)
    } catch (error) {
      console.error('Error searching products:', error)
      toast.error('Failed to search products')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 md:mb-8">Search Equipment</h1>

        <Card variant="default" className="mb-8 p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Location (City, State)"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="pl-12"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="pl-12"
                />
              </div>
              <div>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white"
                >
                  <option value="">All Categories</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Audio/Visual">Audio/Visual</option>
                  <option value="Decorations">Decorations</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Tables">Tables</option>
                  <option value="Chairs">Chairs</option>
                  <option value="Tents">Tents</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 items-end">
              <Button type="submit" size="lg" className="flex-1 md:flex-initial">
                <Search className="mr-2" size={20} />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="mr-2" size={20} />
                Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (NGN)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (NGN)</label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({
                        location: '',
                        date: '',
                        category: '',
                        minPrice: '',
                        maxPrice: '',
                        sortBy: 'relevance',
                      })
                      setShowFilters(false)
                    }}
                  >
                    <X className="mr-2" size={16} />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Card>

        {loading ? (
          <div className="text-center text-gray-600 py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <Card variant="default" className="text-center py-12">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 text-xl">No products found. Try adjusting your search.</p>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-gray-600">
                Found <span className="font-semibold text-gray-900">{products.length}</span> equipment{products.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    setFilters({ ...filters, sortBy: e.target.value })
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card variant="default" hover className="h-full flex flex-col">
                    <div className="aspect-video bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="text-gray-300" size={48} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{product.city}, {product.state}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xl font-semibold text-gray-900">{formatCurrency(product.dailyPrice)}</p>
                          <p className="text-xs text-gray-500">per day</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-400" size={14} fill="currentColor" />
                          <span className="text-sm text-gray-600">4.5</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

