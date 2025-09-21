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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
// Logo import removed - using /atmowise.webp directly

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
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <Link
            href={item.path}
            className={cn(
              "relative flex items-center rounded-xl font-medium transition-all duration-300 ease-out group overflow-hidden",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#71E07E] focus-visible:ring-offset-2",
              "px-4 py-4",
              isActive
                ? "bg-gradient-to-r from-[#71E07E] to-[#10B981] text-[#0A1C40] shadow-lg"
                : "text-[#64748B] hover:bg-gray-50 hover:text-[#0A1C40]"
            )}
          >
            {/* Active indicator with smooth slide animation */}
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.div
                  key="active-indicator"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  exit={{ scaleX: 0, opacity: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                />
              )}
            </AnimatePresence>

            <div
              className={cn(
                "flex items-center justify-center transition-all duration-200",
                "w-5 h-5 flex-shrink-0"
              )}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  rotate: isActive ? [0, -5, 5, 0] : 0,
                  y: isActive ? -1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
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
              </motion.div>
            </div>

            <div
              className={cn(
                "transition-all duration-200 ease-in-out overflow-hidden",
                "w-auto opacity-100 ml-4 flex-1"
              )}
            >
              <motion.div
                className="font-semibold text-sm leading-tight truncate"
                animate={{
                  fontWeight: isActive ? 600 : 500,
                  y: isActive ? -1 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.div>
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

            {/* Hover arrow with smooth animation */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-auto relative z-10"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>

            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 bg-[#71E07E]/10 rounded-xl"
              initial={{ scale: 0, opacity: 0 }}
              whileTap={{
                scale: 1.2,
                opacity: [0, 0.3, 0],
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Glow effect for active state */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 rounded-xl shadow-lg shadow-[#71E07E]/20"
                />
              )}
            </AnimatePresence>
          </Link>
        </motion.div>
      );
    },
    []
  );

  if (!isMounted) {
    return null;
  }

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-sm border-r border-gray-200/80 shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col w-64",
        className
      )}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative p-7 border-b border-gray-200/50 flex-shrink-0"
      >
        <div className="flex items-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
          >
            <img src="/atmowise.webp" alt="AtmoWise" />
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="ml-3"
          >
            <h1 className="text-lg font-bold text-[#0A1C40] whitespace-nowrap">
              AtmoWise
            </h1>
            <p className="text-xs text-[#64748B] -mt-0.5 whitespace-nowrap">
              Air Quality Tracker
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex-1 overflow-y-auto py-4"
      >
        {/* Main Navigation */}
        <nav className="space-y-2 px-4">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.4 + index * 0.1,
              }}
            >
              <NavItemComponent
                item={item}
                isActive={
                  pathname === item.path || pathname.startsWith(item.path + "/")
                }
              />
            </motion.div>
          ))}
        </nav>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="border-t border-gray-200/50 flex-shrink-0 p-4"
      >
        <div className="flex items-center space-x-3 mb-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Avatar className="h-8 w-8 ring-1 ring-gray-200">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                  user?.email || "User"
                }`}
                alt="User Avatar"
              />
              <AvatarFallback className="bg-gradient-to-br from-[#71E07E] to-[#10B981] text-[#0A1C40] text-xs">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="flex-1 min-w-0"
          >
            <p className="text-sm font-medium text-[#0A1C40] truncate">
              {profile?.displayName || user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-[#64748B]">User Account</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full text-[#64748B] hover:text-[#0A1C40] hover:bg-gray-100 rounded-lg justify-start px-4 py-3 h-12 transition-all duration-200 group"
          >
            <motion.div
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <LogOut className="h-4 w-4 transition-colors" />
              <span className="ml-2 font-medium">Sign Out</span>
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </motion.aside>
  );
}
