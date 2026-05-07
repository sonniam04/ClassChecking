const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, requireRole } = require("../middleware/auth");
const { calculateScore } = require("../utils/score");

const router = express.Router({ mergeParams: true });
const prisma = new PrismaClient();
const teacherOnly = [verifyToken, requireRole("teacher")];

async function getCourseForTeacher(courseId, teacherId) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.teacherId !== teacherId) return null;
  return course;
}

// GET /api/courses/:courseId/students
router.get("/", ...teacherOnly, async (req, res) => {
  const courseId = Number(req.params.courseId);
  if (!(await getCourseForTeacher(courseId, req.user.id))) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: { student: { select: { id: true, fullName: true, studentId: true, username: true } } },
    orderBy: { createdAt: "asc" },
  });

  const result = await Promise.all(
    enrollments.map(async (e) => ({
      ...e.student,
      score: await calculateScore(prisma, e.studentId, courseId),
    }))
  );
  res.json(result);
});

// POST /api/courses/:courseId/students — add student (create account if needed)
router.post("/", ...teacherOnly, async (req, res) => {
  const courseId = Number(req.params.courseId);
  if (!(await getCourseForTeacher(courseId, req.user.id))) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { studentId, fullName } = req.body;
  if (!studentId || !fullName) {
    return res.status(400).json({ message: "studentId and fullName required" });
  }

  let user = await prisma.user.findUnique({ where: { studentId: String(studentId) } });
  const username = `u${studentId}`;
  const plainPassword = String(studentId);

  if (!user) {
    user = await prisma.user.create({
      data: {
        username,
        password: await bcrypt.hash(plainPassword, 10),
        role: "student",
        fullName,
        studentId: String(studentId),
      },
    });
  }

  try {
    await prisma.enrollment.create({ data: { courseId, studentId: user.id } });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Student already enrolled" });
    }
    throw err;
  }

  res.status(201).json({
    id: user.id,
    fullName: user.fullName,
    studentId: user.studentId,
    username: user.username,
    generatedPassword: plainPassword,
  });
});

// DELETE /api/courses/:courseId/students/:studentId
router.delete("/:studentId", ...teacherOnly, async (req, res) => {
  const courseId = Number(req.params.courseId);
  if (!(await getCourseForTeacher(courseId, req.user.id))) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const studentId = Number(req.params.studentId);
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
  });
  if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
  await prisma.enrollment.delete({ where: { id: enrollment.id } });
  res.json({ message: "Removed" });
});

module.exports = router;
