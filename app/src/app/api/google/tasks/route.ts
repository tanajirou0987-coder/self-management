import { NextRequest } from "next/server";
import { google } from "googleapis";

const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

const missingCredentials = !serviceAccountEmail || !serviceAccountKey;

const getTasksClient = () => {
    // private_keyの処理: 様々な形式に対応
    let processedKey = serviceAccountKey!;
    
    // 1. 前後の余分な空白やクォートを削除（最初に実行）
    processedKey = processedKey.trim().replace(/^["']|["']$/g, "");
    
    // 2. 実際の改行を\nに統一（Windows形式の改行も対応）
    processedKey = processedKey.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    
    // 3. \\nを\nに変換（エスケープされた改行）
    // 複数回実行して、ネストされたエスケープにも対応
    while (processedKey.includes("\\n")) {
        processedKey = processedKey.replace(/\\n/g, "\n");
    }
    
    // 4. 連続する改行を1つに統一（念のため）
    processedKey = processedKey.replace(/\n{3,}/g, "\n\n");
    
    // 5. 秘密鍵の開始・終了マーカーを確認
    if (!processedKey.includes("-----BEGIN PRIVATE KEY-----")) {
        throw new Error("Invalid private key format: missing BEGIN marker");
    }
    if (!processedKey.includes("-----END PRIVATE KEY-----")) {
        throw new Error("Invalid private key format: missing END marker");
    }
    
    const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: processedKey,
        scopes: ["https://www.googleapis.com/auth/tasks"],
    });
    return google.tasks({ version: "v1", auth });
};

export async function GET(request: NextRequest) {
    const date = request.nextUrl.searchParams.get("date");
    if (!date) {
        return Response.json({ message: "date クエリが必要です" }, { status: 400 });
    }

    if (missingCredentials) {
        return Response.json({
            tasks: [],
            message:
                "Google Tasks 連携の資格情報(GOOGLE_SERVICE_ACCOUNT_*)が設定されていません。",
        });
    }

    try {
        const tasksApi = getTasksClient();

        // Get all task lists
        const taskListsResponse = await tasksApi.tasklists.list();
        const taskLists = taskListsResponse.data.items ?? [];

        // Fetch tasks from all lists
        const allTasks: Array<{
            id: string;
            title: string;
            notes?: string;
            due?: string;
            status: "needsAction" | "completed";
            listName: string;
            listId: string;
        }> = [];

        for (const list of taskLists) {
            if (!list.id) continue;

            const tasksResponse = await tasksApi.tasks.list({
                tasklist: list.id,
                showCompleted: true,
                showHidden: true,
            });

            const tasks = tasksResponse.data.items ?? [];

            for (const task of tasks) {
                if (!task.id || !task.title) continue;

                // Filter tasks by due date if provided
                const taskDueDate = task.due ? task.due.split("T")[0] : null;

                // Include tasks that are due on the requested date OR have no due date
                if (taskDueDate === date || !taskDueDate) {
                    allTasks.push({
                        id: task.id,
                        title: task.title,
                        notes: task.notes ?? undefined,
                        due: task.due ?? undefined,
                        status: task.status as "needsAction" | "completed",
                        listName: list.title ?? "タスク",
                        listId: list.id,
                    });
                }
            }
        }

        return Response.json({ tasks: allTasks });
    } catch (error) {
        console.error("Google Tasks sync failed", error);
        return Response.json(
            {
                message:
                    "Google Tasks 連携で問題が発生しました。認証設定を再確認してください。",
                tasks: [],
            },
            { status: 500 },
        );
    }
}

// Create a new task
export async function POST(request: NextRequest) {
    if (missingCredentials) {
        return Response.json(
            { message: "Google Tasks 連携の資格情報が設定されていません。" },
            { status: 400 },
        );
    }

    try {
        const body = await request.json();
        const { title, notes, due, listId } = body;

        if (!title) {
            return Response.json(
                { message: "title は必須です。" },
                { status: 400 },
            );
        }

        const tasksApi = getTasksClient();

        // Get the first task list if listId is not provided
        let targetListId = listId;
        if (!targetListId) {
            const taskListsResponse = await tasksApi.tasklists.list();
            const taskLists = taskListsResponse.data.items ?? [];
            if (taskLists.length === 0) {
                return Response.json(
                    { message: "タスクリストが見つかりません。" },
                    { status: 400 },
                );
            }
            targetListId = taskLists[0].id;
        }

        const result = await tasksApi.tasks.insert({
            tasklist: targetListId!,
            requestBody: {
                title,
                notes,
                due: due ? new Date(due).toISOString() : undefined,
            },
        });

        return Response.json({
            success: true,
            task: {
                id: result.data.id,
                title: result.data.title,
                status: result.data.status,
                listId: targetListId,
            },
        });
    } catch (error) {
        console.error("Failed to create task", error);
        return Response.json(
            { message: "タスクの作成に失敗しました。" },
            { status: 500 },
        );
    }
}

// Mark task as completed or update task
export async function PATCH(request: NextRequest) {
    if (missingCredentials) {
        return Response.json(
            { message: "Google Tasks 連携の資格情報が設定されていません。" },
            { status: 400 },
        );
    }

    try {
        const body = await request.json();
        const { taskId, listId, status } = body;

        if (!taskId || !listId) {
            return Response.json(
                { message: "taskId と listId は必須です。" },
                { status: 400 },
            );
        }

        const tasksApi = getTasksClient();
        const result = await tasksApi.tasks.patch({
            tasklist: listId,
            task: taskId,
            requestBody: {
                status: status ?? "completed",
            },
        });

        return Response.json({
            success: true,
            task: {
                id: result.data.id,
                status: result.data.status,
            },
        });
    } catch (error) {
        console.error("Failed to update task", error);
        return Response.json(
            { message: "タスクの更新に失敗しました。" },
            { status: 500 },
        );
    }
}

// Delete a task
export async function DELETE(request: NextRequest) {
    if (missingCredentials) {
        return Response.json(
            { message: "Google Tasks 連携の資格情報が設定されていません。" },
            { status: 400 },
        );
    }

    try {
        const taskId = request.nextUrl.searchParams.get("taskId");
        const listId = request.nextUrl.searchParams.get("listId");

        if (!taskId || !listId) {
            return Response.json(
                { message: "taskId と listId は必須です。" },
                { status: 400 },
            );
        }

        const tasksApi = getTasksClient();
        await tasksApi.tasks.delete({
            tasklist: listId,
            task: taskId,
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error("Failed to delete task", error);
        return Response.json(
            { message: "タスクの削除に失敗しました。" },
            { status: 500 },
        );
    }
}
