"use client";

import { useEffect } from "react";

export const ServiceWorkerRegister = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = async () => {
        try {
          await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
        } catch (error) {
          console.error("Service worker registration failed:", error);
        }
      };
      register();
    }
  }, []);

  return null;
};
