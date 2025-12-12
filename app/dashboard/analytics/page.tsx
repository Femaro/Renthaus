'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Order, Product } from '@/lib/firebase/types'
import Card from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar, Download } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { exportToCSV, formatOrdersForExport } from '@/lib/export-utils'
import toast from 'react-hot-toast'

export default function AnalyticsPage() {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    topProducts: [] as Array<{ id: string; title: string; revenue: number; orders: number }>,
    recentOrders: [] as Order[],
    monthlyRevenue: [] as Array<{ month: string; revenue: number }>,
  })

  useEffect(() => {
    if (userData) {
      loadAnalytics()
    }
  }, [userData])

  const loadAnalytics = async () => {
    if (!userData || !db) return

    try {
      if (userData.role === 'vendor') {
        // Vendor analytics
        const ordersQuery = query(
          collection(db, 'orders'),
          where('vendorId', '==', userData.uid),
          orderBy('createdAt', 'desc')
        )
        const ordersSnapshot = await getDocs(ordersQuery)
        const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))

        const completedOrders = orders.filter((o) => o.status === 'completed' && o.paymentStatus === 'paid')
        const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount - o.commission), 0)
        const totalOrders = orders.length
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        // Calculate growth (comparing last 30 days to previous 30 days)
        const now = new Date()
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

        const recentOrders = completedOrders.filter((o) => {
          const orderDate = o.createdAt.toDate()
          return orderDate >= last30Days
        })

        const previousOrders = completedOrders.filter((o) => {
          const orderDate = o.createdAt.toDate()
          return orderDate >= last60Days && orderDate < last30Days
        })

        const recentRevenue = recentOrders.reduce((sum, o) => sum + (o.totalAmount - o.commission), 0)
        const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmount - o.commission), 0)
        const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0

        // Top products
        const productRevenue: Record<string, { title: string; revenue: number; orders: number }> = {}
        completedOrders.forEach((order) => {
          if (!productRevenue[order.productId]) {
            productRevenue[order.productId] = {
              title: order.productTitle,
              revenue: 0,
              orders: 0,
            }
          }
          productRevenue[order.productId].revenue += order.totalAmount - order.commission
          productRevenue[order.productId].orders += 1
        })

        const topProducts = Object.entries(productRevenue)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        // Monthly revenue
        const monthlyRevenueMap: Record<string, number> = {}
        completedOrders.forEach((order) => {
          const month = order.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          if (!monthlyRevenueMap[month]) {
            monthlyRevenueMap[month] = 0
          }
          monthlyRevenueMap[month] += order.totalAmount - order.commission
        })

        const monthlyRevenue = Object.entries(monthlyRevenueMap)
          .map(([month, revenue]) => ({ month, revenue }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
          .slice(-6)

        setAnalytics({
          totalRevenue,
          totalOrders,
          averageOrderValue,
          revenueGrowth,
          ordersGrowth: 0,
          topProducts,
          recentOrders: orders.slice(0, 10),
          monthlyRevenue,
        })
      } else if (userData.role === 'admin') {
        // Admin analytics
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        const ordersSnapshot = await getDocs(ordersQuery)
        const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order))

        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
        const totalCommission = orders.reduce((sum, o) => sum + o.commission, 0)
        const totalOrders = orders.length

        setAnalytics({
          totalRevenue,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          revenueGrowth: 0,
          ordersGrowth: 0,
          topProducts: [],
          recentOrders: orders.slice(0, 10),
          monthlyRevenue: [],
        })
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-gray-700">Loading analytics...</div>
  }

  if (userData?.role !== 'vendor' && userData?.role !== 'admin') {
    return (
      <div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-8">Analytics</h1>
        <Card variant="default" className="text-center py-12">
          <p className="text-gray-600">Analytics are only available for equipment owners and administrators.</p>
        </Card>
      </div>
    )
  }

  const handleExport = () => {
    try {
      if (analytics.recentOrders.length === 0) {
        toast.error('No data to export')
        return
      }
      
      const exportData = formatOrdersForExport(analytics.recentOrders)
      exportToCSV(exportData, `analytics-export-${new Date().toISOString().split('T')[0]}`)
      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Analytics Dashboard</h1>
        {analytics.recentOrders.length > 0 && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2" size={18} />
            Export Data
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Total Revenue</h3>
            <DollarSign className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
          {analytics.revenueGrowth !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${analytics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.revenueGrowth > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(analytics.revenueGrowth).toFixed(1)}%</span>
            </div>
          )}
        </Card>

        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Total Orders</h3>
            <Package className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{analytics.totalOrders}</p>
        </Card>

        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Avg Order Value</h3>
            <TrendingUp className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{formatCurrency(analytics.averageOrderValue)}</p>
        </Card>

        <Card variant="default" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 font-medium">Active Listings</h3>
            <Package className="text-primary" size={24} />
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {userData.role === 'vendor' ? '—' : analytics.topProducts.length}
          </p>
        </Card>
      </div>

      {/* Top Products */}
      {userData.role === 'vendor' && analytics.topProducts.length > 0 && (
        <Card variant="default" className="p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Top Performing Equipment</h2>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{product.title}</p>
                    <p className="text-sm text-gray-500">{product.orders} order{product.orders !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Orders */}
      <Card variant="default" className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Orders</h2>
        {analytics.recentOrders.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900">{order.productTitle}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(order.createdAt.toDate())}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'completed' ? 'bg-green-50 text-green-700' :
                      order.status === 'in-progress' ? 'bg-blue-50 text-blue-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

