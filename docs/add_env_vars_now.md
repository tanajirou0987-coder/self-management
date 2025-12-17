# 環境変数を今すぐ追加する手順

`self-management-app`プロジェクトに残りの2つの環境変数を追加してください。

## ✅ 現在の状態

- ✅ `GOOGLE_SERVICE_ACCOUNT_EMAIL` - 設定済み
- ❌ `GOOGLE_SERVICE_ACCOUNT_KEY` - **未設定**
- ❌ `GOOGLE_CALENDAR_ID` - **未設定**

## 🚀 追加手順

### 1. GOOGLE_SERVICE_ACCOUNT_KEYを追加

```bash
cd app
vercel env add GOOGLE_SERVICE_ACCOUNT_KEY production
```

**値の取得方法**:
1. サービスアカウントのJSONファイルを開く（ダウンロードフォルダにある）
2. `private_key`フィールドの値をコピー
   - `-----BEGIN PRIVATE KEY-----`から`-----END PRIVATE KEY-----`まで全体をコピー
   - 改行は`\n`のまま（そのままでOK）
3. コマンド実行後、プロンプトで値を貼り付けてEnter
4. 環境を選択: `Production` → Enter

**例**:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

### 2. GOOGLE_CALENDAR_IDを追加

```bash
vercel env add GOOGLE_CALENDAR_ID production
```

**値の取得方法**:
1. https://calendar.google.com/ にアクセス
2. 左サイドバーで連携したいカレンダーを見つける
3. カレンダー名の横の「︙（三点メニュー）」をクリック
4. 「設定と共有」を選択
5. 「カレンダーの統合」セクションまでスクロール
6. 「カレンダーID」をコピー
   - 例: `abc123def456@group.calendar.google.com`
   - または、プライマリカレンダーの場合: `your-email@gmail.com`
7. コマンド実行後、プロンプトで値を貼り付けてEnter
8. 環境を選択: `Production` → Enter

### 3. 環境変数の確認

```bash
vercel env ls
```

3つすべて表示されれば成功です：
```
 name                               value               environments        created    
 GOOGLE_SERVICE_ACCOUNT_EMAIL       Encrypted           Production          ...
 GOOGLE_SERVICE_ACCOUNT_KEY         Encrypted           Production          ...
 GOOGLE_CALENDAR_ID                 Encrypted           Production          ...
```

### 4. デプロイを再実行

環境変数を追加した後、デプロイを再実行：

```bash
vercel --prod
```

または、GitHubにプッシュして自動デプロイ：

```bash
cd ..
git commit --allow-empty -m "add google env vars"
git push origin main
```

## 🔍 確認

デプロイ完了後、以下を確認：

1. `https://self-management-app.vercel.app` にアクセス
2. ログインしてダッシュボードを開く
3. 「同期」ボタンをクリック
4. Googleカレンダーの予定が表示されれば成功！

## ⚠️ トラブルシューティング

### 環境変数が反映されない場合

1. **デプロイが完了しているか確認**
   - Vercelダッシュボードで最新のデプロイが成功しているか確認

2. **デバッグエンドポイントで確認**
   ```bash
   curl https://self-management-app.vercel.app/api/google/debug
   ```
   - `{"configured":true}` と表示されればOK

3. **環境変数の値が正しいか確認**
   - `GOOGLE_SERVICE_ACCOUNT_KEY`: JSONファイルの`private_key`をそのままコピー
   - `GOOGLE_CALENDAR_ID`: カレンダー設定から正確にコピー（余分なスペースなし）

## 📚 詳細なガイド

- サービスアカウントのメールアドレス: `docs/find_service_account_email.md`
- サービスアカウントキー: `docs/service_account_key_name.md`
- カレンダーID: `docs/find_calendar_id.md`



