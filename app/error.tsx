'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center max-w-lg mx-auto p-8">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Something went wrong!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">We encountered an unexpected error</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {error.message || 'An unknown error occurred'}
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={reset}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-xl"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
