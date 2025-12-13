import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "自己管理ダッシュボード",
    short_name: "自己管理",
    description:
      "予定・タスク・振り返り・翌日の目標をまとめて管理できる自己管理アプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    orientation: "portrait",
    icons: [
      {
        src: "/app-icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        src: "/pwa-icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        src: "/pwa-icon-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  };
}
