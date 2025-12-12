'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase/config'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Product, AddOnService } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Edit, Trash2, Eye, EyeOff, X, Upload, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

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
    images: [] as string[],
  })
  const [uploadingImages, setUploadingImages] = useState(false)

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
        images: formData.images,
        createdAt: editingProduct ? undefined : Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct), productData)
        toast.success('Equipment updated successfully!')
      } else {
        await addDoc(collection(db, 'products'), productData)
        toast.success('Equipment added successfully!')
      }

      setShowForm(false)
      setEditingProduct(null)
      resetForm()
      loadProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save equipment')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !storage || !userData) return

    setUploadingImages(true)
    try {
      const uploadPromises = files.map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is larger than 5MB`)
        }
        const imageRef = ref(storage, `products/${userData.uid}/${Date.now()}_${file.name}`)
        await uploadBytes(imageRef, file)
        return await getDownloadURL(imageRef)
      })

      const urls = await Promise.all(uploadPromises)
      setFormData({ ...formData, images: [...formData.images, ...urls] })
      toast.success(`${urls.length} image(s) uploaded successfully!`)
    } catch (error: any) {
      console.error('Error uploading images:', error)
      toast.error(error.message || 'Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
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
      images: [],
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
    return <div className="text-gray-700">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold text-gray-900">My Equipment</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2" size={20} />
          {showForm ? 'Cancel' : 'Add New Listing'}
        </Button>
      </div>

      {showForm && (
        <Card variant="default" className="mb-8 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Images</label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <Upload size={20} className="text-gray-400" />
                    <span className="text-gray-600">Upload Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                  </label>
                  {uploadingImages && <span className="text-gray-500 text-sm">Uploading...</span>}
                </div>
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={url}
                          alt={`Equipment image ${index + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={uploadingImages}>
              {editingProduct ? 'Update Equipment' : 'Add Equipment'}
            </Button>
          </form>
        </Card>
      )}

      {products.length === 0 ? (
        <Card variant="default" className="text-center py-12">
          <p className="text-gray-600 text-xl">No equipment listed yet. Add your first equipment!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} variant="default" hover className="p-6">
              {product.images && product.images.length > 0 ? (
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 mb-4 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="text-gray-400" size={48} />
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{product.title}</h3>
                <button
                  onClick={() => toggleAvailability(product.id, product.available)}
                  className="text-gray-400 hover:text-primary"
                >
                  {product.available ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-2xl font-semibold text-primary">{formatCurrency(product.dailyPrice)}</p>
                  <p className="text-gray-500 text-sm">per day</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm border ${
                  product.available ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
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
                      images: product.images || [],
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

