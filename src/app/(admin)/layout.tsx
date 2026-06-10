import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,var(--background),color-mix(in_oklch,var(--background),var(--muted)_45%))] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
