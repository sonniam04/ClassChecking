"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { StatusChip } from "@/components/Chip";

interface StudentRow {
  student: { id: number; fullName: string; studentId: string };
  checkedIn: boolean;
  attendance: { checkedInAt: string; status: string } | null;
}
interface Session {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  closedAt: string | null;
  course: { id: number; name: string };
}

export default function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const sessionId = Number(id);

  const [session, setSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/sessions/${sessionId}/attendance`).then((r) => {
      setSession(r.data.session);
      setStudents(r.data.students);
    }).finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <p className="text-sm text-gray-400">กำลังโหลด...</p>;
  if (!session) return <p className="text-sm text-red-500">ไม่พบ session</p>;

  const checked = students.filter((s) => s.checkedIn).length;
  const late = students.filter((s) => s.attendance?.status === "late").length;

  return (
    <div>
      <div className="mb-3">
        <Link href={`/teacher/courses/${session.course.id}`} className="text-xs text-gray-400 hover:text-gray-600">
          ← {session.course.name}
        </Link>
        <div className="flex items-baseline gap-2 mt-1">
          <h1 className="text-lg font-semibold text-gray-800">
            {new Date(session.date).toLocaleDateString("th-TH", { dateStyle: "long" })}
          </h1>
          <span className="text-sm text-gray-400">{session.startTime}–{session.endTime}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="border border-gray-200 rounded px-3 py-2 text-center min-w-[60px]">
          <p className="text-lg font-semibold text-green-700">{checked - late}</p>
          <p className="text-xs text-gray-400">มาตรงเวลา</p>
        </div>
        <div className="border border-gray-200 rounded px-3 py-2 text-center min-w-[60px]">
          <p className="text-lg font-semibold text-yellow-600">{late}</p>
          <p className="text-xs text-gray-400">มาสาย</p>
        </div>
        <div className="border border-gray-200 rounded px-3 py-2 text-center min-w-[60px]">
          <p className="text-lg font-semibold text-red-500">{students.length - checked}</p>
          <p className="text-xs text-gray-400">ขาด</p>
        </div>
        <div className="border border-gray-200 rounded px-3 py-2 text-center min-w-[60px]">
          <p className="text-lg font-semibold text-gray-600">{students.length}</p>
          <p className="text-xs text-gray-400">ทั้งหมด</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-left px-3 py-2">ชื่อ-นามสกุล</th>
              <th className="text-left px-3 py-2">รหัสนักศึกษา</th>
              <th className="text-left px-3 py-2">สถานะ</th>
              <th className="text-left px-3 py-2">เวลาเช็คชื่อ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((s) => {
              const variant = !s.checkedIn ? "absent" : s.attendance?.status === "late" ? "late" : "present";
              return (
                <tr key={s.student.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium text-gray-800">{s.student.fullName}</td>
                  <td className="px-3 py-2.5 text-gray-500">{s.student.studentId}</td>
                  <td className="px-3 py-2.5">
                    <StatusChip variant={variant} />
                  </td>
                  <td className="px-3 py-2.5 text-gray-400 text-xs">
                    {s.attendance ? new Date(s.attendance.checkedInAt).toLocaleTimeString("th-TH") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
