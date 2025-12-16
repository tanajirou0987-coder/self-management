# Vercelでの環境変数設定ガイド（詳細版）

Vercelダッシュボードで環境変数を設定する手順を詳しく説明します。

## 📍 環境変数設定画面へのアクセス方法

### 方法1: プロジェクト設定から

1. **Vercelダッシュボードにログイン**
   - https://vercel.com/dashboard にアクセス
   - ログイン（GitHubアカウントでログイン）

2. **プロジェクトを選択**
   - ダッシュボードのプロジェクト一覧から「self-management-app」をクリック

3. **Settingsタブを開く**
   - プロジェクトページの上部にあるタブから「Settings」をクリック
   - もし「Settings」が見つからない場合は、プロジェクト名の横にある「...」メニューから「Settings」を選択

4. **Environment Variablesセクションを探す**
   - Settingsページを下にスクロール
   - 左サイドバーに「Environment Variables」がある場合、それをクリック
   - または、Settingsページ内で「Environment Variables」セクションを探す

### 方法2: プロジェクトメニューから

1. **プロジェクトページを開く**
2. **右上の「Settings」ボタンをクリック**
3. **左サイドバーの「Environment Variables」をクリック**

### 方法3: 直接URLでアクセス

プロジェクトのURLが分かっている場合：
```
https://vercel.com/[your-team]/self-management-app/settings/environment-variables
```

## 🔧 環境変数の追加方法

1. **「Add New」または「+ Add」ボタンをクリック**

2. **以下の3つの環境変数を追加：**

   ### ① GOOGLE_SERVICE_ACCOUNT_EMAIL
   - **Key**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - **Value**: サービスアカウントのメールアドレス
     - 例: `calendar-sync@your-project-123456.iam.gserviceaccount.com`
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - 「Add」をクリック

   ### ② GOOGLE_SERVICE_ACCOUNT_KEY
   - **Key**: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - **Value**: JSONファイルの`private_key`の値をそのままコピー
     ```
     -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
     ```
   - ⚠️ **重要**: 
     - 改行は`\n`のまま入力してください
     - 引用符（`"`）は不要です
     - 最初と最後の空白を削除してください
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - 「Add」をクリック

   ### ③ GOOGLE_CALENDAR_ID
   - **Key**: `GOOGLE_CALENDAR_ID`
   - **Value**: カレンダーID
     - 例: `abc123def456@group.calendar.google.com`
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - 「Add」をクリック

## 🔍 設定が確認できない場合

### Vercel CLIを使用する方法

もしダッシュボードで設定できない場合は、Vercel CLIを使用できます：

```bash
# Vercel CLIをインストール（まだの場合）
npm install -g vercel

# ログイン
vercel login

# プロジェクトディレクトリに移動
cd app

# 環境変数を設定
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
vercel env add GOOGLE_SERVICE_ACCOUNT_KEY production
vercel env add GOOGLE_CALENDAR_ID production
```

### 確認方法

環境変数が正しく設定されているか確認：

```bash
# 環境変数を確認
vercel env ls
```

## 📝 設定後の確認

1. **環境変数を設定した後、必ずデプロイを再実行**
   - 最新のデプロイを「Redeploy」するか
   - 新しいコミットをプッシュ

2. **デバッグエンドポイントで確認**
   - `https://your-app.vercel.app/api/google/debug` にアクセス
   - 環境変数が正しく設定されているか確認

## 🆘 それでも見つからない場合

1. **Vercelのプラン確認**
   - 無料プランでも環境変数は設定可能です
   - プロジェクトが正しく作成されているか確認

2. **プロジェクトの権限確認**
   - プロジェクトのオーナーまたはメンバーである必要があります

3. **Vercelサポートに問い合わせ**
   - https://vercel.com/support から問い合わせ可能

4. **代替方法: Vercel CLIを使用**
   - 上記のCLIコマンドを使用して環境変数を設定


