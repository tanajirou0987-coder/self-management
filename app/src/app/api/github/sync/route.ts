import { NextResponse } from "next/server";
import { Octokit } from "octokit";

export async function GET() {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        return NextResponse.json(
            { message: "GitHub token not configured" },
            { status: 401 }
        );
    }

    const octokit = new Octokit({ auth: token });

    try {
        // 1. Get issues assigned to the user
        const issues = await octokit.rest.issues.list({
            filter: "assigned",
            state: "open",
        });

        // 2. Get PRs where user is requested for review
        // Search query: type:pr state:open review-requested:@me
        // Note: This requires the search API
        const reviews = await octokit.rest.search.issuesAndPullRequests({
            q: "type:pr state:open review-requested:@me",
        });

        const formattedIssues = [
            ...issues.data.map((issue) => ({
                id: issue.id,
                number: issue.number,
                title: issue.title,
                url: issue.html_url,
                repository: issue.repository?.full_name ?? "unknown",
                status: issue.state,
                type: issue.pull_request ? "pr" : "issue",
            })),
            ...reviews.data.items.map((item) => ({
                id: item.id,
                number: item.number,
                title: item.title,
                url: item.html_url,
                repository: "unknown", // Search result structure is different
                status: item.state,
                type: "pr",
            })),
        ];

        // Remove duplicates (in case assigned AND review requested)
        const uniqueIssues = Array.from(
            new Map(formattedIssues.map((item) => [item.id, item])).values()
        );

        return NextResponse.json({ issues: uniqueIssues });
    } catch (error) {
        console.error("GitHub API Error:", error);
        return NextResponse.json(
            { message: "Failed to fetch GitHub data" },
            { status: 500 }
        );
    }
}
