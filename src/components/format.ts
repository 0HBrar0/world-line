import type { StoryEvent } from '../data/schema';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Displays a sourced date. Editorial sort keys never reach this function's output. */
export function formatDate(event: Pick<StoryEvent, 'date' | 'time' | 'sortDateIsEditorial'>): string {
  if (!event.date || event.sortDateIsEditorial) return 'date unknown';
  const [year, month, day] = event.date.split('-');
  const parts: string[] = [];
  if (day) parts.push(`${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`);
  else if (month) parts.push(`${MONTHS[Number(month) - 1]} ${year}`);
  else parts.push(year);
  if (event.time) parts.push(event.time);
  return parts.join(', ');
}

export function shortDay(date: string): string {
  const [, month, day] = date.split('-');
  return `${MONTHS[Number(month) - 1].slice(0, 3)} ${Number(day)}`;
}

export function monthLabel(date: string): string {
  const [year, month] = date.split('-');
  return month ? `${MONTHS[Number(month) - 1].slice(0, 3)} ${year}` : year;
}
