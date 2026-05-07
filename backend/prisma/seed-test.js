const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  try {
    // ============================================
    // 1. CREATE TEACHERS
    // ============================================
    console.log("📚 Creating teachers...");

    const teacher1 = await prisma.user.upsert({
      where: { username: "teacher1" },
      update: {},
      create: {
        username: "teacher1",
        password: await bcrypt.hash("teacher123", 10),
        role: "teacher",
        fullName: "Teacher One (Data Structures)",
      },
    });
    console.log(`  ✓ ${teacher1.fullName} (${teacher1.username})`);

    const teacher2 = await prisma.user.upsert({
      where: { username: "teacher2" },
      update: {},
      create: {
        username: "teacher2",
        password: await bcrypt.hash("teacher123", 10),
        role: "teacher",
        fullName: "Teacher Two (Database Systems)",
      },
    });
    console.log(`  ✓ ${teacher2.fullName} (${teacher2.username})\n`);

    // ============================================
    // 2. CREATE STUDENTS
    // ============================================
    console.log("👥 Creating students...");

    const studentsData = [
      { studentId: "001", fullName: "Alice Johnson", username: "u001" },
      { studentId: "002", fullName: "Bob Smith", username: "u002" },
      { studentId: "003", fullName: "Charlie Brown", username: "u003" },
      { studentId: "004", fullName: "David Davis", username: "u004" },
      { studentId: "005", fullName: "Eve Wilson", username: "u005" },
    ];

    const students = [];
    for (const studentData of studentsData) {
      const student = await prisma.user.upsert({
        where: { username: studentData.username },
        update: {},
        create: {
          username: studentData.username,
          password: await bcrypt.hash(studentData.studentId, 10),
          role: "student",
          fullName: studentData.fullName,
          studentId: studentData.studentId,
        },
      });
      students.push(student);
      console.log(`  ✓ ${student.fullName} (${student.username})`);
    }
    console.log();

    // ============================================
    // 3. CREATE COURSES
    // ============================================
    console.log("📖 Creating courses...\n");

    // Course 1: Data Structures
    console.log("  Course 1: Data Structures");
    const course1 = await prisma.course.upsert({
      where: { name: "Data Structures" },
      update: {},
      create: {
        name: "Data Structures",
        teacherId: teacher1.id,
        startDate: new Date("2026-01-12"),
        endDate: new Date("2026-02-28"),
        schedules: {
          create: [
            {
              dayOfWeek: 1, // Monday
              startTime: "10:00",
              endTime: "11:00",
            },
            {
              dayOfWeek: 3, // Wednesday
              startTime: "14:00",
              endTime: "15:00",
            },
          ],
        },
      },
      include: { schedules: true },
    });
    console.log(`    ✓ Created with ${course1.schedules.length} schedules`);

    // Generate sessions for course1
    const sessionData1 = generateSessions(
      course1.id,
      course1.schedules,
      course1.startDate,
      course1.endDate
    );
    await prisma.session.createMany({ data: sessionData1 });
    console.log(`    ✓ Generated ${sessionData1.length} sessions\n`);

    // Course 2: Algorithms
    console.log("  Course 2: Algorithms");
    const course2 = await prisma.course.upsert({
      where: { name: "Algorithms" },
      update: {},
      create: {
        name: "Algorithms",
        teacherId: teacher1.id,
        startDate: new Date("2026-01-15"),
        endDate: new Date("2026-03-31"),
        schedules: {
          create: [
            {
              dayOfWeek: 2, // Tuesday
              startTime: "09:00",
              endTime: "10:30",
            },
            {
              dayOfWeek: 4, // Thursday
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
        },
      },
      include: { schedules: true },
    });
    console.log(`    ✓ Created with ${course2.schedules.length} schedules`);

    const sessionData2 = generateSessions(
      course2.id,
      course2.schedules,
      course2.startDate,
      course2.endDate
    );
    await prisma.session.createMany({ data: sessionData2 });
    console.log(`    ✓ Generated ${sessionData2.length} sessions\n`);

    // Course 3: Database Systems
    console.log("  Course 3: Database Systems");
    const course3 = await prisma.course.upsert({
      where: { name: "Database Systems" },
      update: {},
      create: {
        name: "Database Systems",
        teacherId: teacher2.id,
        startDate: new Date("2026-01-12"),
        endDate: new Date("2026-03-31"),
        schedules: {
          create: [
            {
              dayOfWeek: 1, // Monday
              startTime: "14:00",
              endTime: "15:30",
            },
            {
              dayOfWeek: 5, // Friday
              startTime: "14:00",
              endTime: "15:30",
            },
          ],
        },
      },
      include: { schedules: true },
    });
    console.log(`    ✓ Created with ${course3.schedules.length} schedules`);

    const sessionData3 = generateSessions(
      course3.id,
      course3.schedules,
      course3.startDate,
      course3.endDate
    );
    await prisma.session.createMany({ data: sessionData3 });
    console.log(`    ✓ Generated ${sessionData3.length} sessions\n`);

    // ============================================
    // 4. ENROLL STUDENTS IN COURSES
    // ============================================
    console.log("📝 Enrolling students in courses...\n");

    // Data Structures: Alice, Bob, Charlie
    console.log("  Data Structures:");
    await prisma.enrollment.upsert({
      where: { courseId_studentId: { courseId: course1.id, studentId: students[0].id } },
      update: {},
      create: { courseId: course1.id, studentId: students[0].id },
    });
    console.log(`    ✓ ${students[0].fullName}`);

    await prisma.enrollment.upsert({
      where: { courseId_studentId: { courseId: course1.id, studentId: students[1].id } },
      update: {},
      create: { courseId: course1.id, studentId: students[1].id },
    });
    console.log(`    ✓ ${students[1].fullName}`);

    await prisma.enrollment.upsert({
      where: { courseId_studentId: { courseId: course1.id, studentId: students[2].id } },
      update: {},
      create: { courseId: course1.id, studentId: students[2].id },
    });
    console.log(`    ✓ ${students[2].fullName}\n`);

    // Algorithms: Alice, Bob, David, Eve
    console.log("  Algorithms:");
    for (const student of [students[0], students[1], students[3], students[4]]) {
      await prisma.enrollment.upsert({
        where: { courseId_studentId: { courseId: course2.id, studentId: student.id } },
        update: {},
        create: { courseId: course2.id, studentId: student.id },
      });
      console.log(`    ✓ ${student.fullName}`);
    }
    console.log();

    // Database Systems: Bob, Charlie, David
    console.log("  Database Systems:");
    for (const student of [students[1], students[2], students[3]]) {
      await prisma.enrollment.upsert({
        where: { courseId_studentId: { courseId: course3.id, studentId: student.id } },
        update: {},
        create: { courseId: course3.id, studentId: student.id },
      });
      console.log(`    ✓ ${student.fullName}`);
    }
    console.log();

    // ============================================
    // 5. CREATE SAMPLE ATTENDANCE RECORDS
    // ============================================
    console.log("✅ Creating sample attendance records...\n");

    // Get first session of each course
    const session1 = await prisma.session.findFirst({
      where: { courseId: course1.id },
      orderBy: { date: "asc" },
    });

    const session2 = await prisma.session.findFirst({
      where: { courseId: course2.id },
      orderBy: { date: "asc" },
    });

    // Data Structures - Session 1: Alice present
    if (session1) {
      console.log(`  Data Structures - Session 1 (${session1.date.toDateString()}):`);
      try {
        await prisma.attendance.upsert({
          where: { sessionId_studentId: { sessionId: session1.id, studentId: students[0].id } },
          update: {},
          create: {
            sessionId: session1.id,
            studentId: students[0].id,
            status: "present",
          },
        });
        console.log(`    ✓ ${students[0].fullName} - Present`);
      } catch (e) {
        console.log(`    - ${students[0].fullName} - Already exists`);
      }
    }

    // Algorithms - Session 1: Alice and Bob present
    if (session2) {
      console.log(`  Algorithms - Session 1 (${session2.date.toDateString()}):`);
      for (const student of [students[0], students[1]]) {
        try {
          await prisma.attendance.upsert({
            where: { sessionId_studentId: { sessionId: session2.id, studentId: student.id } },
            update: {},
            create: {
              sessionId: session2.id,
              studentId: student.id,
              status: "present",
            },
          });
          console.log(`    ✓ ${student.fullName} - Present`);
        } catch (e) {
          console.log(`    - ${student.fullName} - Already exists`);
        }
      }
    }

    console.log("\n✨ Seed completed successfully!\n");

    // ============================================
    // 6. PRINT SUMMARY
    // ============================================
    console.log("=" + "=".repeat(50));
    console.log("📊 DATABASE SUMMARY");
    console.log("=" + "=".repeat(50));

    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const sessionCount = await prisma.session.count();
    const enrollmentCount = await prisma.enrollment.count();
    const attendanceCount = await prisma.attendance.count();

    console.log(`Users:         ${userCount}`);
    console.log(`Courses:       ${courseCount}`);
    console.log(`Sessions:      ${sessionCount}`);
    console.log(`Enrollments:   ${enrollmentCount}`);
    console.log(`Attendances:   ${attendanceCount}`);
    console.log("=" + "=".repeat(50) + "\n");

    console.log("🔑 Test Credentials:");
    console.log("   Teachers:");
    console.log("     - teacher1 / teacher123");
    console.log("     - teacher2 / teacher123");
    console.log("   Students:");
    console.log("     - u001 / 001 (Alice)");
    console.log("     - u002 / 002 (Bob)");
    console.log("     - u003 / 003 (Charlie)");
    console.log("     - u004 / 004 (David)");
    console.log("     - u005 / 005 (Eve)\n");
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate sessions based on course schedule and date range
 */
function generateSessions(courseId, schedules, startDate, endDate) {
  const sessions = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const matchingSchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);

    if (matchingSchedule) {
      sessions.push({
        courseId,
        scheduleId: matchingSchedule.id,
        date: new Date(d),
        startTime: matchingSchedule.startTime,
        endTime: matchingSchedule.endTime,
      });
    }
  }

  return sessions;
}

main();
