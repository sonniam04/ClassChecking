"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ScheduleChip } from "@/components/Chip";

interface Course {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  schedules: { dayOfWeek: number; startTime: string; endTime: string }[];
  _count: { enrollments: number; sessions: number };
}

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses").then((r) => setCourses(r.data)).finally(() => setLoading(false));
  }, []);

  async function deleteCourse(id: number) {
    if (!confirm("ยืนยันการลบวิชานี้?")) return;
    await api.delete(`/courses/${id}`);
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold text-gray-800">รายวิชาของฉัน</h1>
        <Link
          href="/teacher/courses/new"
          className="bg-gray-900 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm font-medium transition"
        >
          + สร้างวิชาใหม่
        </Link>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400">กำลังโหลด...</p>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-sm">ยังไม่มีรายวิชา</p>
          <p className="text-xs mt-1">กดปุ่ม "สร้างวิชาใหม่" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-md overflow-hidden divide-y divide-gray-100">
          {courses.map((c) => (
            <div key={c.id} className="bg-white px-4 py-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-medium text-gray-800 text-sm">{c.name}</h2>
                  {c.schedules.map((s, i) => (
                    <ScheduleChip key={i} dayOfWeek={s.dayOfWeek} startTime={s.startTime} endTime={s.endTime} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(c.startDate).toLocaleDateString("th-TH")} — {new Date(c.endDate).toLocaleDateString("th-TH")}
                  {" · "}{c._count.sessions} คาบ · {c._count.enrollments} นักศึกษา
                </p>
              </div>
              <div className="flex gap-3 ml-4 shrink-0 text-xs">
                <Link href={`/teacher/courses/${c.id}`} className="text-blue-600 hover:underline">จัดการ</Link>
                <button onClick={() => deleteCourse(c.id)} className="text-red-400 hover:text-red-600">ลบ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
