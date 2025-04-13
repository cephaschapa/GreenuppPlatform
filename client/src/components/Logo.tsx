import { FC } from 'react';
import { Link } from 'wouter';
import greenuppLogo from '@/assets/greenupp_logo.png';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBeta?: boolean;
  className?: string;
  href?: string;
}

export const Logo: FC<LogoProps> = ({
  size = 'md',
  showBeta = true,
  className,
  href = '/',
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  const betaPosition = {
    sm: '-top-1 -right-8 text-[10px] px-1 py-0.5',
    md: '-top-1 -right-10 text-xs px-1.5 py-0.5',
    lg: '-top-2 -right-12 text-xs px-2 py-0.5',
  };

  const logoElement = (
    <div 
      className={cn(
        'relative inline-flex items-center',
        className
      )}
    >
      <img 
        src={greenuppLogo} 
        alt="Greenupp Logo" 
        className={cn(
          'transition-transform duration-300 hover:scale-105',
          sizeClasses[size]
        )} 
      />
      
      {showBeta && (
        <span 
          className={cn(
            'absolute bg-primary text-black rounded-full font-semibold',
            betaPosition[size]
          )}
        >
          BETA
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoElement}</Link>;
  }

  return logoElement;
};