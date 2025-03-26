import type React from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <main className="flex-1 container py-8 px-6 md:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
