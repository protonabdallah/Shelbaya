import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await isAuthenticated();

  if (!auth) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
