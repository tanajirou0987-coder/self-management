"use client";

import { useEffect, useState, type ReactNode } from "react";

export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setHasMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!hasMounted) {
        return fallback;
    }

    return <>{children}</>;
}
