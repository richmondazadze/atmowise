'use client'

import { Home, TrendingUp, User, LifeBuoy } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DesktopSidebar } from "./DesktopSidebar";

interface NavigationProps {
  onCrisis?: () => void;
  showCrisisButton?: boolean;
}

export function Navigation({ onCrisis, showCrisisButton = true }: NavigationProps) {
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
        <DesktopSidebar onCrisis={onCrisis} />
      </div>

      {/* Crisis Button - Mobile Only */}
      {showCrisisButton && onCrisis && (
        <div className="lg:hidden fixed bottom-20 right-4 z-50">
          <button
            onClick={onCrisis}
            className="w-12 h-12 bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 min-h-[44px] min-w-[44px]"
            aria-label="Emergency Help"
            data-testid="button-crisis"
          >
            <LifeBuoy className="h-5 w-5 text-white" />
          </button>
        </div>
      )}

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] z-40 shadow-lg safe-area-bottom" data-testid="nav-bottom">
              <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        "flex flex-col items-center py-2 px-3 transition-all duration-200 ease-out rounded-lg min-h-[44px] min-w-[44px] justify-center focus:outline-none focus:ring-2 focus:ring-[#6200D9] focus:ring-offset-2",
                        isActive
                          ? "text-[#6200D9] bg-[#6200D9]/10"
                          : "text-[#64748B] hover:text-[#0A1C40] hover:bg-gray-100"
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
