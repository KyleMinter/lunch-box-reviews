/**
 * Formats ISO strings in MM/DD/YYY
 */
export function formatDateISO(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}