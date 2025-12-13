"use client";

import { useEffect, useState } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        読み込み中...
      </main>
    );
  }

  return <Dashboard />;
}
