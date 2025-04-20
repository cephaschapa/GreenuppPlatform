import React from 'react';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
  backText?: string;
  className?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backUrl,
  backText = 'Back',
  className,
  action,
  children
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 space-y-2', className)}>
      {backUrl && (
        <Button 
          variant="link" 
          asChild 
          className="px-0 text-gray-400 hover:text-white flex items-center gap-1 -ml-1 mb-1"
        >
          <Link href={backUrl}>
            <ChevronLeft className="h-4 w-4" />
            {backText}
          </Link>
        </Button>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}