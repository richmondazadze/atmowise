'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  TrendingUp, 
  User, 
  LifeBuoy, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Wind,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DesktopSidebarProps {
  className?: string;
}

export function DesktopSidebar({ className }: DesktopSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        const response = await fetch(`/api/profile/${user.id}`);
        if (response.ok) {
          return response.json();
        }
        return null;
      } catch (error) {
        console.error("Profile fetch error:", error);
        return null;
      }
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Helper function to get display name
  const getDisplayName = () => {
    if (profile?.displayName) {
      return profile.displayName;
    }
    
    // Extract first name from email as fallback
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Convert to title case and remove numbers
      const firstName = emailName
        .replace(/[0-9]/g, '') // Remove numbers
        .replace(/([A-Z])/g, ' $1') // Add space before capitals
        .trim()
        .split(' ')[0] // Take first word
        .toLowerCase()
        .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
      
      return firstName || 'User';
    }
    
    return 'User';
  };

  const mainNavItems = [
    {
      path: "/",
      icon: Home,
      label: "Dashboard",
      description: "Overview & insights"
    },
    {
      path: "/timeline",
      icon: TrendingUp,
      label: "Timeline",
      description: "Air quality history"
    },
    {
      path: "/profile",
      icon: User,
      label: "Profile",
      description: "Account settings"
    },
    {
      path: "/resources",
      icon: LifeBuoy,
      label: "Resources",
      description: "Health & safety"
    }
  ];

  // Removed secondary navigation items

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-[#E2E8F0] shadow-xl transition-all duration-300 ease-out z-50 flex flex-col",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0] flex-shrink-0">
        <div className={cn(
          "flex items-center space-x-3 transition-all duration-300",
          isCollapsed ? "opacity-0 w-0" : "opacity-100"
        )}>
          <div className="w-10 h-10 bg-gradient-to-br from-[#6200D9] to-[#4C00A8] rounded-xl flex items-center justify-center shadow-lg">
            <Wind className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0A1C40]">AtmoWise</h1>
            <p className="text-xs text-[#64748B]">Air Quality Tracker</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 hover:bg-gray-100 text-[#64748B] hover:text-[#0A1C40]"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scroll-smooth overscroll-contain">
        {/* Main Navigation */}
        <nav className="p-4 space-y-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-[#6200D9] text-white shadow-lg" 
                    : "text-[#64748B] hover:bg-gray-100 hover:text-[#0A1C40]"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-[#64748B] group-hover:text-[#0A1C40]"
                )} />
                
                <div className={cn(
                  "ml-3 transition-all duration-300 overflow-hidden",
                  isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100"
                )}>
                  <div className="font-semibold">{item.label}</div>
                  <div className={cn(
                    "text-xs transition-colors",
                    isActive ? "text-white/70" : "text-[#64748B] group-hover:text-[#0A1C40]"
                  )}>
                    {item.description}
                  </div>
                </div>
                
                {isActive && !isCollapsed && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>


      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#E2E8F0] flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getDisplayName()}`} alt="User Avatar" />
              <AvatarFallback className="bg-[#6200D9] text-white font-semibold text-sm">
                {getDisplayName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0A1C40] truncate">
                {getDisplayName()}
              </p>
              <p className="text-xs text-[#64748B]">User</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className={cn(
            "w-full text-[#64748B] hover:text-[#0A1C40] hover:bg-gray-100 justify-start",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && (
            <span className="ml-2 text-sm font-medium">Sign Out</span>
          )}
        </Button>
      </div>
    </div>
  );
}