"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  TrendingUp,
  User,
  LifeBuoy,
  LogOut,
  Wind,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DesktopSidebarProps {
  className?: string;
}

interface NavItem {
  path: string;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
}

export function DesktopSidebar({ className }: DesktopSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const response = await fetch(`/api/profile/${user.id}`);
        if (response.ok) {
          return response.json();
        }
        return null;
      } catch (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems: NavItem[] = [
    {
      path: "/dashboard",
      icon: Home,
      label: "Dashboard",
      description: "Overview & insights",
    },
    {
      path: "/timeline",
      icon: TrendingUp,
      label: "Timeline",
      description: "Air quality history",
    },
    {
      path: "/profile",
      icon: User,
      label: "Profile",
      description: "Account settings",
    },
    {
      path: "/resources",
      icon: LifeBuoy,
      label: "Resources",
      description: "Health & safety",
    },
  ];

  const NavItemComponent = React.useCallback(
    ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
      const Icon = item.icon;

      return (
        <Link
          href={item.path}
          className={cn(
            "relative flex items-center rounded-xl font-medium transition-all duration-200 ease-in-out group overflow-hidden",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6200D9] focus-visible:ring-offset-2",
            "px-4 py-4",
            isActive
              ? "bg-gradient-to-r from-[#6200D9] to-[#4C00A8] text-white shadow-lg"
              : "text-[#64748B] hover:bg-gray-50 hover:text-[#0A1C40]"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center transition-all duration-200",
              "w-5 h-5 flex-shrink-0"
            )}
          >
            <Icon
              className={cn(
                "transition-colors duration-200",
                "w-5 h-5",
                isActive
                  ? "text-white"
                  : "text-current group-hover:text-[#0A1C40]"
              )}
            />
          </div>

          <div
            className={cn(
              "transition-all duration-200 ease-in-out overflow-hidden",
              "w-auto opacity-100 ml-4 flex-1"
            )}
          >
            <div className="font-semibold text-sm leading-tight truncate">
              {item.label}
            </div>
            <div
              className={cn(
                "text-xs leading-tight mt-0.5 transition-colors duration-200 truncate",
                isActive
                  ? "text-white/80"
                  : "text-[#64748B] group-hover:text-[#0A1C40]/80"
              )}
            >
              {item.description}
            </div>
          </div>


        </Link>
      );
    },
    []
  );

  if (!isMounted) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-sm border-r border-gray-200/80 shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col w-64",
        className
      )}
    >
      {/* Header */}
      <div className="relative p-7 border-b border-gray-200/50 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6200D9] to-[#4C00A8] rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <Wind className="h-4 w-4 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-[#0A1C40] whitespace-nowrap">
              AtmoWise
            </h1>
            <p className="text-xs text-[#64748B] -mt-0.5 whitespace-nowrap">
              Air Quality Tracker
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Main Navigation */}
        <nav className="space-y-2 px-4">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.path}
              item={item}
              isActive={
                pathname === item.path || pathname.startsWith(item.path + "/")
              }
            />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200/50 flex-shrink-0 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-8 w-8 ring-1 ring-gray-200">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                user?.email || "User"
              }`}
              alt="User Avatar"
            />
            <AvatarFallback className="bg-gradient-to-br from-[#6200D9] to-[#4C00A8] text-white text-xs">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0A1C40] truncate">
              {profile?.displayName || user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-[#64748B]">User Account</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full text-[#64748B] hover:text-[#0A1C40] hover:bg-gray-100 rounded-lg justify-start px-4 py-3 h-12"
        >
          <LogOut className="h-4 w-4 transition-colors" />
          <span className="ml-2 font-medium">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
