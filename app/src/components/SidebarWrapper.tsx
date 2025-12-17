"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <main className="ml-64 min-h-screen bg-slate-50">
        {children}
      </main>
    </>
  );
}

