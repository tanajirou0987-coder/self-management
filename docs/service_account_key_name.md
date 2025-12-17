# サービスアカウントキー（JSONファイル）の名前

## 📁 ファイル名の形式

サービスアカウントのキーを作成すると、JSONファイルが自動的にダウンロードされます。

**ファイル名の形式**:
```
プロジェクトID-ランダムな文字列.json
```

**例**:
- `self-management-app-123456-abc789def012.json`
- `my-project-789012-xyz456ghi789.json`
- `your-project-345678-123abc456def.json`

## 📍 ファイルの場所

ダウンロードしたJSONファイルは、通常以下の場所に保存されます：

- **Mac**: `~/Downloads/`（ダウンロードフォルダ）
- **Windows**: `C:\Users\ユーザー名\Downloads\`
- **Linux**: `~/Downloads/` または `~/ダウンロード/`

## 🔍 ファイルの見つけ方

### 方法1: ダウンロードフォルダを確認

1. ファイルマネージャー（Finder / エクスプローラー）を開く
2. 「ダウンロード」フォルダを開く
3. 最近ダウンロードした`.json`ファイルを探す
4. ファイル名にプロジェクトIDが含まれているものを確認

### 方法2: ターミナルで検索

```bash
# Mac/Linux
find ~/Downloads -name "*.json" -type f -mtime -7

# または、プロジェクト名で検索
find ~/Downloads -name "*self-management*" -o -name "*your-project*"
```

### 方法3: Google Cloud Consoleで確認

1. Google Cloud Console → 「IAMと管理」→「サービスアカウント」
2. サービスアカウントをクリック
3. 「キー」タブを確認
4. 作成日時から、どのキーが最近作成されたか確認できます

## 📝 JSONファイルの内容

JSONファイルを開くと、以下のような内容が含まれています：

```json
{
  "type": "service_account",
  "project_id": "your-project-123456",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "calendar-sync@your-project-123456.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## ⚠️ 重要な注意事項

- **ファイル名は重要ではありません**。内容（特に`private_key`と`client_email`）が重要です
- JSONファイルは**一度しかダウンロードできません**。紛失した場合は新しいキーを作成する必要があります
- JSONファイルには機密情報が含まれているため、**GitHubにコミットしないでください**
- `.gitignore`に追加されているか確認してください

## 🔑 必要な情報の抽出

環境変数に設定する際は、JSONファイルから以下の情報を取得します：

1. **`client_email`** → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
2. **`private_key`** → `GOOGLE_SERVICE_ACCOUNT_KEY`

ファイル名自体は使用しません。



