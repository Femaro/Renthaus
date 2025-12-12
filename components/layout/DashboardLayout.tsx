'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { logout, createUserDocumentIfMissing } from '@/lib/firebase/auth'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Home, Package, MessageSquare, Settings, LogOut, User, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [fixingUserData, setFixingUserData] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleFixUserData = async () => {
    if (!user) return
    
    setFixingUserData(true)
    try {
      await createUserDocumentIfMissing(user)
      toast.success('User data created! Refreshing...')
      setTimeout(() => window.location.reload(), 1000)
    } catch (error: any) {
      console.error('Error creating user document:', error)
      toast.error(error.message || 'Failed to create user data. Check Firestore rules.')
    } finally {
      setFixingUserData(false)
    }
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-gray-600 text-lg mb-2">User data not found</p>
          <p className="text-gray-500 text-sm mb-4">
            The user document is missing in Firestore. This can happen if:
            <br />• Registration didn't complete fully
            <br />• Firestore permissions blocked the write
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              onClick={handleFixUserData} 
              disabled={fixingUserData}
            >
              {fixingUserData ? 'Creating...' : 'Create User Data'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/login')}>
              Go to Login
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const navItems = {
    customer: [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/dashboard/bookings', label: 'My Rentals', icon: Package },
      { href: '/dashboard/rfq', label: 'Request Quote', icon: MessageSquare },
      { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
      { href: '/dashboard/profile', label: 'Profile', icon: User },
    ],
    vendor: [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/dashboard/listings', label: 'My Equipment', icon: Package },
      { href: '/dashboard/inventory', label: 'Availability', icon: Package },
      { href: '/dashboard/orders', label: 'Rental Orders', icon: Package },
      { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
      { href: '/dashboard/payouts', label: 'Payouts', icon: Settings },
      { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
      { href: '/dashboard/profile', label: 'Profile', icon: User },
    ],
    admin: [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/dashboard/vendors', label: 'Equipment Owners', icon: User },
      { href: '/dashboard/transactions', label: 'Transactions', icon: Settings },
      { href: '/dashboard/deposits', label: 'Security Deposits', icon: Settings },
      { href: '/dashboard/admin/bulk-operations', label: 'Bulk Operations', icon: Settings },
      { href: '/dashboard/profile', label: 'Profile', icon: User },
    ],
  }

  const items = navItems[userData.role] || []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Renthaus Logo" 
                width={180} 
                height={60}
                className="h-16 w-auto"
                priority
              />
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-gray-700 font-medium text-sm md:text-base hidden sm:inline">{userData.displayName}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs md:text-sm">
                <LogOut size={16} className="md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row">
        <aside className="w-full md:w-64 bg-white border-r-0 md:border-r border-gray-100 md:min-h-screen p-4 md:p-6">
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl hover:bg-gray-50 transition-all text-gray-700 hover:text-gray-900 whitespace-nowrap text-sm md:text-base"
                >
                  <Icon size={18} className="md:w-5 md:h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}

