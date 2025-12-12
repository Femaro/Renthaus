'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { logout } from '@/lib/firebase/auth'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Home, Package, MessageSquare, Settings, LogOut, User } from 'lucide-react'
import Image from 'next/image'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-700 text-xl">Loading...</div>
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const navItems = {
    customer: [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/dashboard/bookings', label: 'My Bookings', icon: Package },
      { href: '/dashboard/rfq', label: 'Request Quote', icon: MessageSquare },
      { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
      { href: '/dashboard/profile', label: 'Profile', icon: User },
    ],
    vendor: [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/dashboard/listings', label: 'My Listings', icon: Package },
      { href: '/dashboard/inventory', label: 'Inventory', icon: Package },
      { href: '/dashboard/orders', label: 'Orders', icon: Package },
      { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
      { href: '/dashboard/payouts', label: 'Payouts', icon: Settings },
      { href: '/dashboard/profile', label: 'Profile', icon: User },
    ],
    admin: [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/dashboard/vendors', label: 'Vendors', icon: User },
      { href: '/dashboard/transactions', label: 'Transactions', icon: Settings },
      { href: '/dashboard/deposits', label: 'Security Deposits', icon: Settings },
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
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">{userData.displayName}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-6">
          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all text-gray-700 hover:text-gray-900"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}

