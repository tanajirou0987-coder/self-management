"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getCurrentAppDate } from "@/lib/dateFormatting";
import { useDashboardSnapshot } from "@/hooks/useDashboardSnapshot";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

export function EventsPage() {
  const [initialDate, setInitialDate] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setInitialDate(getCurrentAppDate()), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!initialDate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">読み込んでいます...</p>
      </div>
    );
  }

  return <EventsPageContent initialDate={initialDate} />;
}

function EventsPageContent({ initialDate }: { initialDate: string }) {
  const {
    snapshot,
    selectedDate,
    syncGoogleCalendar,
  } = useDashboardSnapshot(initialDate);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStart, setNewEventStart] = useState("");
  const [newEventEnd, setNewEventEnd] = useState("");

  const formattedDate = format(new Date(selectedDate), "yyyy年MM月dd日 (E)", { locale: ja });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventStart || !newEventEnd) return;
    try {
      const { createGoogleEvent } = await import("@/lib/googleClient");
      await createGoogleEvent({
        title: newEventTitle.trim(),
        start: new Date(`${selectedDate}T${newEventStart}`).toISOString(),
        end: new Date(`${selectedDate}T${newEventEnd}`).toISOString(),
      });
      setNewEventTitle("");
      setNewEventStart("");
      setNewEventEnd("");
      syncGoogleCalendar();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">予定管理</h1>
        
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">{formattedDate}</h2>
          
          <form onSubmit={handleAddEvent} className="mb-6 space-y-3">
            <input
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="予定を追加..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-slate-900"
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={newEventStart}
                onChange={(e) => setNewEventStart(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-slate-900"
                placeholder="開始"
              />
              <input
                type="time"
                value={newEventEnd}
                onChange={(e) => setNewEventEnd(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-slate-900"
                placeholder="終了"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              予定を追加
            </button>
          </form>

          <div className="space-y-3">
            {snapshot.events.length === 0 ? (
              <p className="text-center text-slate-500">予定がありません</p>
            ) : (
              snapshot.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 p-4"
                >
                  <div className="rounded-xl bg-slate-900/5 p-3">
                    <CalendarIcon className="h-5 w-5 text-slate-900" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{event.title}</p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(event.start), "HH:mm")} - {format(new Date(event.end), "HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

