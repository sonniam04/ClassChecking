"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ScheduleChip, StatusChip, StatusVariant } from "@/components/Chip";

interface ScoreData { score: number; absentCount: number; lateCount: number; totalSessions: number; noExamRight: boolean }
interface Student { id: number; fullName: string; studentId: string; username: string; score: ScoreData }
interface Session { id: number; date: string; startTime: string; endTime: string; closedAt: string | null; _count: { attendances: number } }

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);

  const [tab, setTab] = useState<"students" | "sessions">("students");
  const [course, setCourse] = useState<{ name: string; schedules: { dayOfWeek: number; startTime: string; endTime: string }[] } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/courses/${courseId}/students`),
      api.get(`/courses/${courseId}/sessions`),
    ]).then(([c, s, se]) => {
      setCourse(c.data);
      setStudents(s.data);
      setSessions(se.data);
    }).finally(() => setLoading(false));
  }, [courseId]);

  async function removeStudent(studentId: number) {
    if (!confirm("ถอนนักศึกษาออกจากวิชานี้?")) return;
    await api.delete(`/courses/${courseId}/students/${studentId}`);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  }

  async function closeSession(sessionId: number) {
    const res = await api.patch(`/sessions/${sessionId}/close`);
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, closedAt: res.data.closedAt } : s));
  }

  async function reopenSession(sessionId: number) {
    const res = await api.patch(`/sessions/${sessionId}/reopen`);
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, closedAt: res.data.closedAt } : s));
  }

  if (loading) return <p className="text-sm text-gray-400">กำลังโหลด...</p>;
  if (!course) return <p className="text-sm text-red-500">ไม่พบวิชา</p>;

  return (
    <div>
      <div className="mb-3">
        <Link href="/teacher" className="text-xs text-gray-400 hover:text-gray-600">← กลับ</Link>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <h1 className="text-lg font-semibold text-gray-800">{course.name}</h1>
          {course.schedules.map((s, i) => (
            <ScheduleChip key={i} dayOfWeek={s.dayOfWeek} startTime={s.startTime} endTime={s.endTime} />
          ))}
        </div>
      </div>

      <div className="flex gap-0 border-b border-gray-200 mb-3">
        {(["students", "sessions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition ${tab === t ? "border-gray-800 text-gray-800" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            {t === "students" ? `นักศึกษา (${students.length})` : `คาบเรียน (${sessions.length})`}
          </button>
        ))}
      </div>

      {tab === "students" && (
        <div>
          <div className="flex justify-end mb-1.5">
            <Link
              href={`/teacher/courses/${courseId}/students/new`}
              className="bg-gray-900 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-medium transition"
            >
              + เพิ่มนักศึกษา
            </Link>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">ยังไม่มีนักศึกษา</p>
          ) : (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">ชื่อ-นามสกุล</th>
                    <th className="text-left px-3 py-2">รหัสนักศึกษา</th>
                    <th className="text-left px-3 py-2">Username</th>
                    <th className="text-left px-3 py-2">คะแนน</th>
                    <th className="text-left px-3 py-2">สถิติ</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-gray-800">
                        <div className="flex items-center gap-1.5">
                          {s.fullName}
                          {s.score?.noExamRight && <StatusChip variant="noexam" />}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{s.studentId}</td>
                      <td className="px-3 py-2.5 text-gray-500">{s.username}</td>
                      <td className="px-3 py-2.5">
                        {s.score ? (
                          <span className={`font-semibold tabular-nums ${s.score.score < 8 ? "text-red-500" : s.score.score < 9.5 ? "text-yellow-600" : "text-green-700"}`}>
                            {s.score.score}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-400">
                        {s.score && s.score.totalSessions > 0 ? (
                          <span>ขาด {s.score.absentCount} · สาย {s.score.lateCount}</span>
                        ) : <span>—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button onClick={() => removeStudent(s.id)} className="text-red-400 hover:text-red-600 text-xs">ถอน</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "sessions" && (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2">วันที่</th>
                <th className="text-left px-3 py-2">เวลา</th>
                <th className="text-left px-3 py-2">สถานะ</th>
                <th className="text-left px-3 py-2">เช็คชื่อ</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((s) => {
                const date = new Date(s.date);
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();
                const closed = !!s.closedAt;
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5">
                      <span className="text-gray-800">{date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {isToday && <span className="ml-1.5 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">วันนี้</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">{s.startTime}–{s.endTime}</td>
                    <td className="px-3 py-2.5">
                      {closed ? (
                        <StatusChip variant="closed" />
                      ) : isToday ? (
                        <StatusChip variant="open" />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{s._count.attendances} คน</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex gap-3 justify-end">
                        <Link href={`/teacher/sessions/${s.id}/attendance`} className="text-blue-600 text-xs hover:underline">ดู</Link>
                        {isToday && (
                          closed ? (
                            <button onClick={() => reopenSession(s.id)} className="text-green-600 text-xs hover:underline">เปิด</button>
                          ) : (
                            <button onClick={() => closeSession(s.id)} className="text-red-400 text-xs hover:underline">ปิด</button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
