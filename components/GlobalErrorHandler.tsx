'use client'

import { useEffect } from 'react';

export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if this is a navigation-related error that we can safely ignore
      if (event.reason instanceof Event && event.reason.type === 'error') {
        const target = event.reason.target as HTMLElement;
        if (target && (target.tagName === 'A' || target.tagName === 'LINK')) {
          const href = (target as HTMLAnchorElement)?.href || '';
          
          // Filter out common Next.js development errors that are safe to ignore
          if (href.includes('/_next/static/') || 
              href.includes('localhost:3000/_next/') ||
              href.includes('.css') ||
              href.includes('.js') ||
              href.includes('chunk') ||
              href.includes('webpack')) {
            // Silently ignore these common Next.js development errors
            event.preventDefault();
            return;
          }
          
          // Log other navigation-related errors as warnings
          console.warn('Navigation-related promise rejection (ignored):', {
            type: event.reason.type,
            target: target.tagName,
            href: href
          });
          event.preventDefault();
          return;
        }
      }
      
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent the default browser behavior
      event.preventDefault();
      
      // Log the error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Promise rejection details:', {
          reason: event.reason,
          reasonType: typeof event.reason,
          reasonConstructor: event.reason?.constructor?.name,
          isEvent: event.reason instanceof Event,
          eventType: event.reason instanceof Event ? event.reason.type : 'N/A',
          eventTarget: event.reason instanceof Event ? event.reason.target : 'N/A',
          promise: event.promise,
        });
        
        // If it's an Event object, log more details
        if (event.reason instanceof Event) {
          console.error('Event details:', {
            type: event.reason.type,
            target: event.reason.target,
            currentTarget: event.reason.currentTarget,
            bubbles: event.reason.bubbles,
            cancelable: event.reason.cancelable,
            defaultPrevented: event.reason.defaultPrevented,
            eventPhase: event.reason.eventPhase,
            isTrusted: event.reason.isTrusted,
            timeStamp: event.reason.timeStamp,
          });
        }
      }
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      // Check if this is a navigation-related error that we can safely ignore
      if (event.target && (event.target as HTMLElement).tagName === 'A') {
        const href = (event.target as HTMLAnchorElement)?.href || '';
        
        // Filter out common Next.js development errors that are safe to ignore
        if (href.includes('/_next/static/') || 
            href.includes('localhost:3000/_next/') ||
            href.includes('.css') ||
            href.includes('.js') ||
            href.includes('chunk') ||
            href.includes('webpack')) {
          // Silently ignore these common Next.js development errors
          event.preventDefault();
          return;
        }
        
        // Log other navigation-related errors as warnings
        console.warn('Navigation-related error (ignored):', {
          message: event.message,
          target: (event.target as HTMLElement).tagName,
          href: href
        });
        event.preventDefault();
        return;
      }
      
      console.error('Uncaught error:', event.error);
      
      // Prevent the default browser behavior
      event.preventDefault();
      
      // Log the error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        });
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null; // This component doesn't render anything
}
