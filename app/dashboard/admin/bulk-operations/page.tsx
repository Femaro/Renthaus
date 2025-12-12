'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, doc, query, where, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Package, Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { SkeletonList } from '@/components/ui/Skeleton'

export default function BulkOperationsPage() {
  const { userData } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
  })

  useEffect(() => {
    if (userData?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    loadStats()
  }, [userData, router])

  const loadStats = async () => {
    if (!db) return
    try {
      const [vendorsSnapshot, productsSnapshot, ordersSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'vendor'))),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'orders')),
      ])

      setStats({
        totalVendors: vendorsSnapshot.docs.length,
        totalProducts: productsSnapshot.docs.length,
        totalOrders: ordersSnapshot.docs.length,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const bulkApproveVendors = async () => {
    if (!db) return
    if (!confirm('Are you sure you want to approve all pending vendors?')) return

    setLoading(true)
    try {
      const vendorsSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'vendor'), where('registrationStatus', '==', 'pending'))
      )

      const batch = writeBatch(db)
      let count = 0

      vendorsSnapshot.docs.forEach((vendorDoc) => {
        batch.update(vendorDoc.ref, {
          registrationStatus: 'approved',
          updatedAt: new Date(),
        })
        count++
      })

      if (count > 0) {
        await batch.commit()
        toast.success(`Approved ${count} vendor${count !== 1 ? 's' : ''}`)
        loadStats()
      } else {
        toast.info('No pending vendors to approve')
      }
    } catch (error) {
      console.error('Error approving vendors:', error)
      toast.error('Failed to approve vendors')
    } finally {
      setLoading(false)
    }
  }

  const bulkVerifyVendors = async () => {
    if (!db) return
    if (!confirm('Are you sure you want to verify all approved vendors?')) return

    setLoading(true)
    try {
      const vendorsSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'vendor'), where('registrationStatus', '==', 'approved'))
      )

      const batch = writeBatch(db)
      let count = 0

      vendorsSnapshot.docs.forEach((vendorDoc) => {
        const data = vendorDoc.data()
        if (!data.verified) {
          batch.update(vendorDoc.ref, {
            verified: true,
            updatedAt: new Date(),
          })
          count++
        }
      })

      if (count > 0) {
        await batch.commit()
        toast.success(`Verified ${count} vendor${count !== 1 ? 's' : ''}`)
        loadStats()
      } else {
        toast.info('No vendors to verify')
      }
    } catch (error) {
      console.error('Error verifying vendors:', error)
      toast.error('Failed to verify vendors')
    } finally {
      setLoading(false)
    }
  }

  const bulkUpdateProductAvailability = async (available: boolean) => {
    if (!db) return
    const action = available ? 'activate' : 'deactivate'
    if (!confirm(`Are you sure you want to ${action} all products?`)) return

    setLoading(true)
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'))

      const batch = writeBatch(db)
      let count = 0

      productsSnapshot.docs.forEach((productDoc) => {
        const data = productDoc.data()
        if (data.available !== available) {
          batch.update(productDoc.ref, {
            available,
            updatedAt: new Date(),
          })
          count++
        }
      })

      if (count > 0) {
        await batch.commit()
        toast.success(`${available ? 'Activated' : 'Deactivated'} ${count} product${count !== 1 ? 's' : ''}`)
        loadStats()
      } else {
        toast.info(`No products to ${action}`)
      }
    } catch (error) {
      console.error(`Error ${action}ing products:`, error)
      toast.error(`Failed to ${action} products`)
    } finally {
      setLoading(false)
    }
  }

  if (userData?.role !== 'admin') {
    return null
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 md:mb-8">Bulk Operations</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Total Vendors</h3>
            <Users className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{stats.totalVendors}</p>
        </Card>
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Total Products</h3>
            <Package className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{stats.totalProducts}</p>
        </Card>
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Total Orders</h3>
            <DollarSign className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{stats.totalOrders}</p>
        </Card>
      </div>

      {/* Vendor Operations */}
      <Card variant="default" className="p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vendor Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Approve All Pending Vendors</h3>
              <p className="text-sm text-gray-600">Approve all vendors with pending registration status</p>
            </div>
            <Button onClick={bulkApproveVendors} disabled={loading} variant="outline">
              <CheckCircle className="mr-2" size={18} />
              Approve All
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Verify All Approved Vendors</h3>
              <p className="text-sm text-gray-600">Mark all approved vendors as verified</p>
            </div>
            <Button onClick={bulkVerifyVendors} disabled={loading} variant="outline">
              <CheckCircle className="mr-2" size={18} />
              Verify All
            </Button>
          </div>
        </div>
      </Card>

      {/* Product Operations */}
      <Card variant="default" className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Activate All Products</h3>
              <p className="text-sm text-gray-600">Make all products available for rental</p>
            </div>
            <Button onClick={() => bulkUpdateProductAvailability(true)} disabled={loading} variant="outline">
              <CheckCircle className="mr-2" size={18} />
              Activate All
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Deactivate All Products</h3>
              <p className="text-sm text-gray-600">Make all products unavailable for rental</p>
            </div>
            <Button onClick={() => bulkUpdateProductAvailability(false)} disabled={loading} variant="outline">
              <AlertCircle className="mr-2" size={18} />
              Deactivate All
            </Button>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="mt-6">
          <div className="text-center text-gray-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <p>Processing bulk operation...</p>
          </div>
        </div>
      )}
    </div>
  )
}

