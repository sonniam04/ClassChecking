require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PORT } = require("./config");

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const studentRoutes = require("./routes/students");
const sessionRoutes = require("./routes/sessions");
const attendanceRoutes = require("./routes/attendance");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/courses/:courseId/students", studentRoutes);
app.use("/api", sessionRoutes);
app.use("/api/student", attendanceRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
