import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: string;
  rightContent?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  backLink, 
  rightContent 
}: PageHeaderProps) {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col space-y-2 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {backLink && (
            <Button
              onClick={() => navigate(backLink)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        {rightContent && (
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
      {description && (
        <p className="text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

export default PageHeader;