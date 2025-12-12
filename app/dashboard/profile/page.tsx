'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserData } from '@/lib/firebase/auth'
import { updateProfile } from 'firebase/auth'
import { auth, storage } from '@/lib/firebase/config'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { User, Camera, Save, Building2, MapPin, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function ProfilePage() {
  const { user, userData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    photoURL: '',
    // Vendor specific fields
    businessName: '',
    businessAddress: '',
    registrationNumber: '',
    // Payout account
    bankName: '',
    accountNumber: '',
    accountName: '',
  })

  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        photoURL: userData.photoURL || '',
        businessName: (userData as any).businessName || '',
        businessAddress: (userData as any).businessAddress || '',
        registrationNumber: (userData as any).registrationNumber || '',
        bankName: (userData as any).payoutAccount?.bankName || '',
        accountNumber: (userData as any).payoutAccount?.accountNumber || '',
        accountName: (userData as any).payoutAccount?.accountName || '',
      })
    }
  }, [userData])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage || !user) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const imageRef = ref(storage, `profiles/${user.uid}/${Date.now()}_${file.name}`)
      await uploadBytes(imageRef, file)
      const downloadURL = await getDownloadURL(imageRef)
      
      setFormData({ ...formData, photoURL: downloadURL })
      
      // Update Firebase Auth profile
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadURL })
      }
      
      toast.success('Profile picture updated!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !userData) return

    setLoading(true)
    try {
      const updateData: any = {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        photoURL: formData.photoURL,
      }

      // Update Firebase Auth display name
      if (auth?.currentUser && formData.displayName !== userData.displayName) {
        await updateProfile(auth.currentUser, { displayName: formData.displayName })
      }

      // Vendor specific fields
      if (userData.role === 'vendor') {
        updateData.businessName = formData.businessName
        updateData.businessAddress = formData.businessAddress
        if (formData.registrationNumber) {
          updateData.registrationNumber = formData.registrationNumber
        }
        
        // Payout account
        if (formData.bankName && formData.accountNumber && formData.accountName) {
          updateData.payoutAccount = {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            accountName: formData.accountName,
          }
        }
      }

      await updateUserData(user.uid, updateData)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!userData) {
    return <div className="text-gray-700">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold text-gray-900 mb-8">Profile Settings</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card variant="default" className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User size={24} />
              Basic Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  {formData.photoURL ? (
                    <Image
                      src={formData.photoURL}
                      alt="Profile"
                      width={100}
                      height={100}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={40} className="text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark transition-colors">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-gray-900 font-medium">{formData.displayName}</p>
                  <p className="text-gray-500 text-sm">{formData.email}</p>
                  {uploading && <p className="text-primary text-sm mt-1">Uploading...</p>}
                </div>
              </div>

              <Input
                label="Full Name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+234 800 000 0000"
              />

              {userData.role === 'vendor' && (
                <>
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 size={20} />
                      Business Information
                    </h3>
                    <Input
                      label="Business Name"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                    />
                    <Input
                      label="Business Address"
                      value={formData.businessAddress}
                      onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                      required
                    />
                    <Input
                      label="Registration Number (Optional)"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin size={20} />
                      Payout Account
                    </h3>
                    <Input
                      label="Bank Name"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g., Access Bank, GTBank"
                    />
                    <Input
                      label="Account Number"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="10-digit account number"
                    />
                    <Input
                      label="Account Name"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      placeholder="Account holder name"
                    />
                  </div>
                </>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                <Save className="mr-2" size={20} />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Account Info Sidebar */}
        <div className="space-y-6">
          <Card variant="default" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-sm">Role</p>
                <p className="text-gray-900 font-medium capitalize">{userData.role}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Member Since</p>
                <p className="text-gray-900 font-medium">
                  {userData.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
                </p>
              </div>
              {userData.role === 'vendor' && (
                <>
                  <div>
                    <p className="text-gray-500 text-sm">Registration Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${
                      (userData as any).registrationStatus === 'approved' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : (userData as any).registrationStatus === 'rejected'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {(userData as any).registrationStatus || 'pending'}
                    </span>
                  </div>
                  {(userData as any).verified && (
                    <div>
                      <p className="text-gray-500 text-sm">Verification</p>
                      <p className="text-green-600 font-medium">✓ Verified</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

