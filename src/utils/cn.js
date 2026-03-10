import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind classes safely — handles conflicts intelligently.
 * Usage: cn('px-2 py-1', condition && 'bg-blue-500', { 'opacity-50': isDisabled })
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
