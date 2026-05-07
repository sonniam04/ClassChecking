"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link
          href={user?.role === "teacher" ? "/teacher" : "/student"}
          className="font-semibold text-gray-800 text-sm tracking-tight whitespace-nowrap"
        >
          เช็คชื่อ
        </Link>
        {user?.role === "teacher" && (
          <Link href="/teacher" className="text-xs text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap">
            รายวิชา
          </Link>
        )}
        {user?.role === "student" && (
          <>
            <Link href="/student" className="text-xs text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap">
              วิชาของฉัน
            </Link>
            <Link href="/student/history" className="text-xs text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap">
              ประวัติ
            </Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 whitespace-nowrap">{user?.fullName}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-300 hover:text-gray-500 transition-colors whitespace-nowrap"
        >
          ออกจากระบบ
        </button>
      </div>
    </nav>
  );
}
