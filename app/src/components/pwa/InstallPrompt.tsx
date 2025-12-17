"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOS判定
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);

    // スタンドアロンモード（既にインストール済み）かどうか
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // 既にインストール済みの場合は表示しない
    if (standalone) {
      return;
    }

    // Android/Chrome用のインストールプロンプト
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // ローカルストレージで既に表示したかチェック
      const hasShownPrompt = localStorage.getItem("pwa-install-prompt-shown");
      if (!hasShownPrompt) {
        setTimeout(() => setShowPrompt(true), 3000); // 3秒後に表示
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("pwa-install-prompt-shown", "true");
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-prompt-shown", "true");
    setShowPrompt(false);
  };

  // iOS用のインストール手順を表示
  if (isIOS && !isStandalone && showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-slate-900 p-4 text-white shadow-lg md:left-auto md:right-4 md:w-96">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="font-semibold">ホーム画面に追加</p>
            <p className="mt-1 text-sm text-slate-300">
              共有ボタン <span className="font-mono">□↑</span> →
              「ホーム画面に追加」をタップ
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-white"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Android/Chrome用のインストールプロンプト
  if (!isIOS && !isStandalone && deferredPrompt && showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl bg-slate-900 p-4 text-white shadow-lg md:left-auto md:right-4 md:w-96">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="font-semibold">アプリをインストール</p>
            <p className="mt-1 text-sm text-slate-300">
              ホーム画面に追加して、オフラインでも利用できます
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <Download className="h-4 w-4" />
              インストール
            </button>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-slate-400 hover:text-white"
              aria-label="閉じる"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};



