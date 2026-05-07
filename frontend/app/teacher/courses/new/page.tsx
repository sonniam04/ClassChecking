"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

const DAYS = [
  { label: "อาทิตย์", value: 0 },
  { label: "จันทร์", value: 1 },
  { label: "อังคาร", value: 2 },
  { label: "พุธ", value: 3 },
  { label: "พฤหัสบดี", value: 4 },
  { label: "ศุกร์", value: 5 },
  { label: "เสาร์", value: 6 },
];

interface TimeSlot { startTime: string; endTime: string }
type ScheduleMap = Record<number, TimeSlot[]>;

export default function CreateCoursePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedules, setSchedules] = useState<ScheduleMap>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleDay(day: number) {
    setSchedules((prev) => {
      const next = { ...prev };
      if (next[day]) delete next[day];
      else next[day] = [{ startTime: "09:00", endTime: "10:30" }];
      return next;
    });
  }

  function addSlot(day: number) {
    setSchedules((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { startTime: "09:00", endTime: "10:30" }],
    }));
  }

  function removeSlot(day: number, idx: number) {
    setSchedules((prev) => {
      const slots = prev[day].filter((_, i) => i !== idx);
      if (slots.length === 0) {
        const next = { ...prev };
        delete next[day];
        return next;
      }
      return { ...prev, [day]: slots };
    });
  }

  function updateSlot(day: number, idx: number, field: keyof TimeSlot, value: string) {
    setSchedules((prev) => ({
      ...prev,
      [day]: prev[day].map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const flat = Object.entries(schedules).flatMap(([day, slots]) =>
      slots.map((s) => ({ dayOfWeek: Number(day), ...s }))
    );
    if (flat.length === 0) return setError("กรุณาเลือกวันเรียนอย่างน้อย 1 วัน");
    setSaving(true);
    try {
      await api.post("/courses", { name, startDate, endDate, schedules: flat });
      router.push("/teacher");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-3">
        <Link href="/teacher" className="text-xs text-gray-400 hover:text-gray-600">← กลับ</Link>
        <h1 className="text-lg font-semibold text-gray-800 mt-0.5">สร้างวิชาใหม่</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 border border-gray-200 rounded-md p-4 bg-white">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อวิชา</label>
          <input
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น CS101 Introduction to Programming"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันเริ่มสอน</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">วันสุดท้าย</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">ตารางเรียน</label>
          <div className="space-y-1">
            {DAYS.map((d) => (
              <div key={d.value}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!schedules[d.value]}
                    onChange={() => toggleDay(d.value)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{d.label}</span>
                </label>
                {schedules[d.value] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {schedules[d.value].map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(d.value, idx, "startTime", e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 text-sm"
                        />
                        <span className="text-gray-300 text-xs">–</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(d.value, idx, "endTime", e.target.value)}
                          className="border border-gray-200 rounded px-2 py-1 text-sm"
                        />
                        {schedules[d.value].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(d.value, idx)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            ลบ
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addSlot(d.value)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      + เพิ่ม session
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded text-sm font-medium disabled:opacity-40 transition"
          >
            {saving ? "กำลังสร้าง..." : "สร้างวิชา"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-200 text-gray-600 px-5 py-2 rounded text-sm hover:bg-gray-50 transition"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
