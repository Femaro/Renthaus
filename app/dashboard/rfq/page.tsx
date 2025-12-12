'use client'

import { useState } from 'react'
import { collection, addDoc, Timestamp, GeoPoint } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { Plus, X } from 'lucide-react'

export default function RFQPage() {
  const { userData } = useAuth()
  const [formData, setFormData] = useState({
    eventDate: '',
    eventType: '',
    city: '',
    state: '',
    budget: '',
    items: [{ category: '', quantity: 1, description: '' }],
  })
  const [submitting, setSubmitting] = useState(false)

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { category: '', quantity: 1, description: '' }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData) return

    setSubmitting(true)

    try {
      // For MVP, we'll use a simple location. In production, use GeoPoint with actual coordinates
      const rfqData = {
        customerId: userData.uid,
        customerName: userData.displayName,
        eventDate: Timestamp.fromDate(new Date(formData.eventDate)),
        eventType: formData.eventType,
        location: new GeoPoint(0, 0), // Placeholder - should use actual coordinates
        city: formData.city,
        state: formData.state,
        items: formData.items,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        status: 'open',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      await addDoc(collection(db, 'rfqs'), rfqData)
      toast.success('RFQ submitted successfully! Vendors will be able to respond with quotes.')
      setFormData({
        eventDate: '',
        eventType: '',
        city: '',
        state: '',
        budget: '',
        items: [{ category: '', quantity: 1, description: '' }],
      })
    } catch (error) {
      console.error('Error submitting RFQ:', error)
      toast.error('Failed to submit RFQ. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold text-gray-900 mb-8">Request for Quote</h1>
      <Card variant="default" className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
              <Input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
              <Input
                placeholder="e.g., Wedding, Corporate Event, Birthday"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <Input
                placeholder="Lagos"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <Input
                placeholder="Lagos State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (Optional)</label>
              <Input
                type="number"
                placeholder="Enter your budget in NGN"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">Items Needed *</label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus size={16} className="mr-2" />
                Add Item
              </Button>
            </div>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <Card key={index} variant="default" className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-gray-900 font-semibold">Item {index + 1}</h3>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <Input
                        placeholder="e.g., Chairs, Tables, Sound System"
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                      <Input
                        placeholder="Additional details"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit RFQ'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

