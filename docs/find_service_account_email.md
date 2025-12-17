# サービスアカウントのメールアドレス確認方法

## 📍 確認手順

### 方法1: Google Cloud Consoleから確認（推奨）

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/ にアクセス
   - Googleアカウントでログイン

2. **プロジェクトを選択**
   - 画面上部の「プロジェクトを選択」をクリック
   - 使用しているプロジェクトを選択
   - プロジェクトがない場合は、新規作成

3. **サービスアカウント一覧を開く**
   - 左メニューから **「IAMと管理」** → **「サービスアカウント」** をクリック
   - または、検索ボックスに「サービスアカウント」と入力して選択

4. **サービスアカウントのメールアドレスを確認**
   - サービスアカウント一覧が表示されます
   - **「メール」** 列に表示されているメールアドレスをコピー
   - 形式: `サービスアカウント名@プロジェクトID.iam.gserviceaccount.com`
   - 例: `calendar-sync@your-project-123456.iam.gserviceaccount.com`

### 方法2: JSONファイルから確認

サービスアカウントのキー（JSONファイル）をダウンロード済みの場合：

1. **JSONファイルを開く**
   - テキストエディタで開く

2. **`client_email`フィールドを確認**
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-123456",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "calendar-sync@your-project-123456.iam.gserviceaccount.com",
     ...
   }
   ```
   - `client_email`の値がサービスアカウントのメールアドレスです

### 方法3: サービスアカウントの詳細ページから確認

1. **サービスアカウント一覧を開く**
   - Google Cloud Console → 「IAMと管理」→「サービスアカウント」

2. **サービスアカウント名をクリック**
   - 詳細ページが開きます

3. **「詳細」タブを確認**
   - 「メール」フィールドにメールアドレスが表示されます
   - このメールアドレスをコピー

## 📝 メールアドレスの形式

サービスアカウントのメールアドレスは以下の形式です：

```
サービスアカウント名@プロジェクトID.iam.gserviceaccount.com
```

例：
- `calendar-sync@self-management-app-123456.iam.gserviceaccount.com`
- `my-service@my-project-789012.iam.gserviceaccount.com`

## ⚠️ 注意事項

- サービスアカウントのメールアドレスは、Googleカレンダーに共有する際に使用します
- このメールアドレスは変更できません（新規作成が必要）
- メールアドレスを忘れた場合は、Google Cloud Consoleで確認できます

## 🔗 関連リンク

- [Google Cloud Console](https://console.cloud.google.com/)
- [サービスアカウントのドキュメント](https://cloud.google.com/iam/docs/service-accounts)



