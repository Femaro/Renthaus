'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { logout } from '@/lib/firebase/auth'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Home, Package, MessageSquare, Settings, LogOut, User } from 'lucide-react'

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
      <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-black via-secondary to-black">
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              Rent<span className="text-primary">Haus</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">{userData.displayName}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 glass border-r border-white/10 min-h-screen p-6">
          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl glass hover:bg-white/10 transition-all"
                >
                  <Icon size={20} />
                  <span className="text-white">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

