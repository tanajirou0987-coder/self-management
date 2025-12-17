"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Calendar,
  CheckSquare,
  Home,
  Target,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const navigationItems = [
  { href: "/", label: "ダッシュボード", icon: Home },
  { href: "/tasks", label: "タスク", icon: CheckSquare },
  { href: "/events", label: "予定", icon: Calendar },
  { href: "/goals", label: "目標", icon: Target },
  { href: "/reflection", label: "振り返り", icon: FileText },
  { href: "/settings", label: "設定", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 z-50 w-64 overflow-y-auto border-r border-slate-200 bg-white shadow-lg"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "256px",
        zIndex: 50,
        backgroundColor: "white",
      }}
    >
      <div className="flex h-full flex-col p-6">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-slate-900">自己管理アプリ</h1>
        </div>

        {/* ナビゲーションメニュー */}
        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ログアウトボタン */}
        <div className="mt-auto pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut className="h-5 w-5" />
            ログアウト
          </button>
        </div>
      </div>
    </aside>
  );
}

