export const getLogicalDateStr = (resetTimeStr, customDate) => {
  const now = customDate ? new Date(customDate) : new Date();
  const parts = (resetTimeStr || '00:00').split(':').map(Number);
  const resetHour = parts[0] || 0;
  const resetMinute = parts[1] || 0;

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // If the reset is set between 00:01 and 12:00 (late-night / morning reset),
  // and the current time is today before that reset time,
  // then logically it belongs to the previous calendar day!
  const isBeforeResetToday = (currentHour < resetHour) || (currentHour === resetHour && currentMinute < resetMinute);
  
  // Case A: Early reset (00:01 - 12:00, e.g. 04:00 AM)
  // Time before the reset today belongs to logically yesterday's cycle.
  if (resetHour > 0 && resetHour <= 12) {
    if (isBeforeResetToday) {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
  }

  // Case B: Late reset (12:01 - 23:59, e.g. 23:00 PM)
  // Time after the reset today belongs to logically tomorrow's cycle.
  if (resetHour > 12) {
    if (!isBeforeResetToday) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
  }

  return now.toISOString().split('T')[0];
};
