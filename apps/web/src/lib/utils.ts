import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Format centavos to peso display
export const formatPeso = (centavos: number): string =>
  `₱${(centavos / 100).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Format date to PH locale
export const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleString('en-PH', {
    timeZone:  'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

// Format slot hours to readable
export const formatSlot = (hours: number): string =>
  `${hours} hour${hours > 1 ? 's' : ''}`;

export const formatBikeType = (category: string, style: string): string =>
  `${category.charAt(0).toUpperCase() + category.slice(1)} ${style.charAt(0).toUpperCase() + style.slice(1)}`;

export const getInitials = (firstName: string, lastName: string): string =>
  `${firstName[0]}${lastName[0]}`.toUpperCase();


export const sanitizedRedirect = (redirect: string | null): string | null => {
  if (!redirect) return null;

  try {
    const decoded = decodeURIComponent(redirect);

    // must start with / and not with //
    // and must not contain nang ano @
    if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('@')) {
      return decoded;
    }
  } catch {
    return null;
  }

  return null;
}; 