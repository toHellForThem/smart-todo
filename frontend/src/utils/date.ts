export const getLogicalDateStr = (
  resetTimeStr?: string | null,
  customDate?: string | number | Date | null
): string => {
  const now = new Date(customDate ?? Date.now());
  const parts = (resetTimeStr || '00:00').split(':').map(Number);
  const resetHour = parts[0] || 0;
  const resetMinute = parts[1] || 0;

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const isBeforeResetToday = (currentHour < resetHour) || (currentHour === resetHour && currentMinute < resetMinute);

  if (resetHour > 0 && resetHour <= 12) {
    if (isBeforeResetToday) {
      now.setDate(now.getDate() - 1);
    }
  }

  if (resetHour > 12) {
    if (!isBeforeResetToday) {
      now.setDate(now.getDate() + 1);
    }
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
