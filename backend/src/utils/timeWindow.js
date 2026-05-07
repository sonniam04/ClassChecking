const ABSENT_CUTOFF_MINUTES = 20;

function _startDate(session) {
  const d = new Date(session.date);
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const [h, m] = session.startTime.split(":").map(Number);
  base.setHours(h, m, 0, 0);
  return base;
}

/** Minutes elapsed since session start (negative = not started yet). */
function minutesLate(session) {
  return Math.floor((Date.now() - _startDate(session).getTime()) / 60000);
}

/**
 * Check if a session is currently open for check-in.
 * Hard cutoff: 20 minutes after start time (students after that are absent).
 */
function isSessionOpen(session) {
  const now = new Date();
  const sessionDate = new Date(session.date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sDate = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
  if (today.getTime() !== sDate.getTime()) return false;

  const start = _startDate(session);
  if (now < start) return false;

  // 20-min hard cutoff
  if (now >= new Date(start.getTime() + ABSENT_CUTOFF_MINUTES * 60000)) return false;

  const [endH, endM] = session.endTime.split(":").map(Number);
  const sessionEnd = new Date(today);
  sessionEnd.setHours(endH, endM, 0, 0);

  if (session.closedAt) return now <= new Date(session.closedAt);
  return now <= sessionEnd;
}

module.exports = { isSessionOpen, minutesLate };
