// Error tracking utility
// In production, integrate with Sentry, LogRocket, or similar service

interface ErrorContext {
  userId?: string
  userRole?: string
  page?: string
  action?: string
  metadata?: Record<string, any>
}

class ErrorTracker {
  private isDevelopment = process.env.NODE_ENV === 'development'

  logError(error: Error, context?: ErrorContext) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    }

    if (this.isDevelopment) {
      console.error('Error logged:', errorData)
    } else {
      // In production, send to error tracking service
      // Example: Sentry.captureException(error, { extra: context })
      this.sendToTrackingService(errorData)
    }
  }

  logWarning(message: string, context?: ErrorContext) {
    const warningData = {
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    if (this.isDevelopment) {
      console.warn('Warning:', warningData)
    } else {
      // In production, send to tracking service
      this.sendToTrackingService(warningData)
    }
  }

  private sendToTrackingService(data: any) {
    // TODO: Integrate with actual error tracking service
    // Example implementations:
    
    // Sentry:
    // Sentry.captureException(new Error(data.message), { extra: data })
    
    // LogRocket:
    // LogRocket.captureException(new Error(data.message))
    
    // Custom API:
    // fetch('/api/errors', { method: 'POST', body: JSON.stringify(data) })
    
    // For now, store in Firestore for tracking
    if (typeof window === 'undefined') {
      // Server-side: could use Firebase Admin
      return
    }
    
    // Client-side: could store in Firestore or send to API
    console.error('Error tracking (production):', data)
  }
}

export const errorTracker = new ErrorTracker()

// React Error Boundary helper
export function captureError(error: Error, errorInfo?: React.ErrorInfo) {
  errorTracker.logError(error, {
    page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    metadata: {
      componentStack: errorInfo?.componentStack,
    },
  })
}

