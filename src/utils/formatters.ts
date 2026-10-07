/**
 * Utility functions for Bloom Saloon
 */

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function generateBookingId(dateStr?: string): string {
  const now = new Date();
  const datePart = dateStr
    ? dateStr.replace(/-/g, '')
    : `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BLM-${datePart}-${randomSuffix}`;
}

// Convert "10:30 AM" or "14:30" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  
  const cleaned = timeStr.trim();
  // Check for AM/PM format
  const is12Hour = /am|pm/i.test(cleaned);
  
  if (is12Hour) {
    const parts = cleaned.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (parts) {
      let hours = parseInt(parts[1], 10);
      const minutes = parseInt(parts[2], 10);
      const modifier = parts[3].toLowerCase();
      if (hours === 12 && modifier === 'am') hours = 0;
      if (hours < 12 && modifier === 'pm') hours += 12;
      return hours * 60 + minutes;
    }
  }

  // 24-hour format "09:00"
  const [h, m] = cleaned.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Convert minutes from midnight to "10:30 AM"
export function minutesToTime(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const modifier = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${modifier}`;
}

// Add duration to start time string and return formatted end time
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + durationMinutes;
  return minutesToTime(endMins);
}

// Convert 24-hr time like "07:00" or "21:30" to friendly "7:00 AM" or "9:30 PM"
export function formatDisplayTime(timeStr: string): string {
  if (!timeStr) return '';
  if (/am|pm/i.test(timeStr)) return timeStr;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  if (isNaN(h)) return timeStr;
  const modifier = h >= 12 ? 'PM' : 'AM';
  const hours12 = h % 12 || 12;
  return `${hours12}:${String(m).padStart(2, '0')} ${modifier}`;
}
