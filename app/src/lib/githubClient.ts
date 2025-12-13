"use client";

import type { GitHubIssue } from "@/types/dashboard";

export const fetchGitHubIssues = async () => {
    try {
        const response = await fetch("/api/github/sync");
        const payload = (await response.json().catch(() => ({}))) as {
            issues?: GitHubIssue[];
            message?: string;
        };
        if (!response.ok) {
            // Suppress error if just unconfigured
            if (response.status === 401) {
                return [];
            }
            throw new Error(payload?.message ?? "GitHub 同期に失敗しました");
        }
        return payload.issues ?? [];
    } catch (error) {
        console.warn("GitHub sync failed:", error);
        return [];
    }
};
