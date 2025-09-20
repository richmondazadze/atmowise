'use client'

import { useEffect } from 'react';

export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
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
