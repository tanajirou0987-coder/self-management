# Google Service Account Key エラーの修正方法

## 🔍 エラー内容

```
Google カレンダー連携で問題が発生しました: error:1E08010C:DECODER routines::unsupported
```

このエラーは、`GOOGLE_SERVICE_ACCOUNT_KEY`の形式が正しくないことを示しています。

## 🔍 原因

- 秘密鍵の値に余分な文字が含まれている
- 改行文字が正しく処理されていない
- 秘密鍵の値が不完全

## ✅ 解決方法

### ステップ1: 環境変数を削除

```bash
cd app
vercel link --project=self-management-app --yes
vercel env rm GOOGLE_SERVICE_ACCOUNT_KEY production
```

### ステップ2: 正しい形式で再追加

```bash
vercel env add GOOGLE_SERVICE_ACCOUNT_KEY production
```

**値の取得方法（重要）**:

1. **サービスアカウントのJSONファイルを開く**
   - ダウンロードフォルダにあるJSONファイルをテキストエディタで開く

2. **`private_key`フィールドの値をコピー**
   - JSONファイル内の`private_key`フィールドを見つける
   - 値は以下のような形式です：
     ```json
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
     ```

3. **値をそのままコピー**
   - `-----BEGIN PRIVATE KEY-----`から`-----END PRIVATE KEY-----`まで全体をコピー
   - **改行は`\n`のまま**（そのままでOK）
   - 前後のダブルクォート（`"`）は含めない
   - 余分なスペースや改行を追加しない

4. **プロンプトで値を貼り付け**
   - `vercel env add`コマンドを実行
   - プロンプトが表示されたら、コピーした値を貼り付け
   - Enterを押す

5. **環境を選択**
   - `Production` → Enter

### ステップ3: 確認

```bash
vercel env ls
```

`GOOGLE_SERVICE_ACCOUNT_KEY`が表示されれば成功です。

### ステップ4: デプロイを再実行

環境変数を再設定した後、デプロイを再実行：

```bash
vercel --prod
```

または、GitHubにプッシュ：

```bash
cd ..
git commit --allow-empty -m "fix google service account key"
git push origin main
```

## 📝 正しい形式の例

**正しい形式**:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

**間違った形式**:
- 改行が実際の改行になっている（`\n`ではなく実際の改行）
- 前後に余分なスペースがある
- ダブルクォートが含まれている
- 値が不完全（途中で切れている）

## 🔍 トラブルシューティング

### まだエラーが発生する場合

1. **JSONファイルを再度確認**
   - JSONファイルが破損していないか確認
   - 新しいキーを作成する必要がある場合もあります

2. **環境変数の値を確認**
   - Vercelダッシュボードで環境変数の値を確認
   - ただし、値は暗号化されているため、直接確認はできません

3. **新しいサービスアカウントキーを作成**
   - Google Cloud Console → サービスアカウント → キー
   - 新しいキーを作成してダウンロード
   - 新しいキーの`private_key`を使用

## ⚠️ 注意事項

- 秘密鍵は機密情報です。GitHubにコミットしないでください
- JSONファイルは安全に保管してください
- 秘密鍵を共有しないでください



