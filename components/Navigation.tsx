'use client'

import { Home, TrendingUp, User, LifeBuoy } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DesktopSidebar } from "./DesktopSidebar";

interface NavigationProps {}

export function Navigation({}: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
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
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-t border-gray-100/50 dark:border-gray-700/50 z-[60] shadow-lg safe-area-bottom" data-testid="nav-bottom" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, transform: 'translateZ(0)', willChange: 'transform' }}>
              <div className="flex items-center justify-around px-4 py-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        "flex flex-col items-center py-2 px-4 transition-all duration-200 ease-out rounded-xl min-h-[48px] min-w-[48px] justify-center focus:outline-none focus:ring-2 focus:ring-[#6200D9] focus:ring-offset-2",
                        isActive
                          ? "text-[#6200D9] dark:text-purple-400 bg-[#6200D9]/10 dark:bg-purple-400/10 shadow-sm"
                          : "text-[#64748B] dark:text-gray-400 hover:text-[#0A1C40] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                      aria-label={`Navigate to ${item.label}`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
    </>
  );
}
