# Vercelダッシュボードから環境変数を修正する方法

## 問題
`error:1E08010C:DECODER routines::unsupported` エラーが発生している場合、`GOOGLE_SERVICE_ACCOUNT_KEY`の形式が正しくありません。

## 解決方法（Vercelダッシュボードから）

### 1. Vercelダッシュボードにアクセス

以下のURLにアクセス：
https://vercel.com/daijirous-projects/self-management-app/settings

### 2. 環境変数の設定画面を開く

1. 左メニューから「**Settings**」をクリック
2. 「**Environment Variables**」をクリック
   - もし見つからない場合は、「**Variables**」や「**Env**」という名前かもしれません

### 3. `GOOGLE_SERVICE_ACCOUNT_KEY`を削除

1. `GOOGLE_SERVICE_ACCOUNT_KEY`の行を見つける
2. 右側の「**削除**」または「**Delete**」ボタンをクリック
3. 確認ダイアログで「**削除**」をクリック

### 4. 新しい環境変数を追加

1. 「**Add New**」または「**新しい環境変数を追加**」ボタンをクリック
2. **Key**: `GOOGLE_SERVICE_ACCOUNT_KEY` と入力
3. **Value**: サービスアカウントのJSONファイルから`private_key`の値をコピーして貼り付け
   - JSONファイルをテキストエディタで開く
   - `"private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`の部分を見つける
   - **値だけをコピー**（前後のダブルクォート`"`は含めない）
   - `-----BEGIN PRIVATE KEY-----`から`-----END PRIVATE KEY-----`まで全体
4. **Environment**: `Production`にチェックを入れる
5. 「**Save**」または「**保存**」をクリック

### 5. デプロイを再実行

環境変数を追加した後、以下のいずれかの方法で再デプロイ：

#### 方法1: GitHubにプッシュ（自動デプロイ）

```bash
cd "/Users/daijiro/自己管理アプリ"
git commit --allow-empty -m "fix google service account key format"
git push origin main
```

#### 方法2: Vercel CLIからデプロイ

```bash
cd "/Users/daijiro/自己管理アプリ/app"
vercel --prod
```

### 6. 動作確認

デプロイが完了したら、アプリにアクセスしてGoogleカレンダーの同期が正常に動作するか確認してください。

## 注意事項

- JSONファイルから直接コピーすれば、`\n`として保存されているはずです
- 実際の改行が含まれている場合は、Vercelダッシュボードのテキストエリアに貼り付けると自動的に処理される可能性があります
- 前後に余分なスペースを追加しない
- 値が完全か確認してください（途中で切れていないか）

