"use client";
import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { StatusChip, StatusVariant } from "@/components/Chip";

interface Session {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  closedAt: string | null;
  canCheckIn: boolean;
  alreadyCheckedIn: boolean;
  attendanceStatus: "present" | "late" | null;
}

interface ScoreData {
  score: number;
  absentCount: number;
  lateCount: number;
  totalSessions: number;
  noExamRight: boolean;
}

export default function StudentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);

  const [courseName, setCourseName] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const [message, setMessage] = useState<{ id: number; text: string; ok: boolean } | null>(null);

  const fetchData = useCallback(() => {
    return Promise.all([
      api.get(`/student/courses/${courseId}/sessions`),
      api.get(`/student/courses/${courseId}/score`),
      courseName ? Promise.resolve(null) : api.get(`/student/courses`),
    ]).then(([sessionsRes, scoreRes, coursesRes]) => {
      setSessions(sessionsRes.data);
      setScoreData(scoreRes.data);
      if (coursesRes) {
        const course = coursesRes.data.find((c: { id: number; name: string }) => c.id === courseId);
        if (course) setCourseName(course.name);
      }
    });
  }, [courseId, courseName]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleCheckIn(sessionId: number) {
    setCheckingIn(sessionId);
    setMessage(null);
    try {
      await api.post(`/student/sessions/${sessionId}/checkin`);
      setMessage({ id: sessionId, text: "เช็คชื่อสำเร็จ!", ok: true });
      fetchData();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "เกิดข้อผิดพลาด";
      setMessage({ id: sessionId, text: msg, ok: false });
    } finally {
      setCheckingIn(null);
    }
  }

  function getSessionStatus(s: Session) {
    const today = new Date();
    const sessionDate = new Date(s.date);
    const isToday = today.toDateString() === sessionDate.toDateString();
    if (s.alreadyCheckedIn) return s.attendanceStatus === "late" ? "late" : "checked";
    if (s.closedAt) return "closed";
    if (!isToday) return sessionDate > today ? "upcoming" : "past";
    if (s.canCheckIn) return "open";
    return "waiting";
  }

  if (loading) return <p className="text-sm text-gray-400">กำลังโหลด...</p>;

  return (
    <div>
      <div className="mb-3">
        <Link href="/student" className="text-xs text-gray-400 hover:text-gray-600">← กลับ</Link>
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-semibold text-gray-800">{courseName || "..."}</h1>
            <span className="text-xs text-gray-400">รีเฟรชทุก 30 วินาที</span>
          </div>
          {scoreData && (
            <div className="flex items-center gap-3">
              {scoreData.noExamRight && (
                <StatusChip variant="noexam" />
              )}
              <div className="text-right">
                <span className={`text-xl font-bold tabular-nums ${scoreData.score < 8 ? "text-red-500" : scoreData.score < 9.5 ? "text-yellow-600" : "text-green-700"}`}>
                  {scoreData.score}
                </span>
                <span className="text-xs text-gray-400 ml-1">/ 10</span>
              </div>
              <div className="text-xs text-gray-400 leading-tight">
                <div>ขาด {scoreData.absentCount} คาบ</div>
                <div>สาย {scoreData.lateCount} คาบ</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden divide-y divide-gray-100">
        {sessions.map((s) => {
          const status = getSessionStatus(s);
          return (
            <div key={s.id} className="bg-white px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(s.date).toLocaleDateString("th-TH", { dateStyle: "long" })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{s.startTime} – {s.endTime}</p>
                {message?.id === s.id && (
                  <p className={`text-xs mt-1 ${message.ok ? "text-green-600" : "text-red-500"}`}>{message.text}</p>
                )}
              </div>
              <div className="flex items-center gap-3 ml-4">
                <StatusChip variant={status as StatusVariant} />
                {status === "open" && (
                  <button
                    onClick={() => handleCheckIn(s.id)}
                    disabled={checkingIn === s.id}
                    className="bg-gray-900 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded font-medium disabled:opacity-40 transition"
                  >
                    {checkingIn === s.id ? "กำลังเช็ค..." : "เช็คชื่อ"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
