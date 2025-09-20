import { Home, TrendingUp, User, LifeBuoy } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onCrisis: () => void;
}

export function BottomNav({ onCrisis }: BottomNavProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/timeline", icon: TrendingUp, label: "Timeline" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/resources", icon: LifeBuoy, label: "Resources" },
  ];

  return (
    <>
      {/* Crisis Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={onCrisis}
          className="w-14 h-14 bg-destructive hover:bg-destructive/90 rounded-full shadow-lg flex items-center justify-center pulse-animation"
          aria-label="Emergency Help"
          data-testid="button-crisis"
        >
          <LifeBuoy className="h-6 w-6 text-destructive-foreground" />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-40" data-testid="nav-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <a
                key={item.path}
                href={item.path}
                className={cn(
                  "flex flex-col items-center py-2 px-3 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
