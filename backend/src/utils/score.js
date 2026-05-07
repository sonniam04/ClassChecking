const STARTING_SCORE = 10;
const LATE_DEDUCTION = 0.5;   // 10–19 min late
const ABSENT_DEDUCTION = 1;   // no check-in after window closes
const ABSENT_CUTOFF_MINUTES = 20;
const NO_EXAM_THRESHOLD = 0.2; // > 20% of total sessions absent

/** A session is "countable" once its 20-min check-in window has closed. */
function isCountable(session) {
  const now = new Date();
  const d = new Date(session.date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (sDate < today) return true;
  if (sDate.getTime() !== today.getTime()) return false;

  const [h, m] = session.startTime.split(":").map(Number);
  const start = new Date(today);
  start.setHours(h, m, 0, 0);
  return now >= new Date(start.getTime() + ABSENT_CUTOFF_MINUTES * 60000);
}

async function calculateScore(prisma, studentId, courseId) {
  const [sessions, attendances] = await Promise.all([
    prisma.session.findMany({ where: { courseId } }),
    prisma.attendance.findMany({ where: { studentId, session: { courseId } } }),
  ]);

  const countable = sessions.filter(isCountable);
  const attMap = new Map(attendances.map((a) => [a.sessionId, a]));

  let score = STARTING_SCORE;
  let absentCount = 0;
  let lateCount = 0;

  for (const s of countable) {
    const att = attMap.get(s.id);
    if (!att) {
      score -= ABSENT_DEDUCTION;
      absentCount++;
    } else if (att.status === "late") {
      score -= LATE_DEDUCTION;
      lateCount++;
    }
  }

  score = Math.round(Math.max(0, score) * 10) / 10;
  const noExamRight =
    sessions.length > 0 && absentCount / sessions.length > NO_EXAM_THRESHOLD;

  return {
    score,
    absentCount,
    lateCount,
    countableSessions: countable.length,
    totalSessions: sessions.length,
    noExamRight,
  };
}

module.exports = { calculateScore };
