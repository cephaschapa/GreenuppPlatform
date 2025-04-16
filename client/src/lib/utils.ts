import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as a currency string
 * 
 * @param amount - The amount to format
 * @param currencyCode - The currency code (default: ZMW for Zambian Kwacha)
 * @returns A formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string = 'ZMW'): string {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
