'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Product, AddOnService } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ListingsPage() {
  const { userData } = useAuth()
  const [products, setProducts] = useState<(Product & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    dailyPrice: '',
    weeklyPrice: '',
    securityDeposit: '',
    city: '',
    state: '',
    customFilters: {} as Record<string, string>,
    addOnServices: [] as AddOnService[],
    available: true,
  })

  useEffect(() => {
    loadProducts()
  }, [userData])

  const loadProducts = async () => {
    if (!userData) return
    try {
      const q = query(collection(db, 'products'), where('vendorId', '==', userData.uid))
      const snapshot = await getDocs(q)
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product & { id: string })))
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData) return

    try {
      const productData: Omit<Product, 'id'> = {
        vendorId: userData.uid,
        vendorName: userData.displayName,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        dailyPrice: parseFloat(formData.dailyPrice),
        weeklyPrice: formData.weeklyPrice ? parseFloat(formData.weeklyPrice) : undefined,
        securityDeposit: parseFloat(formData.securityDeposit),
        location: { latitude: 0, longitude: 0 } as any, // Placeholder - should use actual GeoPoint
        city: formData.city,
        state: formData.state,
        customFilters: formData.customFilters,
        addOnServices: formData.addOnServices.length > 0 ? formData.addOnServices : undefined,
        itemCoverage: 2000000,
        available: formData.available,
        images: [], // Should be handled via file upload
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      }

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct), productData)
        toast.success('Product updated successfully!')
      } else {
        await addDoc(collection(db, 'products'), productData)
        toast.success('Product created successfully!')
      }

      setShowForm(false)
      setEditingProduct(null)
      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      subcategory: '',
      dailyPrice: '',
      weeklyPrice: '',
      securityDeposit: '',
      city: '',
      state: '',
      customFilters: {},
      addOnServices: [],
      available: true,
    })
  }

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'products', productId), { available: !currentStatus })
      toast.success('Availability updated')
      loadProducts()
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  if (loading) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">My Listings</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2" size={20} />
          {showForm ? 'Cancel' : 'Add New Listing'}
        </Button>
      </div>

      {showForm && (
        <Card variant="glass" className="mb-8 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Product Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                label="Category *"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Furniture, Audio/Visual, Decorations"
                required
              />
              <Input
                label="Subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              />
              <Input
                label="City *"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Input
                label="State *"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
              <Input
                label="Daily Price (NGN) *"
                type="number"
                value={formData.dailyPrice}
                onChange={(e) => setFormData({ ...formData, dailyPrice: e.target.value })}
                required
              />
              <Input
                label="Weekly Price (NGN)"
                type="number"
                value={formData.weeklyPrice}
                onChange={(e) => setFormData({ ...formData, weeklyPrice: e.target.value })}
              />
              <Input
                label="Security Deposit (NGN) *"
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
              <textarea
                className="w-full px-4 py-3 rounded-2xl glass border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary text-white bg-transparent"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </form>
        </Card>
      )}

      {products.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <p className="text-gray-300 text-xl">No listings yet. Create your first listing!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} variant="glass" className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{product.title}</h3>
                <button
                  onClick={() => toggleAvailability(product.id, product.available)}
                  className="text-gray-400 hover:text-primary"
                >
                  {product.available ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(product.dailyPrice)}</p>
                  <p className="text-gray-400 text-sm">per day</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  product.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {product.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditingProduct(product.id)
                    setFormData({
                      title: product.title,
                      description: product.description,
                      category: product.category,
                      subcategory: product.subcategory || '',
                      dailyPrice: product.dailyPrice.toString(),
                      weeklyPrice: product.weeklyPrice?.toString() || '',
                      securityDeposit: product.securityDeposit.toString(),
                      city: product.city,
                      state: product.state,
                      customFilters: product.customFilters || {},
                      addOnServices: product.addOnServices || [],
                      available: product.available,
                    })
                    setShowForm(true)
                  }}
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

