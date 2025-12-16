# Vercelプロジェクトの統合とクリーンアップ

2つのプロジェクト（`app`と`self-management-app`）を1つに統合する手順です。

## 📋 現在の状況

- **`self-management-app`**: GitHubから自動デプロイされているメインプロジェクト（`https://self-management-app.vercel.app`）
- **`app`**: CLIで作成されたプロジェクト（環境変数は設定済みだが、GitHub連携なし）

## ✅ 統合手順

### 1. self-management-appに環境変数を設定

現在、`self-management-app`プロジェクトにリンクされているので、環境変数を追加：

```bash
cd app

# GOOGLE_SERVICE_ACCOUNT_EMAIL
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production

# GOOGLE_SERVICE_ACCOUNT_KEY
vercel env add GOOGLE_SERVICE_ACCOUNT_KEY production

# GOOGLE_CALENDAR_ID
vercel env add GOOGLE_CALENDAR_ID production
```

### 2. 環境変数の確認

```bash
vercel env ls
```

3つの環境変数が表示されれば成功です。

### 3. 不要なプロジェクト（app）を削除

**⚠️ 注意**: 削除する前に、`self-management-app`に環境変数が正しく設定されていることを確認してください。

#### 方法1: Vercelダッシュボードから削除

1. https://vercel.com/dashboard にアクセス
2. プロジェクト一覧から「app」をクリック
3. 「Settings」タブを開く
4. ページの最下部までスクロール
5. 「Delete Project」セクションで「Delete」をクリック
6. プロジェクト名を入力して確認

#### 方法2: Vercel CLIから削除（推奨）

```bash
# appプロジェクトにリンク
vercel link --project=app --yes

# プロジェクトを削除
vercel remove app --yes
```

### 4. デプロイを再実行

環境変数を設定した後、デプロイを再実行：

```bash
vercel --prod
```

または、GitHubにプッシュして自動デプロイ：

```bash
cd ..
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

## 🔍 確認

1. `https://self-management-app.vercel.app` にアクセス
2. ログインしてダッシュボードを開く
3. 「同期」ボタンをクリック
4. Googleカレンダーの予定が表示されれば成功！

## 📝 注意事項

- プロジェクトを削除すると、そのプロジェクトのデプロイ履歴も削除されます
- 環境変数はプロジェクトごとに設定されるため、削除前に必ず`self-management-app`に環境変数を設定してください
- GitHub連携は`self-management-app`プロジェクトに設定されているので、このプロジェクトを残してください


