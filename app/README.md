## 自己管理アプリ（モバイル最適化ダッシュボード）

Next.js（App Router）+ Tailwind v4 + Supabase + Google Calendar を土台にした自己管理アプリです。  
予定 / タスク / 1日の振り返り / 翌日の目標設定 / チェックリストテンプレを1画面に集約し、Supabase への自動保存と Google カレンダー同期を想定した構成になっています。

### 技術スタック

- Next.js 16 (App Router, React 19)
- Tailwind CSS v4（`@tailwindcss/postcss` プラグイン）
- Supabase (`@supabase/supabase-js`) による永続化
- Google Calendar API (`googleapis`) との双方向同期エンドポイント
- date-fns, lucide-react, uuid など

## セットアップ手順

1. 依存関係をインストール

   ```bash
   npm install
   ```

2. 環境変数を `.env.local` に設定

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<Supabase プロジェクト URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>

   GOOGLE_SERVICE_ACCOUNT_EMAIL=<サービスアカウントのメールアドレス>
   GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CALENDAR_ID=<同期対象カレンダーID（例: xxxxx@group.calendar.google.com）>

   # アクセス制限用
   APP_ACCESS_CODE=<共有するアクセスコード（例: my-secret-code）>
   APP_SESSION_TOKEN=<ランダムな長い文字列（例: openssl rand -hex 32）>
   ```

   - サービスアカウントは Google Cloud で作成し、対象カレンダーに予定の閲覧権限を付与してください。
   - `GOOGLE_SERVICE_ACCOUNT_KEY` は改行を `\n` でエスケープした文字列で格納します。
   - `APP_ACCESS_CODE` がログイン画面で入力するパスコード、`APP_SESSION_TOKEN` はブラウザ Cookie に保存されるトークンです。想定ユーザーにのみ共有してください。

3. Supabase に `dashboard_snapshots` テーブルを作成（SQL 例）

   ```sql
   create table if not exists dashboard_snapshots (
     date text primary key,
     payload jsonb not null,
     updated_at timestamp with time zone default now()
   );
   ```

   1レコードに1日のスナップショット（予定/タスク/振り返りなどの JSON）が保存されます。  
   環境変数を設定しない場合はブラウザ localStorage のみで動作します。

4. 開発サーバーを起動

   ```bash
   npm run dev
   ```

   http://localhost:3000 を開くとダッシュボードを確認できます。

## 主な画面

- **ヘッダー**：日付移動、同期状況の表示。
- **予定カード**：Google カレンダー同期ボタンと日内予定一覧。
- **タスク管理**：優先度/ステータスの切り替え・追加。
- **翌日目標**：目標追加／完了チェック。
- **振り返り**：ムード選択、チェックリスト、メモ入力。
- **チェックリストテンプレ**：項目の編集・追加・削除（振り返りに即時反映）。

## Google カレンダー同期について

- `src/app/api/google/sync/route.ts` が Google Calendar API へアクセスします。
- サービスアカウント方式で認証しており、対象カレンダーに読み取り権限が必要です。
- フロントエンドの「同期」ボタンから `/api/google/sync?date=YYYY-MM-DD` を呼び出します。
- 取得したイベントは Supabase / localStorage へ自動保存されます。

## Supabase 永続化

- `src/lib/snapshotStorage.ts` にて Supabase と localStorage へスナップショットを保存します。
- Supabase の資格情報がない場合でもローカルのみで動作するため、開発段階でも利用可能です。

- `.env.local` に `APP_ACCESS_CODE` と `APP_SESSION_TOKEN` を設定すると、全ページがミドルウェアで保護され `/login` 画面経由でのみアクセスできます。
- 指定コードでログインすると Cookie に `APP_SESSION_TOKEN` が保存され、最大30日間アクセス可能です。
- ログアウトはダッシュボード右上のボタンから実行でき、`/api/auth/logout` でセッション Cookie を削除します。

## スマホでのインストール（PWA）

このアプリはPWA（Progressive Web App）として動作し、スマホのホーム画面にインストールできます。

### Android（Chrome）

1. スマホのChromeブラウザでアプリにアクセス
2. 画面下部に「アプリをインストール」プロンプトが表示されたら、タップしてインストール
3. または、ブラウザメニュー（右上の3点）→「アプリをインストール」を選択

### iOS（Safari）

1. スマホのSafariブラウザでアプリにアクセス
2. 画面下部の共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」を選択
4. 名前を確認して「追加」をタップ

インストール後は、ホーム画面のアイコンからアプリを起動でき、オフラインでも利用できます。

## スクリプト

- `npm run dev` : 開発サーバー
- `npm run build` : 本番ビルド
- `npm run start` : 本番サーバー
- `npm run lint` : ESLint（Next.js 推奨設定）

詳細な要件は `docs/requirements.md` を参照してください。
