import { useState } from 'react';
import { Link } from 'wouter';
import { Sun, Moon, Menu, X, LogIn, ShoppingCart, Leaf, Search } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const PublicNavbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="hidden font-space font-bold text-xl sm:inline-block">Greenupp</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">
            Marketplace
          </Link>
          <Link href="/marketplace/sellers" className="text-sm font-medium hover:text-primary transition-colors">
            Sellers
          </Link>
          <Link href="/ai-knowledge-base" className="text-sm font-medium hover:text-primary transition-colors">
            AI Knowledge Base
          </Link>
          <Link href="/trace" className="text-sm font-medium hover:text-primary transition-colors">
            Verify Products
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Link href="/auth">
            <Button className="hidden sm:flex gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>

          {/* Mobile Menu Trigger */}
          <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden"
                size="icon"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 py-4">
                <Link 
                  href="/"
                  className="flex items-center gap-2 px-2"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Leaf className="h-6 w-6 text-primary" />
                  <span className="font-space font-bold text-xl">Greenupp</span>
                </Link>
                <div className="flex flex-col space-y-3 mt-4">
                  <Link 
                    href="/"
                    className="flex py-2 px-2 rounded-md hover:bg-primary/10"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/marketplace"
                    className="flex py-2 px-2 rounded-md hover:bg-primary/10"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Marketplace
                  </Link>
                  <Link 
                    href="/marketplace/sellers"
                    className="flex py-2 px-2 rounded-md hover:bg-primary/10"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sellers
                  </Link>
                  <Link 
                    href="/ai-knowledge-base"
                    className="flex py-2 px-2 rounded-md hover:bg-primary/10"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    AI Knowledge Base
                  </Link>
                  <Link 
                    href="/trace"
                    className="flex py-2 px-2 rounded-md hover:bg-primary/10"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Verify Products
                  </Link>
                </div>
                <div className="border-t pt-4 mt-2">
                  <Link href="/auth">
                    <Button className="w-full gap-2" onClick={() => setShowMobileMenu(false)}>
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;