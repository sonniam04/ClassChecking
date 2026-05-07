const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, requireRole } = require("../middleware/auth");
const { isSessionOpen, minutesLate } = require("../utils/timeWindow");
const { calculateScore } = require("../utils/score");

const router = express.Router();
const prisma = new PrismaClient();
const studentOnly = [verifyToken, requireRole("student")];

// GET /api/student/courses — enrolled courses
router.get("/courses", ...studentOnly, async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: req.user.id },
    include: {
      course: {
        include: {
          teacher: { select: { fullName: true } },
          schedules: true,
          _count: { select: { sessions: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  res.json(enrollments.map((e) => e.course));
});

// GET /api/student/courses/:id/sessions — sessions with check-in eligibility
router.get("/courses/:id/sessions", ...studentOnly, async (req, res) => {
  const courseId = Number(req.params.id);
  const enrolled = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: req.user.id } },
  });
  if (!enrolled) return res.status(403).json({ message: "Not enrolled in this course" });

  const sessions = await prisma.session.findMany({
    where: { courseId },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const attendances = await prisma.attendance.findMany({
    where: { studentId: req.user.id, session: { courseId } },
  });
  const attMap = new Map(attendances.map((a) => [a.sessionId, a]));

  const result = sessions.map((s) => ({
    ...s,
    canCheckIn: isSessionOpen(s),
    alreadyCheckedIn: attMap.has(s.id),
    attendanceStatus: attMap.get(s.id)?.status ?? null,
  }));

  res.json(result);
});

// GET /api/student/courses/:id/score
router.get("/courses/:id/score", ...studentOnly, async (req, res) => {
  const courseId = Number(req.params.id);
  const enrolled = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId: req.user.id } },
  });
  if (!enrolled) return res.status(403).json({ message: "Not enrolled in this course" });
  const scoreData = await calculateScore(prisma, req.user.id, courseId);
  res.json(scoreData);
});

// POST /api/student/sessions/:id/checkin
router.post("/sessions/:id/checkin", ...studentOnly, async (req, res) => {
  const sessionId = Number(req.params.id);
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return res.status(404).json({ message: "Session not found" });

  const enrolled = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId: session.courseId, studentId: req.user.id } },
  });
  if (!enrolled) return res.status(403).json({ message: "Not enrolled in this course" });

  if (!isSessionOpen(session)) {
    return res.status(403).json({ message: "Check-in is not open for this session" });
  }

  const mLate = minutesLate(session);
  const status = mLate >= 10 ? "late" : "present";

  try {
    const attendance = await prisma.attendance.create({
      data: { sessionId, studentId: req.user.id, status },
    });
    res.status(201).json(attendance);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Already checked in" });
    }
    throw err;
  }
});

// GET /api/student/attendance — full history
router.get("/attendance", ...studentOnly, async (req, res) => {
  const attendances = await prisma.attendance.findMany({
    where: { studentId: req.user.id },
    include: {
      session: {
        include: { course: { select: { id: true, name: true } } },
      },
    },
    orderBy: { checkedInAt: "desc" },
  });
  res.json(attendances);
});

module.exports = router;
