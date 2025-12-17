# VercelのRoot Directory設定を修正する方法

## 🔍 問題

エラーメッセージ：
```
Error: The provided path "~/自己管理アプリ/app/app" does not exist.
```

Vercelのプロジェクト設定でRoot Directoryが間違っています。

## ✅ 解決方法

### VercelダッシュボードでRoot Directoryを修正

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/daijirous-projects/self-management-app/settings にアクセス
   - または、https://vercel.com/dashboard → `self-management-app` → Settings

2. **「General」タブを開く**
   - 左サイドバーから「General」をクリック

3. **「Root Directory」セクションを探す**
   - ページを下にスクロール
   - 「Root Directory」セクションを探す

4. **Root Directoryを修正**
   - 現在の値: `~/自己管理アプリ/app/app` または `app/app`
   - **正しい値**: `app`
   - 「Edit」ボタンをクリック
   - `app`と入力
   - 「Save」をクリック

5. **確認**
   - Root Directoryが`app`になっていることを確認

## 📝 補足

- Root Directoryは、リポジトリのルートから見た相対パスです
- このプロジェクトの場合、`app`ディレクトリがNext.jsアプリケーションのルートです
- 正しい設定: `app`
- 間違った設定: `app/app` または `~/自己管理アプリ/app/app`

## 🔄 設定変更後のデプロイ

Root Directoryを変更した後、自動的に再デプロイが実行されます。完了まで数分かかります。

デプロイ完了後、以下を確認：
- `https://self-management-app.vercel.app` にアクセス
- アプリが正常に動作するか確認



