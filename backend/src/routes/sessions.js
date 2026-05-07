const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();
const teacherOnly = [verifyToken, requireRole("teacher")];

// GET /api/courses/:courseId/sessions
router.get("/courses/:courseId/sessions", ...teacherOnly, async (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (course.teacherId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

  const sessions = await prisma.session.findMany({
    where: { courseId },
    include: { _count: { select: { attendances: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  res.json(sessions);
});

// PATCH /api/sessions/:id/close — close session early
router.patch("/sessions/:id/close", ...teacherOnly, async (req, res) => {
  const id = Number(req.params.id);
  const session = await prisma.session.findUnique({
    where: { id },
    include: { course: true },
  });
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (session.course.teacherId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

  const updated = await prisma.session.update({
    where: { id },
    data: { closedAt: new Date() },
  });
  res.json(updated);
});

// PATCH /api/sessions/:id/reopen
router.patch("/sessions/:id/reopen", ...teacherOnly, async (req, res) => {
  const id = Number(req.params.id);
  const session = await prisma.session.findUnique({
    where: { id },
    include: { course: true },
  });
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (session.course.teacherId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

  const updated = await prisma.session.update({
    where: { id },
    data: { closedAt: null },
  });
  res.json(updated);
});

// GET /api/sessions/:id/attendance — teacher views attendance
router.get("/sessions/:id/attendance", ...teacherOnly, async (req, res) => {
  const id = Number(req.params.id);
  const session = await prisma.session.findUnique({
    where: { id },
    include: { course: true },
  });
  if (!session) return res.status(404).json({ message: "Session not found" });
  if (session.course.teacherId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

  // Get all enrolled students + their attendance status
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: session.courseId },
    include: { student: { select: { id: true, fullName: true, studentId: true } } },
  });
  const attendances = await prisma.attendance.findMany({
    where: { sessionId: id },
  });
  const attendanceMap = Object.fromEntries(attendances.map((a) => [a.studentId, a]));

  const result = enrollments.map((e) => ({
    student: e.student,
    attendance: attendanceMap[e.studentId] || null,
    checkedIn: !!attendanceMap[e.studentId],
  }));

  res.json({ session, students: result });
});

module.exports = router;
