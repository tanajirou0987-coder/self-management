"use client";

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import QRCode from "qrcode";

export const QRCodeGenerator = () => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (showQR && typeof window !== "undefined") {
      const currentUrl = window.location.origin;
      QRCode.toDataURL(currentUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QRコード生成エラー:", err));
    }
  }, [showQR]);

  if (!showQR) {
    return (
      <button
        onClick={() => setShowQR(true)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        title="QRコードを表示"
      >
        <QrCode className="h-4 w-4" />
        QRコード
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">QRコード</h3>
          <button
            onClick={() => {
              setShowQR(false);
              setQrDataUrl(null);
            }}
            className="text-slate-400 hover:text-slate-900"
          >
            ✕
          </button>
        </div>
        {qrDataUrl ? (
          <div className="flex flex-col items-center gap-4">
            <img src={qrDataUrl} alt="QR Code" className="rounded-2xl border-4 border-white shadow-lg" />
            <p className="text-sm text-slate-600">
              このQRコードをスキャンして<br />
              スマホでアプリにアクセス
            </p>
            <a
              href={typeof window !== "undefined" ? window.location.origin : ""}
              className="text-sm text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {typeof window !== "undefined" ? window.location.origin : ""}
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>
        )}
      </div>
    </div>
  );
};

