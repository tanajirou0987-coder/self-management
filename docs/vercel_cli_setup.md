# Vercel CLIで環境変数を設定する方法

Vercelダッシュボードで環境変数が見つからない場合、CLIを使用して設定できます。

## 🚀 手順

### 1. Vercel CLIでログイン

```bash
cd app
vercel login
```

### 2. プロジェクトをリンク（初回のみ）

```bash
vercel link
```

- プロジェクトを選択するか、新規作成
- 既存のプロジェクトがある場合は選択

### 3. 環境変数を追加

以下のコマンドを実行して、対話形式で環境変数を追加します：

```bash
# GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production

# GOOGLE_SERVICE_ACCOUNT_KEY
vercel env add GOOGLE_SERVICE_ACCOUNT_KEY production

# GOOGLE_CALENDAR_ID
vercel env add GOOGLE_CALENDAR_ID production
```

各コマンドを実行すると：
1. 環境変数の値を入力するよう求められます
2. 値を貼り付けてEnter
3. 適用する環境（Production/Preview/Development）を選択

### 4. 環境変数の確認

```bash
vercel env ls
```

設定した環境変数が表示されます。

### 5. デプロイを再実行

環境変数を設定した後、デプロイを再実行：

```bash
vercel --prod
```

または、GitHubにプッシュして自動デプロイをトリガー：

```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

## 📝 環境変数の値の取得方法

### GOOGLE_SERVICE_ACCOUNT_EMAIL
- Google Cloud Console → サービスアカウント → メールアドレスをコピー
- 例: `calendar-sync@your-project-123456.iam.gserviceaccount.com`

### GOOGLE_SERVICE_ACCOUNT_KEY
- サービスアカウントのJSONファイルを開く
- `private_key`フィールドの値をそのままコピー
- 改行は`\n`のまま（CLIでは自動的に処理されます）

### GOOGLE_CALENDAR_ID
- Googleカレンダー → 設定と共有 → カレンダーの統合 → カレンダーIDをコピー
- 例: `abc123def456@group.calendar.google.com`

## ⚠️ 注意事項

- `GOOGLE_SERVICE_ACCOUNT_KEY`は長い文字列なので、コピー&ペースト時に注意
- 改行は`\n`のままで問題ありません
- 環境変数を設定した後、必ずデプロイを再実行してください



