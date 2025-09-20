'use client'

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background",
      "lg:pl-64", // Account for desktop sidebar width
      "pb-20 lg:pb-0", // Add bottom padding for mobile navigation
      className
    )}>
      <div className="lg:pt-0 pt-0"> {/* No extra padding needed with sticky headers */}
        {children}
      </div>
    </div>
  );
}
