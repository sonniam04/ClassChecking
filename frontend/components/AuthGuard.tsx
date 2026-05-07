"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({
  role,
  children,
}: {
  role: "teacher" | "student";
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(user.role === "teacher" ? "/teacher" : "/student");
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }
  return <>{children}</>;
}
