# Googleカレンダー同期ができない場合のトラブルシューティング

## 🔍 現在の状態確認

### 1. 環境変数の確認

```bash
cd app
vercel link --project=self-management-app --yes
vercel env ls
```

**必要な環境変数（3つ）**:
- ✅ `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- ❌ `GOOGLE_SERVICE_ACCOUNT_KEY` ← **これが未設定**
- ❌ `GOOGLE_CALENDAR_ID` ← **これが未設定**

### 2. デバッグエンドポイントで確認

```bash
curl https://self-management-app.vercel.app/api/google/debug
```

**期待される結果**:
```json
{"configured":true,"message":"環境変数は設定されています"}
```

**現在の結果**:
```json
{"configured":false,"message":"環境変数が設定されていません"}
```

## ✅ 解決手順

### ステップ1: 環境変数を追加

#### GOOGLE_SERVICE_ACCOUNT_KEYを追加

```bash
cd app
vercel env add GOOGLE_SERVICE_ACCOUNT_KEY production
```

**値の取得方法**:
1. サービスアカウントのJSONファイルを開く（ダウンロードフォルダ）
2. `private_key`フィールドの値をコピー
   - `-----BEGIN PRIVATE KEY-----`から`-----END PRIVATE KEY-----`まで全体
   - 改行は`\n`のまま（そのままでOK）
3. プロンプトで値を貼り付けてEnter
4. 環境を選択: `Production` → Enter

**例**:
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

#### GOOGLE_CALENDAR_IDを追加

```bash
vercel env add GOOGLE_CALENDAR_ID production
```

**値の取得方法**:
1. https://calendar.google.com/ にアクセス
2. 左サイドバーで連携したいカレンダーの「︙」をクリック
3. 「設定と共有」を選択
4. 「カレンダーの統合」セクションまでスクロール
5. 「カレンダーID」をコピー
   - 例: `abc123def456@group.calendar.google.com`
   - または、プライマリカレンダー: `your-email@gmail.com`
6. プロンプトで値を貼り付けてEnter
7. 環境を選択: `Production` → Enter

### ステップ2: 環境変数の確認

```bash
vercel env ls
```

**3つすべて表示されれば成功**:
```
 name                               value               environments        created    
 GOOGLE_SERVICE_ACCOUNT_EMAIL       Encrypted           Production          ...
 GOOGLE_SERVICE_ACCOUNT_KEY         Encrypted           Production          ...
 GOOGLE_CALENDAR_ID                 Encrypted           Production          ...
```

### ステップ3: デプロイを再実行

環境変数を追加した後、**必ずデプロイを再実行**してください：

```bash
vercel --prod
```

または、GitHubにプッシュして自動デプロイ：

```bash
cd ..
git commit --allow-empty -m "add google env vars"
git push origin main
```

**⚠️ 重要**: 環境変数を追加しただけでは反映されません。デプロイが必要です。

### ステップ4: デプロイ完了を確認

1. Vercelダッシュボードで最新のデプロイが完了しているか確認
   - https://vercel.com/dashboard → `self-management-app` → Deployments

2. デバッグエンドポイントで確認：
   ```bash
   curl https://self-management-app.vercel.app/api/google/debug
   ```
   - `{"configured":true}` と表示されればOK

### ステップ5: カレンダー共有設定の確認

環境変数が正しく設定されても、カレンダーにサービスアカウントを共有していないと同期できません。

1. **Googleカレンダーを開く**
   - https://calendar.google.com/

2. **カレンダーの設定を開く**
   - 左サイドバーで連携したいカレンダーの「︙」をクリック
   - 「設定と共有」を選択

3. **「特定のユーザーと共有」セクションを確認**
   - 「ユーザーを追加」をクリック
   - サービスアカウントのメールアドレスを入力
     - 例: `calendar-sync@your-project-123456.iam.gserviceaccount.com`
   - 権限を「予定の表示（すべての予定の詳細）」に設定
   - 「送信」をクリック

4. **サービスアカウントのメールアドレスを確認**
   ```bash
   vercel env ls | grep GOOGLE_SERVICE_ACCOUNT_EMAIL
   ```
   - または、Google Cloud Console → サービスアカウント → メールアドレスをコピー

## 🔍 よくある問題

### 問題1: 環境変数を追加したけど反映されない

**原因**: デプロイが完了していない

**解決方法**:
1. `vercel --prod`を実行
2. または、GitHubにプッシュして自動デプロイ
3. Vercelダッシュボードでデプロイが完了するまで待つ（通常1-2分）

### 問題2: 認証エラー（401/403）

**原因**: 
- カレンダーにサービスアカウントが共有されていない
- サービスアカウントキーが間違っている

**解決方法**:
1. カレンダーの共有設定を確認（上記のステップ5を参照）
2. サービスアカウントキーが正しいか確認
3. Google Cloud ConsoleでGoogle Calendar APIが有効になっているか確認

### 問題3: カレンダーIDが間違っている

**原因**: カレンダーIDのコピー時に余分なスペースが入った

**解決方法**:
1. カレンダー設定から再度コピー
2. 余分なスペースがないか確認
3. 環境変数を削除して再追加：
   ```bash
   vercel env rm GOOGLE_CALENDAR_ID production
   vercel env add GOOGLE_CALENDAR_ID production
   ```

## 📚 関連ドキュメント

- サービスアカウントのメールアドレス: `docs/find_service_account_email.md`
- サービスアカウントキー: `docs/service_account_key_name.md`
- カレンダーID: `docs/find_calendar_id.md`
- 環境変数の追加: `docs/add_env_vars_now.md`



