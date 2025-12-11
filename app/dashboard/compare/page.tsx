'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Product } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { X, Star, Shield } from 'lucide-react'
import Link from 'next/link'

export default function ComparePage() {
  const [products, setProducts] = useState<(Product & { id: string })[]>([])
  const [productIds, setProductIds] = useState<string[]>([])

  useEffect(() => {
    // Get product IDs from URL params or localStorage
    const params = new URLSearchParams(window.location.search)
    const ids = params.get('ids')?.split(',') || []
    setProductIds(ids)
    loadProducts(ids)
  }, [])

  const loadProducts = async (ids: string[]) => {
    const loaded: (Product & { id: string })[] = []
    for (const id of ids) {
      try {
        const docRef = doc(db, 'products', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as Product & { id: string })
        }
      } catch (error) {
        console.error(`Error loading product ${id}:`, error)
      }
    }
    setProducts(loaded)
  }

  const removeProduct = (id: string) => {
    const newIds = productIds.filter((pid) => pid !== id)
    setProductIds(newIds)
    setProducts(products.filter((p) => p.id !== id))
    // Update URL
    const params = new URLSearchParams()
    params.set('ids', newIds.join(','))
    window.history.replaceState({}, '', `?${params.toString()}`)
  }

  if (products.length === 0) {
    return (
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Compare Products</h1>
        <Card variant="glass" className="text-center py-12">
          <p className="text-gray-300 text-xl mb-4">No products to compare</p>
          <Link href="/search">
            <Button>Browse Products</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const allCustomFilters = new Set<string>()
  products.forEach((p) => {
    if (p.customFilters) {
      Object.keys(p.customFilters).forEach((key) => allCustomFilters.add(key))
    }
  })

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Compare Products</h1>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 text-white font-semibold">Feature</th>
                {products.map((product) => (
                  <th key={product.id} className="text-center p-4 min-w-[300px]">
                    <Card variant="glass" className="p-4 relative">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
                      >
                        <X size={20} />
                      </button>
                      {product.images && product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-32 object-cover rounded-xl mb-3"
                        />
                      )}
                      <h3 className="text-lg font-bold text-white mb-2">{product.title}</h3>
                      <p className="text-2xl font-bold text-primary mb-4">
                        {formatCurrency(product.dailyPrice)}
                      </p>
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" className="w-full">View Details</Button>
                      </Link>
                    </Card>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 text-gray-300 font-medium">Price (Daily)</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center text-white font-semibold">
                    {formatCurrency(product.dailyPrice)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-gray-300 font-medium">Security Deposit</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center text-white">
                    {formatCurrency(product.securityDeposit)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-gray-300 font-medium">Location</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center text-white">
                    {product.city}, {product.state}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-gray-300 font-medium">Item Coverage</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center text-white">
                    {formatCurrency(product.itemCoverage || 2000000)}
                  </td>
                ))}
              </tr>
              {Array.from(allCustomFilters).map((filterKey) => (
                <tr key={filterKey}>
                  <td className="p-4 text-gray-300 font-medium">{filterKey}</td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center text-white">
                      {product.customFilters?.[filterKey] || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

