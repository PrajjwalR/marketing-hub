import { addDays, addWeeks, addMonths, isAfter, parseISO } from 'date-fns';

export function calculateNextScheduledAt(
  current: Date | string,
  interval: string | null,
  frequency: number = 1,
  endAt?: string | null,
  maxCount?: number | null,
  currentCount: number = 0
): Date | null {
  if (!interval) return null;
  
  const currentDate = typeof current === 'string' ? parseISO(current) : current;
  let nextDate: Date;

  switch (interval.toLowerCase()) {
    case 'daily':
      nextDate = addDays(currentDate, frequency);
      break;
    case 'weekly':
      nextDate = addWeeks(currentDate, frequency);
      break;
    case 'monthly':
      nextDate = addMonths(currentDate, frequency);
      break;
    case 'custom':
      nextDate = addDays(currentDate, frequency); // Default custom to daily for now
      break;
    default:
      return null;
  }

  // Check end date
  if (endAt && isAfter(nextDate, parseISO(endAt))) {
    return null;
  }

  // Check max count
  if (maxCount !== null && maxCount !== undefined && currentCount >= maxCount) {
    return null;
  }

  return nextDate;
}
