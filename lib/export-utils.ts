// Export utilities for reports and data

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx'
  filename?: string
}

export function exportToCSV(data: any[], filename: string = 'export') {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function exportToJSON(data: any[], filename: string = 'export') {
  if (!data || data.length === 0) {
    throw new Error('No data to export')
  }

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function formatDataForExport(data: any[], fields?: string[]) {
  if (!data || data.length === 0) return []
  
  return data.map(item => {
    if (fields) {
      // Export only specified fields
      const filtered: any = {}
      fields.forEach(field => {
        if (item[field] !== undefined) {
          filtered[field] = item[field]
        }
      })
      return filtered
    }
    return item
  })
}

// Format orders for export
export function formatOrdersForExport(orders: any[]) {
  return orders.map(order => ({
    'Order ID': order.id,
    'Product': order.productTitle,
    'Customer': order.customerName || 'N/A',
    'Start Date': order.startDate?.toDate?.()?.toLocaleDateString() || 'N/A',
    'End Date': order.endDate?.toDate?.()?.toLocaleDateString() || 'N/A',
    'Rental Fee': order.rentalFee || 0,
    'Security Deposit': order.securityDeposit || 0,
    'Total Amount': order.totalAmount || 0,
    'Commission': order.commission || 0,
    'Status': order.status || 'N/A',
    'Payment Status': order.paymentStatus || 'N/A',
    'Created At': order.createdAt?.toDate?.()?.toLocaleString() || 'N/A',
  }))
}

// Format products for export
export function formatProductsForExport(products: any[]) {
  return products.map(product => ({
    'Product ID': product.id,
    'Title': product.title,
    'Category': product.category || 'N/A',
    'Daily Price': product.dailyPrice || 0,
    'Weekly Price': product.weeklyPrice || 'N/A',
    'Security Deposit': product.securityDeposit || 0,
    'City': product.city || 'N/A',
    'State': product.state || 'N/A',
    'Available': product.available ? 'Yes' : 'No',
    'Created At': product.createdAt?.toDate?.()?.toLocaleString() || 'N/A',
  }))
}

