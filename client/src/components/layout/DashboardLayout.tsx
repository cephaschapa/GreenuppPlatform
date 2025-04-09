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
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="md:pl-64">
        <main className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-space mb-2">{title}</h1>
            {description && (
              <p className="text-gray-400">{description}</p>
            )}
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
}