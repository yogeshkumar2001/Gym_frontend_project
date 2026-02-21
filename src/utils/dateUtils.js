import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(relativeTime);
dayjs.extend(isBetween);

export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return '—';
  return dayjs(date).format(format);
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return dayjs(date).format('MMM DD, YYYY HH:mm');
};

export const isExpired = (date) => dayjs().isAfter(dayjs(date));

export const daysUntilExpiry = (date) => {
  const diff = dayjs(date).diff(dayjs(), 'day');
  return diff;
};

export const fromNow = (date) => dayjs(date).fromNow();

export const toISOString = (date) => (date ? dayjs(date).toISOString() : null);

export const isInRange = (date, startDate, endDate) => {
  if (!startDate || !endDate) return true;
  return dayjs(date).isBetween(dayjs(startDate), dayjs(endDate), null, '[]');
};
