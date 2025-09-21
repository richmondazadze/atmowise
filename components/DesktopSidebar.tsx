"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DesktopSidebarProps {
  onCrisis?: () => void;
  className?: string;
}

interface NavItem {
  path: string;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
}

export function DesktopSidebar({ onCrisis, className }: DesktopSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const mainNavItems: NavItem[] = [
    {
      path: "/",
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

  const secondaryNavItems: NavItem[] = [
    {
      path: "/settings",
      icon: Settings,
      label: "Settings",
      description: "App preferences",
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
            isCollapsed ? "p-3 justify-center w-12 h-12" : "px-4 py-3",
            isActive
              ? "bg-gradient-to-r from-[#6200D9] to-[#4C00A8] text-white shadow-lg"
              : "text-[#64748B] hover:bg-gray-50 hover:text-[#0A1C40]"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center transition-all duration-200",
              isCollapsed ? "w-5 h-5" : "w-5 h-5 flex-shrink-0"
            )}
          >
            <Icon
              className={cn(
                "transition-colors duration-200",
                isCollapsed ? "w-5 h-5" : "w-5 h-5",
                isActive
                  ? "text-white"
                  : "text-current group-hover:text-[#0A1C40]"
              )}
            />
          </div>

          <div
            className={cn(
              "transition-all duration-200 ease-in-out overflow-hidden",
              isCollapsed
                ? "w-0 opacity-0 ml-0"
                : "w-auto opacity-100 ml-3 flex-1"
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

          {isActive && !isCollapsed && (
            <div className="ml-2 flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          )}

          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1.5 bg-[#0A1C40] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
              {item.label}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-[#0A1C40] rotate-45" />
            </div>
          )}
        </Link>
      );
    },
    [isCollapsed]
  );

  if (!isMounted) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-sm border-r border-gray-200/80 shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="relative p-4 border-b border-gray-200/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-8 h-8 bg-gradient-to-br from-[#6200D9] to-[#4C00A8] rounded-lg flex items-center justify-center shadow-md flex-shrink-0 cursor-pointer"
            >
              <Wind className="h-4 w-4 text-white" />
            </div>
            <div
              className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                isCollapsed ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-3"
              )}
            >
              <h1 className="text-lg font-bold text-[#0A1C40] whitespace-nowrap">
                AtmoWise
              </h1>
              <p className="text-xs text-[#64748B] -mt-0.5 whitespace-nowrap">
                Air Quality Tracker
              </p>
            </div>
          </div>

          {/* Collapse Toggle Button - Only show when not collapsed */}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-7 w-7 p-0 text-gray-500 hover:text-[#0A1C40] hover:bg-gray-100 rounded-md flex-shrink-0"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Main Navigation */}
        <nav className={cn("space-y-2", isCollapsed ? "px-2" : "px-4")}>
          {!isCollapsed && (
            <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider px-2 mb-2">
              Navigation
            </h2>
          )}
          {mainNavItems.map((item) => (
            <NavItemComponent
              key={item.path}
              item={item}
              isActive={
                item.path === "/"
                  ? pathname === "/"
                  : pathname === item.path ||
                    pathname.startsWith(item.path + "/")
              }
            />
          ))}
        </nav>

        <div
          className={cn(
            "my-4 border-t border-gray-200/60",
            isCollapsed ? "mx-2" : "mx-4"
          )}
        />
      </div>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-gray-200/50 flex-shrink-0",
          isCollapsed ? "p-3" : "p-4"
        )}
      >
        {!isCollapsed && (
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
                {user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-[#64748B]">User Account</p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className={cn(
            "w-full text-[#64748B] hover:text-[#0A1C40] hover:bg-gray-100 rounded-lg",
            isCollapsed
              ? "justify-center p-2 h-12 w-12"
              : "justify-start px-3 py-2 h-10"
          )}
        >
          <LogOut
            className={cn(
              "transition-colors",
              isCollapsed ? "h-5 w-5" : "h-4 w-4"
            )}
          />
          {!isCollapsed && <span className="ml-2 font-medium">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
