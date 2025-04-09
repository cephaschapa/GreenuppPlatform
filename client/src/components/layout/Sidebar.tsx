import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  TractorIcon,
  CalendarDays,
  ClipboardList,
  Cloud,
  Sparkles,
  Settings,
  User,
  ChevronRight,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@shared/schema';

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const farmerNavItems = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: location === '/dashboard'
    },
    {
      title: 'Fields & Crops',
      href: '/dashboard/fields',
      icon: <TractorIcon className="h-5 w-5" />,
      active: location === '/dashboard/fields'
    },
    {
      title: 'Calendar',
      href: '/dashboard/calendar',
      icon: <CalendarDays className="h-5 w-5" />,
      active: location === '/dashboard/calendar'
    },
    {
      title: 'Tasks',
      href: '/dashboard/tasks',
      icon: <ClipboardList className="h-5 w-5" />,
      active: location === '/dashboard/tasks'
    },
    {
      title: 'Weather',
      href: '/dashboard/weather',
      icon: <Cloud className="h-5 w-5" />,
      active: location === '/dashboard/weather'
    },
    {
      title: 'Predictions',
      href: '/dashboard/predictions',
      icon: <Sparkles className="h-5 w-5" />,
      active: location === '/dashboard/predictions'
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: <User className="h-5 w-5" />,
      active: location === '/dashboard/profile'
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
      active: location === '/dashboard/settings'
    }
  ];
  
  const supplierNavItems = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: location === '/dashboard'
    },
    // Add supplier-specific navigation items here
  ];
  
  const buyerNavItems = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: location === '/dashboard'
    },
    // Add buyer-specific navigation items here
  ];
  
  // Select the appropriate navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case UserRole.FARMER:
        return farmerNavItems;
      case UserRole.SUPPLIER:
        return supplierNavItems;
      case UserRole.BUYER:
        return buyerNavItems;
      default:
        return [];
    }
  };
  
  const navItems = getNavItems();
  
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      
      {/* Sidebar for desktop */}
      <div className="hidden md:flex h-screen flex-col bg-black border-r border-primary/20 w-64 fixed top-0 left-0">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold font-space tracking-wider group flex items-center">
            Green<span className="text-primary group-hover:animate-pulse transition-all">upp</span>
          </Link>
        </div>
        
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md transition-colors",
                  item.active
                    ? "bg-primary/20 text-primary"
                    : "text-gray-400 hover:text-white hover:bg-primary/10"
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                <ChevronRight className={cn("h-4 w-4 opacity-0 transition-opacity", item.active && "opacity-100")} />
              </Link>
            ))}
          </nav>
        </ScrollArea>
        
        <div className="p-4 border-t border-primary/20">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {user?.firstName?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName || user?.username}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 text-gray-400 hover:text-white" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
          </Button>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-80" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="relative flex flex-col w-72 max-w-[80%] h-full bg-background z-50 border-r border-primary/20 overflow-hidden">
            <div className="p-6 border-b border-primary/20">
              <Link href="/" className="text-2xl font-bold font-space tracking-wider group" onClick={() => setIsMobileMenuOpen(false)}>
                Green<span className="text-primary group-hover:animate-pulse transition-all">upp</span>
              </Link>
            </div>
            
            <ScrollArea className="flex-1">
              <nav className="space-y-1 px-2 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md transition-colors",
                      item.active
                        ? "bg-primary/20 text-primary"
                        : "text-gray-400 hover:text-white hover:bg-primary/10"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 opacity-0 transition-opacity", item.active && "opacity-100")} />
                  </Link>
                ))}
              </nav>
            </ScrollArea>
            
            <div className="p-4 border-t border-primary/20">
              <div className="flex items-center gap-3 px-3 py-2 mb-4">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.firstName || user?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 text-gray-400 hover:text-white" 
                onClick={() => {
                  logoutMutation.mutate();
                  setIsMobileMenuOpen(false);
                }}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}