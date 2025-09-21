"use client";

import { Home, TrendingUp, User, LifeBuoy } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DesktopSidebar } from "./DesktopSidebar";

interface NavigationProps {}

export function Navigation({}: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/timeline", icon: TrendingUp, label: "Timeline" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/resources", icon: LifeBuoy, label: "Resources" },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2 
        }}
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-t border-gray-100/50 dark:border-gray-700/50 z-[60] shadow-lg safe-area-bottom"
        data-testid="nav-bottom"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item, index) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.path}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.3 + (index * 0.1)
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  href={item.path}
                  className={cn(
                    "flex flex-col items-center py-2 px-4 transition-all duration-300 ease-out rounded-xl min-h-[48px] min-w-[48px] justify-center focus:outline-none focus:ring-2 focus:ring-[#6200D9] focus:ring-offset-2 relative overflow-hidden group",
                    isActive
                      ? "text-[#6200D9] dark:text-purple-400 bg-[#6200D9]/10 dark:bg-purple-400/10 shadow-sm"
                      : "text-[#64748B] dark:text-gray-400 hover:text-[#0A1C40] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {/* Active indicator background with smooth transition */}
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        key="active-bg"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ 
                          duration: 0.4, 
                          ease: [0.25, 0.46, 0.45, 0.94] 
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-[#6200D9]/10 to-[#4C00A8]/10 rounded-xl"
                      />
                    )}
                  </AnimatePresence>
                  
                  {/* Icon with smooth transition and bounce effect */}
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      rotate: isActive ? [0, -5, 5, 0] : 0,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ 
                      duration: 0.3, 
                      ease: [0.25, 0.46, 0.45, 0.94] 
                    }}
                    className="relative z-10"
                  >
                    <Icon className="h-5 w-5 mb-1" />
                  </motion.div>
                  
                  {/* Label with smooth transition */}
                  <motion.span 
                    className="text-xs font-medium relative z-10"
                    animate={{ 
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#6200D9" : undefined,
                      y: isActive ? -1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                  
                  {/* Ripple effect on tap */}
                  <motion.div
                    className="absolute inset-0 bg-[#6200D9]/20 rounded-xl"
                    initial={{ scale: 0, opacity: 0 }}
                    whileTap={{ 
                      scale: 1.2, 
                      opacity: [0, 0.3, 0] 
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
                        className="absolute inset-0 rounded-xl shadow-lg shadow-[#6200D9]/20"
                      />
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}