# Vercel CLIで環境変数を追加する手順

プロジェクトがリンクされたので、環境変数を追加できます。

## 📝 環境変数の追加コマンド

以下のコマンドを**1つずつ**実行してください。各コマンドで値の入力が求められます。

### 1. GOOGLE_SERVICE_ACCOUNT_EMAIL

```bash
cd app
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
```

**入力する値**: サービスアカウントのメールアドレス
- 例: `calendar-sync@your-project-123456.iam.gserviceaccount.com`
- Google Cloud Console → サービスアカウント → メールアドレスをコピー

**プロンプトで選択**:
- `Production` → Enter
- `Preview` → Enter（必要に応じて）
- `Development` → Enter（必要に応じて）

### 2. GOOGLE_SERVICE_ACCOUNT_KEY

```bash
vercel env add GOOGLE_SERVICE_ACCOUNT_KEY production
```

**入力する値**: JSONファイルの`private_key`の値をそのままコピー
- サービスアカウントのJSONファイルを開く
- `private_key`フィールドの値をコピー
- 改行は`\n`のままで問題ありません

**プロンプトで選択**:
- `Production` → Enter
- `Preview` → Enter（必要に応じて）
- `Development` → Enter（必要に応じて）

### 3. GOOGLE_CALENDAR_ID

```bash
vercel env add GOOGLE_CALENDAR_ID production
```

**入力する値**: カレンダーID
- 例: `abc123def456@group.calendar.google.com`
- Googleカレンダー → 設定と共有 → カレンダーの統合 → カレンダーIDをコピー

**プロンプトで選択**:
- `Production` → Enter
- `Preview` → Enter（必要に応じて）
- `Development` → Enter（必要に応じて）

## ✅ 確認

環境変数が正しく設定されたか確認：

```bash
vercel env ls
```

3つの環境変数が表示されれば成功です。

## 🚀 デプロイを再実行

環境変数を設定した後、デプロイを再実行：

```bash
vercel --prod
```

または、GitHubにプッシュして自動デプロイ：

```bash
cd ..
git commit --allow-empty -m "trigger redeploy after env vars"
git push origin main
```

## 📋 環境変数の値の取得方法

### GOOGLE_SERVICE_ACCOUNT_EMAIL
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「IAMと管理」→「サービスアカウント」
4. サービスアカウントをクリック
5. 「メール」フィールドの値をコピー

### GOOGLE_SERVICE_ACCOUNT_KEY
1. サービスアカウントの詳細ページを開く
2. 「キー」タブをクリック
3. 既存のキーがある場合は、JSONファイルをダウンロード
4. JSONファイルを開いて`private_key`フィールドの値をコピー
5. キーがない場合は「鍵を追加」→「新しい鍵を作成」→「JSON」を選択

### GOOGLE_CALENDAR_ID
1. [Google カレンダー](https://calendar.google.com/) を開く
2. 左サイドバーで連携したいカレンダーの「︙（三点メニュー）」をクリック
3. 「設定と共有」を選択
4. 「カレンダーの統合」セクションまでスクロール
5. 「カレンダーID」をコピー


