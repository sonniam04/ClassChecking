"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ScheduleChip } from "@/components/Chip";

interface Course {
  id: number;
  name: string;
  teacher: { fullName: string };
  schedules: { dayOfWeek: number; startTime: string; endTime: string }[];
  _count: { sessions: number };
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/courses").then((r) => setCourses(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-800 mb-3">วิชาที่ลงทะเบียน</h1>
      {loading ? (
        <p className="text-sm text-gray-400">กำลังโหลด...</p>
      ) : courses.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">ยังไม่มีวิชาที่ลงทะเบียน</p>
      ) : (
        <div className="border border-gray-200 rounded-md overflow-hidden divide-y divide-gray-100">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/student/courses/${c.id}`}
              className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800 text-sm">{c.name}</span>
                  {c.schedules.map((s, i) => (
                    <ScheduleChip key={i} dayOfWeek={s.dayOfWeek} startTime={s.startTime} endTime={s.endTime} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">อาจารย์: {c.teacher.fullName} · {c._count.sessions} คาบ</p>
              </div>
              <span className="text-gray-300 text-xs ml-4">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
