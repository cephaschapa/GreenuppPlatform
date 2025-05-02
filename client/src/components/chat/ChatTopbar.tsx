import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Search, X, Bell, MessageSquare, User, MoreVertical, Home, Package, Users, Map, Cloud, Leaf, Sprout, Calendar, Settings, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import { useSocketIOChat } from '@/hooks/use-socketio-chat';
import { useSocketIO } from '@/hooks/use-socketio';
import { cn } from '@/lib/utils';

// Define the navigation menu items with icons
const MENU_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Fields', href: '/dashboard/fields', icon: Map },
  { name: 'Crops', href: '/dashboard/crops', icon: Sprout },
  { name: 'Tasks', href: '/dashboard/tasks', icon: Calendar },
  { name: 'Weather', href: '/dashboard/weather', icon: Cloud },
  { name: 'Plant Diagnosis', href: '/dashboard/plant-diagnosis', icon: Leaf },
  { name: 'Marketplace', href: '/dashboard/marketplace', icon: Package },
  { name: 'Social', href: '/dashboard/social', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function ChatTopbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { socket, status: socketStatus } = useSocketIO();
  const { totalUnreadCount } = useSocketIOChat();
  const { unreadCount: notificationCount } = useNotifications();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if we're in a mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Function to clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b flex items-center justify-between p-3 md:p-4">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile sidebar trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Greenupp</h2>
              </div>
              <nav className="flex-1 overflow-y-auto">
                <ul className="p-2">
                  {MENU_ITEMS.map((item) => {
                    const isActive = location === item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link href={item.href}>
                          <a className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                            isActive 
                              ? "bg-primary text-primary-foreground font-medium" 
                              : "hover:bg-muted"
                          )}>
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="p-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="w-full"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Back button for mobile */}
        {isMobile && (
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
        )}

        {/* Page title */}
        <h1 className="text-lg font-semibold">Chat</h1>
        
        {/* Socket connection status indicator */}
        <div className="hidden md:flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            socketStatus === 'connected' ? "bg-green-500" : 
            socketStatus === 'connecting' ? "bg-amber-500" : 
            "bg-red-500"
          )} />
          <span className="text-xs text-muted-foreground">
            {socketStatus === 'connected' ? 'Connected' : 
             socketStatus === 'connecting' ? 'Connecting...' : 
             'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search bar (hidden on mobile) */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="pl-8 md:w-[200px] lg:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Chat button with unread count */}
        <Link href="/dashboard/chat">
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            {totalUnreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1"
              >
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </Badge>
            )}
          </Button>
        </Link>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[320px] p-0">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-medium">Notifications</h3>
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {/* Notification items would go here */}
              <div className="p-4 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar-placeholder.png" />
                <AvatarFallback>
                  {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <div className="flex items-center gap-2 w-full">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <div className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More options (mobile) */}
        {isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                // Mobile search
              }}>
                <Search className="mr-2 h-4 w-4" />
                <span>Search</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <div className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}