import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="student">
      <Navbar />
      <main className="px-8 py-4">{children}</main>
    </AuthGuard>
  );
}
