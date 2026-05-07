import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="teacher">
      <Navbar />
      <main className="px-8 py-4">{children}</main>
    </AuthGuard>
  );
}
