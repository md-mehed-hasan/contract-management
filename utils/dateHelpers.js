import { addDays, format, isAfter } from 'date-fns';

export function defaultExpiryDate() {
  return addDays(new Date(), 7);
}

export function formatDate(date) {
  if (!date) return '—';
  return format(new Date(date), 'PP p');
}

export function isExpired(date) {
  return date ? isAfter(new Date(), new Date(date)) : false;
}
