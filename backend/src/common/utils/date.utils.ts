/**
 * UTC date utilities for consistent server-side date handling.
 * Use these when writing to the database so timestamps are stored in UTC.
 * See datetime-backend-frontend.md for DateTime / date-only / time-only conventions.
 */

/**
 * Current date/time as a Date (JavaScript Date is always UTC internally).
 */
export function nowUTC(): Date {
  return new Date();
}

/**
 * Convert a date string or Date to a Date instance (UTC).
 */
export function toUTC(date: string | Date): Date {
  return date instanceof Date ? date : new Date(date);
}

/**
 * Convert a date-only string (YYYY-MM-DD) to UTC at midnight.
 */
export function toUTCDateOnly(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z');
}

/**
 * Convert a date-only string (YYYY-MM-DD) to end of that day in UTC (23:59:59.999).
 * Use for inclusive end date in range queries.
 */
export function toUTCEndOfDay(dateString: string): Date {
  return new Date(dateString + 'T23:59:59.999Z');
}

/**
 * Create UTC date range for Prisma queries.
 * Uses start of day for both boundaries; end date is exclusive (start of end day).
 */
export function createUTCDateRange(
  startDate?: string | Date,
  endDate?: string | Date,
): { gte?: Date; lte?: Date } {
  const range: { gte?: Date; lte?: Date } = {};
  if (startDate) range.gte = toUTC(startDate);
  if (endDate) range.lte = toUTC(endDate);
  return range;
}

/**
 * Create UTC date range with inclusive end date (end of day).
 * Use for query params like startDate/endDate in YYYY-MM-DD format.
 */
export function createUTCDateRangeInclusive(
  startDate?: string | Date,
  endDate?: string | Date,
): { gte?: Date; lte?: Date } {
  const range: { gte?: Date; lte?: Date } = {};
  if (startDate) range.gte = typeof startDate === 'string' && startDate.length === 10
    ? toUTCDateOnly(startDate)
    : toUTC(startDate);
  if (endDate) range.lte = typeof endDate === 'string' && endDate.length === 10
    ? toUTCEndOfDay(endDate)
    : toUTC(endDate);
  return range;
}
