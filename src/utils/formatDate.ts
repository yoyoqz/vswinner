/**
 * Format a date to a human-readable format
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObject = date instanceof Date ? date : new Date(date);
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObject);
} 