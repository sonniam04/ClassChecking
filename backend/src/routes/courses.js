const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, requireRole } = require("../middleware/auth");
const { generateSessions } = require("../utils/sessionGenerator");

const router = express.Router();
const prisma = new PrismaClient();

const teacherOnly = [verifyToken, requireRole("teacher")];

// GET /api/courses — list teacher's courses
router.get("/", ...teacherOnly, async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { teacherId: req.user.id },
    include: {
      schedules: true,
      _count: { select: { enrollments: true, sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(courses);
});

// POST /api/courses — create course + schedules + sessions
router.post("/", ...teacherOnly, async (req, res) => {
  const { name, startDate, endDate, schedules } = req.body;
  if (!name || !startDate || !endDate || !schedules || schedules.length === 0) {
    return res.status(400).json({ message: "name, startDate, endDate, schedules required" });
  }

  const course = await prisma.course.create({
    data: {
      name,
      teacherId: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      schedules: { create: schedules.map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })) },
    },
    include: { schedules: true },
  });

  const sessionData = generateSessions(course.id, course.schedules, course.startDate, course.endDate);
  if (sessionData.length === 0) {
    await prisma.course.delete({ where: { id: course.id } });
    return res.status(400).json({ message: "Schedule produces no sessions in the given date range" });
  }

  await prisma.session.createMany({ data: sessionData });

  res.status(201).json({ ...course, sessionCount: sessionData.length });
});

// GET /api/courses/:id
router.get("/:id", ...teacherOnly, async (req, res) => {
  const id = Number(req.params.id);
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      schedules: true,
      _count: { select: { enrollments: true, sessions: true } },
    },
  });
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (course.teacherId !== req.user.id) return res.status(403).json({ message: "Forbidden" });
  res.json(course);
});

// DELETE /api/courses/:id
router.delete("/:id", ...teacherOnly, async (req, res) => {
  const id = Number(req.params.id);
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (course.teacherId !== req.user.id) return res.status(403).json({ message: "Forbidden" });
  await prisma.course.delete({ where: { id } });
  res.json({ message: "Deleted" });
});

module.exports = router;
