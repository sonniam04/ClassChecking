"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { StatusChip } from "@/components/Chip";

interface AttendanceRecord {
  id: number;
  checkedInAt: string;
  status: string;
  session: {
    date: string;
    startTime: string;
    endTime: string;
    course: { id: number; name: string };
  };
}

export default function HistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/attendance").then((r) => setRecords(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-lg font-semibold text-gray-800 mb-3">ประวัติการเช็คชื่อ</h1>
      {loading ? (
        <p className="text-sm text-gray-400">กำลังโหลด...</p>
      ) : records.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">ยังไม่มีประวัติการเช็คชื่อ</p>
      ) : (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-3 py-2">วิชา</th>
                <th className="text-left px-3 py-2">วันที่</th>
                <th className="text-left px-3 py-2">คาบเรียน</th>
                <th className="text-left px-3 py-2">เวลาเช็คชื่อ</th>
                <th className="text-left px-3 py-2">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium text-gray-800">{r.session.course.name}</td>
                  <td className="px-3 py-2.5 text-gray-600">
                    {new Date(r.session.date).toLocaleDateString("th-TH", { dateStyle: "medium" })}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{r.session.startTime}–{r.session.endTime}</td>
                  <td className="px-3 py-2.5 text-gray-500">
                    {new Date(r.checkedInAt).toLocaleTimeString("th-TH")}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusChip variant="present" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
