"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AddStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);
  const router = useRouter();

  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [result, setResult] = useState<{ username: string; generatedPassword: string } | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setSaving(true);
    try {
      const res = await api.post(`/courses/${courseId}/students`, { studentId, fullName });
      setResult(res.data);
      setStudentId("");
      setFullName("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md">
      <div className="mb-3">
        <button onClick={() => router.back()} className="text-xs text-gray-400 hover:text-gray-600">← กลับ</button>
        <h1 className="text-lg font-semibold text-gray-800 mt-0.5">เพิ่มนักศึกษา</h1>
      </div>
      <form onSubmit={handleSubmit} className="border border-gray-200 rounded-md p-4 bg-white space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">รหัสนักศึกษา</label>
          <input
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="เช่น 660710586"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อ-นามสกุล</label>
          <input
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ชื่อ นามสกุล"
            required
          />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        {result && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs">
            <p className="font-medium text-gray-700 mb-1.5">เพิ่มนักศึกษาสำเร็จ</p>
            <p className="text-gray-600">Username: <span className="font-mono font-semibold text-gray-800">{result.username}</span></p>
            <p className="text-gray-600">Password: <span className="font-mono font-semibold text-gray-800">{result.generatedPassword}</span></p>
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gray-900 hover:bg-gray-700 text-white py-2 rounded text-sm font-medium disabled:opacity-40 transition"
        >
          {saving ? "กำลังเพิ่ม..." : "เพิ่มนักศึกษา"}
        </button>
      </form>
    </div>
  );
}
