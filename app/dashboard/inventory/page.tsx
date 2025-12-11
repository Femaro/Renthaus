'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Product, InventoryItem } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'
import { Calendar, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InventoryPage() {
  const { userData } = useAuth()
  const [products, setProducts] = useState<(Product & { id: string })[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState('')
  const [inventory, setInventory] = useState<Record<string, InventoryItem[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [userData])

  useEffect(() => {
    if (selectedProduct) {
      loadInventory(selectedProduct)
    }
  }, [selectedProduct])

  const loadProducts = async () => {
    if (!userData) return
    try {
      const q = query(collection(db, 'products'), where('vendorId', '==', userData.uid))
      const snapshot = await getDocs(q)
      const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product & { id: string }))
      setProducts(loaded)
      if (loaded.length > 0 && !selectedProduct) {
        setSelectedProduct(loaded[0].id)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInventory = async (productId: string) => {
    try {
      const q = query(collection(db, 'inventory'), where('productId', '==', productId))
      const snapshot = await getDocs(q)
      const items = snapshot.docs.map((doc) => ({ ...doc.data() } as InventoryItem))
      setInventory({ ...inventory, [productId]: items })
    } catch (error) {
      console.error('Error loading inventory:', error)
    }
  }

  const toggleAvailability = async (productId: string, date: string, available: boolean) => {
    try {
      const inventoryId = `${productId}_${date}`
      if (available) {
        // Remove from inventory (mark as unavailable)
        const q = query(
          collection(db, 'inventory'),
          where('productId', '==', productId),
          where('date', '==', date)
        )
        const snapshot = await getDocs(q)
        snapshot.docs.forEach((doc) => deleteDoc(doc.ref))
      } else {
        // Add to inventory (mark as available)
        await setDoc(doc(db, 'inventory', inventoryId), {
          productId,
          date,
          available: true,
        })
      }
      loadInventory(productId)
      toast.success('Availability updated')
    } catch (error) {
      console.error('Error updating inventory:', error)
      toast.error('Failed to update availability')
    }
  }

  const generateCalendar = () => {
    const days: string[] = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date.toISOString().split('T')[0])
    }
    return days
  }

  const isAvailable = (productId: string, date: string) => {
    return inventory[productId]?.some((item) => item.date === date && item.available) || false
  }

  if (loading) {
    return <div className="text-white">Loading...</div>
  }

  if (products.length === 0) {
    return (
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Inventory Management</h1>
        <Card variant="glass" className="text-center py-12">
          <p className="text-gray-300 text-xl">No products found. Create a listing first.</p>
        </Card>
      </div>
    )
  }

  const calendarDays = generateCalendar()

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Inventory Management</h1>

      <Card variant="glass" className="mb-6 p-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Select Product</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl glass border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary text-white bg-transparent"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id} className="bg-black">
              {product.title}
            </option>
          ))}
        </select>
      </Card>

      {selectedProduct && (
        <Card variant="glass" className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            {products.find((p) => p.id === selectedProduct)?.title} - Availability Calendar
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date) => {
              const available = isAvailable(selectedProduct, date)
              return (
                <button
                  key={date}
                  onClick={() => toggleAvailability(selectedProduct, date, available)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    available
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-red-500/20 border-red-500 text-red-400'
                  } hover:scale-105`}
                >
                  <div className="text-xs font-semibold mb-1">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-lg font-bold">
                    {new Date(date).getDate()}
                  </div>
                  {available ? (
                    <Check size={16} className="mx-auto mt-1" />
                  ) : (
                    <X size={16} className="mx-auto mt-1" />
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-6 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/20 border-2 border-green-500 rounded"></div>
              <span className="text-gray-300 text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/20 border-2 border-red-500 rounded"></div>
              <span className="text-gray-300 text-sm">Unavailable</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

