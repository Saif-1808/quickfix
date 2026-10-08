/**
 * Time Slot Utilities
 * 
 * All times stored and compared in 24-hour "HH:MM" format.
 * Display conversions to 12-hour format for UI.
 */

/**
 * Convert 24h "HH:MM" to 12h display format "HH:MM AM/PM"
 */
const to12Hour = (time24) => {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

/**
 * Generate time slots between start and end times
 * @param {string} startTime - "HH:MM" format
 * @param {string} endTime - "HH:MM" format
 * @param {number} durationMinutes - Slot duration in minutes
 * @returns {Array} Array of slot objects
 */
const generateTimeSlots = (startTime, endTime, durationMinutes = 60) => {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + durationMinutes <= endMinutes) {
    const slotStartH = Math.floor(currentMinutes / 60);
    const slotStartM = currentMinutes % 60;
    const slotEndMinutes = currentMinutes + durationMinutes;
    const slotEndH = Math.floor(slotEndMinutes / 60);
    const slotEndM = slotEndMinutes % 60;

    const start = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`;
    const end = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;

    slots.push({
      start,
      end,
      displayStart: to12Hour(start),
      displayEnd: to12Hour(end),
    });

    currentMinutes += durationMinutes;
  }

  return slots;
};

/**
 * Check if a given day name is a working day
 * @param {string} dayName - e.g. "Monday"
 * @param {Array} workingDays - e.g. ["Monday", "Tuesday", ...]
 * @returns {boolean}
 */
const isWorkingDay = (dayName, workingDays) => {
  return workingDays.includes(dayName);
};

module.exports = { generateTimeSlots, isWorkingDay, to12Hour };
