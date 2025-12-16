# VercelでGOOGLE_SERVICE_ACCOUNT_KEYを正しく設定する方法

## 🔍 問題

`error:1E08010C:DECODER routines::unsupported` エラーが発生している場合、`GOOGLE_SERVICE_ACCOUNT_KEY`の形式が正しくありません。

## ✅ 解決方法（確実な手順）

### ステップ1: JSONファイルを準備

1. **サービスアカウントのJSONファイルを開く**
   - ダウンロードフォルダにあるJSONファイルをテキストエディタで開く

2. **`private_key`フィールドを確認**
   - JSONファイル内で`"private_key"`フィールドを見つける
   - 値は以下のような形式です：
     ```json
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDvAvmu039ZcVHn\nuOQFmFOqzBKtGFTeD4TGJ3wlIiQ9SZ9oUHPGe2ht6BVfw2ECPIPz45i0NqXg0tsf\n...（続く）...\n-----END PRIVATE KEY-----\n"
     ```

### ステップ2: Vercelダッシュボードで環境変数を設定

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/daijirous-projects/self-management-app/settings を開く

2. **Settings → Environment Variables を開く**

3. **既存の`GOOGLE_SERVICE_ACCOUNT_KEY`を削除**
   - `GOOGLE_SERVICE_ACCOUNT_KEY`の行を見つける
   - 右側の「**削除**」または「**Delete**」ボタンをクリック
   - 確認ダイアログで「**削除**」をクリック

4. **新しい環境変数を追加**
   - 「**Add New**」または「**新しい環境変数を追加**」ボタンをクリック
   - **Key**: `GOOGLE_SERVICE_ACCOUNT_KEY` と入力

5. **Valueの設定（重要）**
   
   **方法A: JSONファイルから直接コピー（推奨）**
   
   - JSONファイルをテキストエディタで開く
   - `"private_key": "` の後の値を見つける
   - `"` の前までを選択してコピー
   - つまり、`-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` の部分だけをコピー
   - **前後のダブルクォート（`"`）は含めない**
   - VercelのValueフィールドに貼り付け
   
   **方法B: ターミナルで抽出（より確実）**
   
   ```bash
   # JSONファイルのパスを指定
   cat /path/to/your-service-account.json | jq -r '.private_key'
   ```
   
   このコマンドの出力をコピーして、VercelのValueフィールドに貼り付け

6. **Environment**: `Production`にチェックを入れる

7. **Save**をクリック

### ステップ3: デプロイを再実行

環境変数を追加した後、以下のいずれかの方法で再デプロイ：

#### 方法1: GitHubにプッシュ（自動デプロイ）

```bash
cd "/Users/daijiro/自己管理アプリ"
git commit --allow-empty -m "trigger redeploy for env vars"
git push origin main
```

#### 方法2: Vercel CLIからデプロイ

```bash
cd "/Users/daijiro/自己管理アプリ/app"
vercel --prod
```

### ステップ4: 動作確認

1. **デプロイが完了したら、アプリにアクセス**
   - https://self-management-app.vercel.app

2. **Googleカレンダーの同期を試す**
   - カレンダーイベントが表示されるか確認

3. **エラーが発生する場合**
   - ブラウザの開発者ツール（F12）でコンソールを確認
   - エラーメッセージの詳細を確認

## 🔍 トラブルシューティング

### エラーが続く場合

1. **デバッグエンドポイントで確認**
   ```
   https://self-management-app.vercel.app/api/google/debug
   ```
   - 環境変数が設定されているか確認

2. **環境変数の値を確認**
   - Vercelダッシュボードで`GOOGLE_SERVICE_ACCOUNT_KEY`の値を確認
   - 値が正しく保存されているか確認
   - 値が途中で切れていないか確認

3. **JSONファイルを再確認**
   - JSONファイルが正しいか確認
   - `private_key`フィールドが存在するか確認
   - 値が完全か確認（途中で切れていないか）

4. **サービスアカウントの権限を確認**
   - Google Cloud Consoleでサービスアカウントの権限を確認
   - カレンダーへのアクセス権限があるか確認

## ⚠️ 注意事項

- **前後のダブルクォート（`"`）は含めない**
- **余分なスペースを追加しない**
- **値が完全か確認する**（途中で切れていないか）
- **`-----BEGIN PRIVATE KEY-----`から`-----END PRIVATE KEY-----`まで全体を含める**
- **改行は`\n`のまま**（実際の改行に変換しない）

