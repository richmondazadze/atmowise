import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ModalActionsProps {
  primaryAction: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'default' | 'destructive';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'outline' | 'ghost';
  };
  className?: string;
}

export function ModalActions({ 
  primaryAction, 
  secondaryAction, 
  className 
}: ModalActionsProps) {
  return (
    <div className={cn("pt-4 border-t border-gray-200", className)}>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
        {secondaryAction && (
          <Button
            variant={secondaryAction.variant || 'outline'}
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
            className="w-full sm:w-auto px-6 py-3 touch-target text-sm sm:text-base rounded-2xl order-2 sm:order-1"
          >
            {secondaryAction.label}
          </Button>
        )}
        <Button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          variant={primaryAction.variant === 'destructive' ? 'destructive' : 'default'}
          className={cn(
            "w-full sm:w-auto px-6 py-3 font-semibold touch-target text-sm sm:text-base rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2",
            primaryAction.variant === 'destructive' 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-gradient-to-r from-[#71E07E] to-[#10B981] text-[#0A1C40]"
          )}
        >
          {primaryAction.loading ? 'Loading...' : primaryAction.label}
        </Button>
      </div>
    </div>
  );
}
