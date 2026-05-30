export const getLogicalDateStr = (resetTimeStr, customDate) => {
  const now = customDate ? new Date(customDate) : new Date();
  const parts = (resetTimeStr || '00:00').split(':').map(Number);
  const resetHour = parts[0] || 0;
  const resetMinute = parts[1] || 0;

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const isBeforeResetToday = (currentHour < resetHour) || (currentHour === resetHour && currentMinute < resetMinute);
  
  // Case A: Early reset (00:01 - 12:00, e.g. 04:00 AM)
  // Time before the reset today belongs to logically yesterday's cycle.
  if (resetHour > 0 && resetHour <= 12) {
    if (isBeforeResetToday) {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      const year = yesterday.getFullYear();
      const month = String(yesterday.getMonth() + 1).padStart(2, '0');
      const day = String(yesterday.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // Case B: Late reset (12:01 - 23:59, e.g. 23:00 PM)
  // Time after the reset today belongs to logically tomorrow's cycle.
  if (resetHour > 12) {
    if (!isBeforeResetToday) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
