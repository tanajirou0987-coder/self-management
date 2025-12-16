# Google Service Account Key の修正手順

## 問題
`error:1E08010C:DECODER routines::unsupported` エラーが発生している場合、`GOOGLE_SERVICE_ACCOUNT_KEY`の形式が正しくありません。

## 解決方法

### 1. ターミナルで以下のコマンドを実行

```bash
cd "/Users/daijiro/自己管理アプリ/app"
vercel env rm GOOGLE_SERVICE_ACCOUNT_KEY production
```

### 2. プロンプトが表示されたら

以下のようなメッセージが表示されます：
```
? Removing Environment Variable "GOOGLE_SERVICE_ACCOUNT_KEY" from Production in
Project self-management-app. Are you sure? (y/N)
```

**`y`と入力してEnterキーを押してください。**

### 3. 削除が完了したら、再追加

```bash
vercel env add GOOGLE_SERVICE_ACCOUNT_KEY production
```

### 4. プロンプトが表示されたら

`What's the value of GOOGLE_SERVICE_ACCOUNT_KEY?` と表示されます。

**ここで、JSONファイルから`private_key`の値をコピーして貼り付けてください。**

#### JSONファイルから値を取得する方法：

1. サービスアカウントのJSONファイルをテキストエディタで開く
2. `"private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`の部分を見つける
3. **値だけをコピー**（前後のダブルクォート`"`は含めない）
   - `-----BEGIN PRIVATE KEY-----`から`-----END PRIVATE KEY-----`まで全体
   - JSONファイル内では`\n`として保存されているので、そのままコピーすればOK

4. コピーした値をターミナルに貼り付けてEnter

### 5. 環境を選択

`? Select the Environment(s) for GOOGLE_SERVICE_ACCOUNT_KEY:` と表示されたら：
- `Production`を選択（通常は`1`を入力）
- Enterキーを押す

### 6. 確認

```bash
vercel env ls
```

`GOOGLE_SERVICE_ACCOUNT_KEY`が表示されればOKです。

### 7. デプロイを再実行

```bash
vercel --prod
```

または、GitHubにプッシュ：

```bash
cd ..
git commit --allow-empty -m "fix google service account key format"
git push origin main
```

## 注意事項

- JSONファイルから直接コピーすれば、`\n`として保存されているはずです
- 実際の改行が含まれている場合は、`\n`に変換する必要があります
- 前後に余分なスペースを追加しない
- 値が完全か確認してください（途中で切れていないか）

