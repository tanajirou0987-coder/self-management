# VercelでのGoogle連携設定ガイド

Vercelにデプロイした際にGoogle連携が切れる場合の対処法です。

## 🔍 問題の原因

Vercelでは、ローカルの`.env.local`ファイルは使用されません。環境変数をVercelダッシュボードで設定する必要があります。

## ✅ 解決方法

### 1. Vercelダッシュボードで環境変数を設定

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard にログイン
   - プロジェクト「self-management-app」を選択

2. **Settings → Environment Variables を開く**

3. **以下の環境変数を追加：**

   #### Google Calendar連携用
   
   **① `GOOGLE_SERVICE_ACCOUNT_EMAIL`**
   - Key: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Value: サービスアカウントのメールアドレス（例: `calendar-sync@your-project.iam.gserviceaccount.com`）
   - Environment: Production, Preview, Development すべてにチェック

   **② `GOOGLE_SERVICE_ACCOUNT_KEY`**
   - Key: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Value: サービスアカウントの秘密鍵（JSONファイルの`private_key`の値）
     ```
     -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
     ```
   - ⚠️ **重要**: 改行は`\n`のまま入力してください
   - Environment: Production, Preview, Development すべてにチェック

   **③ `GOOGLE_CALENDAR_ID`**
   - Key: `GOOGLE_CALENDAR_ID`
   - Value: カレンダーID（例: `xxxxx@group.calendar.google.com`）
   - Environment: Production, Preview, Development すべてにチェック

### 2. Google Cloud Consoleでの確認

#### Google Calendar APIの有効化確認

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. **「APIとサービス」** → **「有効なAPI」** を確認
4. **「Google Calendar API」** が有効になっているか確認
5. 有効でない場合は、**「APIとサービス」** → **「ライブラリ」** から有効化

#### Google Tasks APIの有効化確認

1. **「APIとサービス」** → **「ライブラリ」** を開く
2. **「Google Tasks API」** を検索
3. **「有効にする」** をクリック

### 3. サービスアカウントの権限確認

1. [Google カレンダー](https://calendar.google.com/) を開く
2. 連携したいカレンダーの **︙（三点メニュー）** → **「設定と共有」**
3. **「特定のユーザーまたはグループと共有する」** セクションで、サービスアカウントのメールアドレスが追加されているか確認
4. 権限が **「予定の表示（すべての予定の詳細）」** 以上になっているか確認

### 4. デプロイの再実行

環境変数を設定した後：

1. **最新のデプロイを「Redeploy」** するか
2. **新しいコミットをプッシュ** して自動デプロイをトリガー

### 5. 動作確認

1. VercelのURLにアクセス
2. ログインしてダッシュボードを開く
3. 「今日の予定とカレンダータスク」セクションの **「同期」ボタン** をクリック
4. Googleカレンダーの予定が表示されれば成功！

## 🐛 トラブルシューティング

### エラー: "Google カレンダー連携の資格情報が設定されていません"

**原因**: 環境変数が設定されていない、または正しく読み込まれていない

**解決方法**:
1. Vercelダッシュボードで環境変数が正しく設定されているか確認
2. 環境変数の値に余分なスペースや引用符がないか確認
3. デプロイを再実行

### エラー: "Google カレンダー連携で問題が発生しました"

**原因**: 認証エラーまたは権限不足

**解決方法**:
1. サービスアカウントのメールアドレスが正しいか確認
2. カレンダーにサービスアカウントが共有されているか確認
3. Google Calendar APIが有効になっているか確認
4. サービスアカウントのキーが正しく設定されているか確認（改行が`\n`になっているか）

### Google Tasksが表示されない

**原因**: Google Tasks APIが有効になっていない

**解決方法**:
1. Google Cloud Consoleで **「Google Tasks API」** を有効化
2. 環境変数が正しく設定されているか確認
3. デプロイを再実行

## 📝 環境変数の設定例

Vercelダッシュボードで設定する際の例：

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=calendar-sync@your-project-123456.iam.gserviceaccount.com

GOOGLE_SERVICE_ACCOUNT_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n

GOOGLE_CALENDAR_ID=abc123def456@group.calendar.google.com
```

⚠️ **注意**: `GOOGLE_SERVICE_ACCOUNT_KEY`の値は、JSONファイルの`private_key`フィールドの値をそのままコピーしてください。改行は`\n`のままで問題ありません。

## 🔐 セキュリティのベストプラクティス

- 環境変数はVercelダッシュボードでのみ管理し、GitHubにはコミットしない
- サービスアカウントのキーは定期的にローテーションする
- 本番環境と開発環境で異なるサービスアカウントを使用することを推奨


