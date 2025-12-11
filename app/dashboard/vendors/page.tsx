'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Vendor } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Check, X, Shield, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<(Vendor & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    loadVendors()
  }, [filter])

  const loadVendors = async () => {
    try {
      let q = query(collection(db, 'users'), where('role', '==', 'vendor'))
      const snapshot = await getDocs(q)
      let loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vendor & { id: string }))
      
      if (filter !== 'all') {
        loaded = loaded.filter((v) => v.registrationStatus === filter)
      }
      
      setVendors(loaded)
    } catch (error) {
      console.error('Error loading vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateVendorStatus = async (vendorId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'users', vendorId), {
        registrationStatus: status,
        updatedAt: new Date(),
      })
      toast.success(`Vendor ${status === 'approved' ? 'approved' : 'rejected'}`)
      loadVendors()
    } catch (error) {
      toast.error('Failed to update vendor status')
    }
  }

  const verifyVendor = async (vendorId: string) => {
    try {
      await updateDoc(doc(db, 'users', vendorId), {
        verified: true,
        updatedAt: new Date(),
      })
      toast.success('Vendor verified')
      loadVendors()
    } catch (error) {
      toast.error('Failed to verify vendor')
    }
  }

  if (loading) {
    return <div className="text-white">Loading vendors...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">Vendor Management</h1>

      <div className="flex gap-4 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {vendors.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <p className="text-gray-300 text-xl">No vendors found</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Card key={vendor.id} variant="glass" className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{vendor.businessName}</h3>
                  <p className="text-gray-400 text-sm">{vendor.email}</p>
                </div>
                {vendor.verified && (
                  <Shield className="text-primary" size={20} />
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-gray-400 text-xs">Registration Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    vendor.registrationStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                    vendor.registrationStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {vendor.registrationStatus}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Location</p>
                  <p className="text-white text-sm">{vendor.businessAddress}</p>
                </div>
                {vendor.registrationNumber && (
                  <div>
                    <p className="text-gray-400 text-xs">Registration Number</p>
                    <p className="text-white text-sm">{vendor.registrationNumber}</p>
                  </div>
                )}
              </div>

              {vendor.registrationStatus === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => updateVendorStatus(vendor.id, 'approved')}
                  >
                    <Check className="mr-2" size={16} />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => updateVendorStatus(vendor.id, 'rejected')}
                  >
                    <X className="mr-2" size={16} />
                    Reject
                  </Button>
                </div>
              )}

              {vendor.registrationStatus === 'approved' && !vendor.verified && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => verifyVendor(vendor.id)}
                >
                  <Shield className="mr-2" size={16} />
                  Verify Vendor
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

