# なぜ複数のVercelプロジェクトが作成されたのか

## 📋 現在のプロジェクト一覧

1. **`self-management-app`** - `https://self-management-app.vercel.app` (42分前に更新)
2. **`app`** - `https://app-neon-sigma-85.vercel.app` (1時間前に更新)
3. **`self-management-app-84ui`** - `https://self-management-app-84ui.vercel.app` (2時間前に更新)

## 🔍 作成された理由

### 1. `self-management-app`（メインプロジェクト）
- **作成理由**: GitHubリポジトリをVercelに連携したときに自動的に作成された
- **特徴**: GitHubから自動デプロイされる
- **状態**: ✅ **これを残すべき**

### 2. `app`（不要なプロジェクト）
- **作成理由**: CLIで`vercel`コマンドや`vercel link`を実行したときに作成された可能性がある
- **特徴**: GitHub連携なし、手動デプロイのみ
- **状態**: ❌ **削除してOK**

### 3. `self-management-app-84ui`（不要なプロジェクト）
- **作成理由**: 
  - 別のブランチからデプロイされた
  - または、Vercelが自動的に別名でプロジェクトを作成した
  - または、以前の試行錯誤で作成された
- **特徴**: おそらくGitHub連携なし
- **状態**: ❌ **削除してOK**

## ✅ 推奨アクション

**`self-management-app`だけを残して、`app`と`self-management-app-84ui`を削除してください。**

## 🗑️ 削除方法

### 方法1: Vercelダッシュボードから削除（推奨）

1. https://vercel.com/dashboard にアクセス
2. プロジェクト一覧から削除したいプロジェクト（`app`または`self-management-app-84ui`）をクリック
3. 「Settings」タブを開く
4. ページの最下部までスクロール
5. 「Delete Project」セクションで「Delete」をクリック
6. プロジェクト名を入力して確認

### 方法2: Vercel CLIから削除

```bash
cd app

# appプロジェクトを削除
vercel link --project=app --yes
vercel remove app --yes

# self-management-app-84uiプロジェクトを削除
vercel link --project=self-management-app-84ui --yes
vercel remove self-management-app-84ui --yes
```

## ⚠️ 削除前の確認事項

1. **`self-management-app`に環境変数が設定されているか確認**
   ```bash
   cd app
   vercel link --project=self-management-app --yes
   vercel env ls
   ```
   
2. **`self-management-app`がGitHub連携されているか確認**
   - Vercelダッシュボードで`self-management-app`を開く
   - 「Settings」→「Git」でGitHubリポジトリが連携されているか確認

3. **削除するプロジェクトに重要なデータがないか確認**
   - 環境変数はプロジェクトごとに設定されるため、削除すると失われます
   - ただし、`app`と`self-management-app-84ui`は不要なので問題ありません

## 📝 今後の注意点

- **GitHubから自動デプロイする場合は、`vercel link`を使わない**
- **CLIでデプロイする場合は、既存のプロジェクトにリンクする**
- **新しいプロジェクトを作成する前に、既存のプロジェクトを確認する**



