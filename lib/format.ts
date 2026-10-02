/** Short, human-friendly date used across letter cards and modals (e.g. "Oct 2, 2026"). */
export const formatLetterDate = (value?: string | Date): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};