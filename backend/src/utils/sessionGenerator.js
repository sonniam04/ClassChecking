/**
 * Generate Session records from a course's schedules and date range.
 * @param {number} courseId
 * @param {Array<{id: number, dayOfWeek: number, startTime: string, endTime: string}>} schedules
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Array} session data ready for prisma.session.createMany
 */
function generateSessions(courseId, schedules, startDate, endDate) {
  const sessions = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  for (const schedule of schedules) {
    const current = new Date(start);
    while (current <= end) {
      if (current.getDay() === schedule.dayOfWeek) {
        sessions.push({
          courseId,
          scheduleId: schedule.id,
          date: new Date(current),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        });
      }
      current.setDate(current.getDate() + 1);
    }
  }

  // Sort by date then startTime
  sessions.sort((a, b) => {
    const dateDiff = a.date - b.date;
    if (dateDiff !== 0) return dateDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  return sessions;
}

module.exports = { generateSessions };
