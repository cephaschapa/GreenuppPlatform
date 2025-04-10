import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar component contains both desktop sidebar and mobile nav */}
      <Sidebar />
      
      {/* Main content with padding adjustments for mobile */}
      <div className="md:pl-64">
        <main className="container mx-auto px-4 md:py-12">
          {/* Add top padding on mobile to account for status bar */}
          <div className="pt-16 pb-20 md:pt-0 md:pb-0">
            {/* Title only visible on desktop, mobile uses status bar instead */}
            <div className="hidden md:block mb-8">
              <h1 className="text-3xl font-bold font-space mb-2 relative inline-block">
                {title}
                {title.toLowerCase().includes('greenupp') && (
                  <span className="absolute -top-2 -right-12 bg-primary text-black text-xs px-2 py-0.5 rounded-full font-semibold">BETA</span>
                )}
              </h1>
              {description && (
                <p className="text-gray-400">{description}</p>
              )}
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}