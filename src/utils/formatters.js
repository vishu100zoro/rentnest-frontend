import dayjs from 'dayjs';

export function formatINR(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr, pattern = 'DD MMM YYYY') {
  if (!dateStr) return 'Flexible';
  const parsed = dayjs(dateStr);
  return parsed.isValid() ? parsed.format(pattern) : dateStr;
}

export function getBudgetRangeFromPreset(preset) {
  switch (preset) {
    case 'under_7000':
      return { minRent: 0, maxRent: 7000 };
    case '7000_10000':
      return { minRent: 7000, maxRent: 10000 };
    case '10000_15000':
      return { minRent: 10000, maxRent: 15000 };
    case 'above_15000':
      return { minRent: 15000, maxRent: 30000 };
    default:
      return { minRent: 0, maxRent: 30000 };
  }
}

export function handleImageError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = '/fallback-room.svg';
}
